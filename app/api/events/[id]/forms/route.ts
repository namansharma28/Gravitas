import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId, Document } from 'mongodb';

interface Form extends Document {
  _id: ObjectId;
  eventId: string;
  title: string;
  description: string;
  fields: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }[];
  responses: FormResponse[];
  createdAt: Date;
  updatedAt: Date;
}

interface FormResponse extends Document {
  _id: ObjectId;
  formId: string;
  userId: ObjectId;
  user?: {
    name: string;
    email: string;
  };
  answers: {
    fieldId: string;
    value: string | boolean | number;
  }[];
  createdAt: Date;
}

interface AggregatedForm extends Form {
  responses: FormResponse[];
  responseUsers: any[];
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, fields, eventId } = data;

    // Validate fields with options
    for (const field of fields) {
      if ((field.type === 'select' || field.type === 'checkbox') && (!field.options || field.options.length === 0)) {
        return NextResponse.json(
          { error: `Field "${field.label}" requires at least one option` },
          { status: 400 }
        );
      }
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Verify event exists and user has permission
    const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get community to check permissions
    const community = await db.collection('communities').findOne({ 
      _id: new ObjectId(event.communityId) 
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can create forms
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);
    const isCreator = event.creatorId === session.user.id;

    if (!isAdmin && !isMember && !isCreator) {
      return NextResponse.json({ error: 'Not authorized to create forms' }, { status: 403 });
    }

    // Create new form
    const form = await db.collection('forms').insertOne({
      title,
      description,
      fields,
      eventId,
      createdBy: session.user.id,
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      id: form.insertedId,
      title,
      description,
      fields,
      eventId,
      createdBy: session.user.id,
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create form' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Validate ObjectId format
    if (!ObjectId.isValid(params.id)) {
      console.error("[FORMS_GET] Invalid ObjectId format:", params.id);
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    // Get the event to verify it exists and user has access
    const event = await db.collection("events").findOne({
      _id: new ObjectId(params.id),
    });

    if (!event) {
      console.error("[FORMS_GET] Event not found:", params.id);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get all forms for this event with their responses
    const forms = await db.collection<Form>("forms")
      .aggregate<AggregatedForm>([
        { $match: { eventId: params.id } },
        {
          $lookup: {
            from: "formResponses",
            localField: "_id",
            foreignField: "formId",
            as: "responses"
          }
        },
        {
          $lookup: {
            from: "users",
            let: { userIds: "$responses.userId" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$userIds"] } } }
            ],
            as: "responseUsers"
          }
        }
      ])
      .toArray();

    console.log("[FORMS_GET] Found forms:", forms.length);

    // Transform the data to match the frontend interface
    const transformedForms = forms.map((form) => ({
      id: form._id.toString(),
      title: form.title,
      description: form.description,
      fields: form.fields,
      responses: form.responses.map((response) => {
        const user = form.responseUsers.find(u => u._id.toString() === response.userId.toString());
        return {
          id: response._id.toString(),
          formId: response.formId,
          userId: response.userId.toString(),
          user: {
            name: user?.name || "Unknown User",
            email: user?.email || "No email",
          },
          answers: response.answers,
          createdAt: response.createdAt,
        };
      }),
      createdAt: form.createdAt,
    }));

    return NextResponse.json(transformedForms);
  } catch (error) {
    console.error("[FORMS_GET] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get the form ID from the URL
    const formId = request.url.split("/forms/")[1];
    if (!ObjectId.isValid(formId)) {
      return NextResponse.json(
        { error: 'Invalid form ID' },
        { status: 400 }
      );
    }

    // Delete the form and its responses
    await db.collection("forms").deleteOne({
      _id: new ObjectId(formId),
      eventId: params.id,
    });

    await db.collection("formResponses").deleteMany({
      formId: formId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORMS_DELETE] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
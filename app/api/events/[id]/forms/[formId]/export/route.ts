import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import * as XLSX from 'xlsx';

export async function GET(
  request: Request,
  { params }: { params: { id: string; formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!ObjectId.isValid(params.formId) || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid form ID or event ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("gravitas");

    // Verify that the event exists and user has permission
    const event = await db.collection("events").findOne({
      _id: new ObjectId(params.id),
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get community to check permissions
    const community = await db.collection('communities').findOne({ 
      _id: new ObjectId(event.communityId) 
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can export data (admin or member)
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to export data' }, { status: 403 });
    }

    // Get the form
    const form = await db.collection("forms").findOne({
      _id: new ObjectId(params.formId),
      eventId: params.id,
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Get form responses with user details
    const responses = await db.collection("formResponses")
      .aggregate([
        { 
          $match: { 
            formId: new ObjectId(params.formId),
            eventId: new ObjectId(params.id)
          } 
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $sort: { createdAt: 1 } }
      ])
      .toArray();

    // Prepare data for Excel export
    const worksheetData: (string | number | boolean)[][] = [];

    // Add header row
    const headers = [
      'Response ID',
      'Participant Name',
      'Email',
      'Status',
      'Submitted At',
      ...form.fields.map((field: any) => field.label)
    ];
    worksheetData.push(headers);

    // Add data rows
    responses.forEach((response: any) => {
      const user = response.user[0];
      const row = [
        response._id.toString(),
        user?.name || 'Unknown',
        user?.email || 'No email',
        response.shortlisted ? 'Shortlisted' : 'Pending',
        new Date(response.createdAt).toLocaleString(),
      ];

      // Add field answers
      form.fields.forEach((field: any) => {
        const answer = response.answers.find((a: any) => a.fieldId === field.id);
        let value = '';
        
        if (answer) {
          if (Array.isArray(answer.value)) {
            value = answer.value.join(', ');
          } else if (typeof answer.value === 'boolean') {
            value = answer.value ? 'Yes' : 'No';
          } else {
            value = String(answer.value);
          }
        }
        
        row.push(value);
      });

      worksheetData.push(row);
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns
    const colWidths = headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...worksheetData.slice(1).map(row => String(row[index] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Responses');

    // Add summary sheet
    const summaryData = [
      ['Form Export Summary'],
      [''],
      ['Event:', event.title],
      ['Form:', form.title],
      ['Export Date:', new Date().toLocaleString()],
      ['Total Responses:', responses.length],
      ['Shortlisted:', responses.filter((r: any) => r.shortlisted).length],
      ['Pending:', responses.filter((r: any) => !r.shortlisted).length],
      [''],
      ['Field Summary:'],
      ['Field Name', 'Type', 'Required'],
      ...form.fields.map((field: any) => [
        field.label,
        field.type,
        field.required ? 'Yes' : 'No'
      ])
    ];

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Create filename
    const sanitizedEventTitle = event.title.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedFormTitle = form.title.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedEventTitle}_${sanitizedFormTitle}_${timestamp}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting form responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
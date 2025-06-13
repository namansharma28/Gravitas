import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get events user is registered for
    const userEvents = await db.collection('eventRegistrations')
      .aggregate([
        { $match: { userId: new ObjectId(session.user.id) } },
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },
        {
          $lookup: {
            from: 'communities',
            let: { communityId: { $toObjectId: '$event.communityId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$communityId'] } } }
            ],
            as: 'community'
          }
        },
        { $unwind: '$community' },
        {
          $addFields: {
            status: {
              $cond: {
                if: { $gte: ['$event.date', new Date().toISOString().split('T')[0]] },
                then: 'upcoming',
                else: 'past'
              }
            }
          }
        },
        { $sort: { 'event.date': 1 } }
      ])
      .toArray();

    // Transform the data
    const transformedEvents = userEvents.map(item => ({
      _id: item.event._id.toString(),
      title: item.event.title,
      description: item.event.description,
      date: item.event.date,
      time: item.event.time,
      location: item.event.location,
      image: item.event.image,
      community: {
        name: item.community.name,
        handle: item.community.handle,
        avatar: item.community.avatar,
      },
      status: item.status,
      userRegistered: true,
    }));

    return NextResponse.json(transformedEvents);
  } catch (error: any) {
    console.error('Error fetching user events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user events' },
      { status: 500 }
    );
  }
}
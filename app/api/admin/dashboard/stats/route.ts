import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verify } from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');
      if (!decoded || (decoded as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get platform stats
    const [
      totalUsers,
      totalCommunities,
      totalEvents,
      totalRegistrations,
      recentUsers
    ] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection('communities').countDocuments({}),
      db.collection('events').countDocuments({}),
      db.collection('eventRegistrations').countDocuments({}),
      db.collection('users')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .project({
          _id: 1,
          name: 1,
          email: 1,
          createdAt: 1
        })
        .toArray()
    ]);

    // Get monthly growth data
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const monthlyGrowth = await db.collection('users').aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]).toArray();

    return NextResponse.json({
      totalUsers,
      totalCommunities,
      totalEvents,
      totalRegistrations,
      recentUsers,
      monthlyGrowth
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '@/lib/admin-auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(adminAuthOptions);
    
    // Check if the user is an admin
    if (!session || (session.user as any).role !== 'admin') {
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
      recentUsers: recentUsers.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })),
      monthlyGrowth: monthlyGrowth.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        users: item.count
      }))
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
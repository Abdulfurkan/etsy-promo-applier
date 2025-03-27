import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TokenEvent from '@/models/TokenEvent';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Get the most recent token events
    const events = await TokenEvent.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching token events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token events' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Add IP and user agent if available from headers
    const headers = Object.fromEntries(request.headers);
    if (headers['x-forwarded-for']) {
      data.ipAddress = headers['x-forwarded-for'];
    }
    if (headers['user-agent']) {
      data.userAgent = headers['user-agent'];
    }
    
    // Create a new token event
    const event = await TokenEvent.create(data);
    
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error creating token event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create token event' },
      { status: 500 }
    );
  }
}

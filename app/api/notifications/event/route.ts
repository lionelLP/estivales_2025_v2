import { NextResponse } from 'next/server';
import { notifySubscribersAboutNewEvent } from '@/lib/notifications/eventNotifications';

export async function POST(request: Request) {
  try {
    const eventData = await request.json();
    
    await notifySubscribersAboutNewEvent(eventData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send event notifications:', error);
    return NextResponse.json(
      { success: false, message: "Failed to send notifications" },
      { status: 500 }
    );
  }
} 
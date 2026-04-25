import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    let events;
    if (decoded.role === 'STUDENT') {
      // Students see only non-DRAFT events
      events = await prisma.event.findMany({
        where: { status: { not: 'DRAFT' } },
        include: { semester: true, _count: { select: { registrations: true } } },
        orderBy: { startTime: 'asc' },
      });
    } else {
      // Admins see all
      events = await prisma.event.findMany({
        include: { semester: true, _count: { select: { registrations: true } } },
        orderBy: { startTime: 'asc' },
      });
    }

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const { semesterId, title, description, imageUrl, location, startTime, endTime, registrationStart, registrationEnd, daysPerSession, maxParticipants } = body;

    if (!title || !location || !startTime || !registrationStart || !registrationEnd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        semesterId,
        title,
        description,
        imageUrl,
        location,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        registrationStart: new Date(registrationStart),
        registrationEnd: new Date(registrationEnd),
        daysPerSession,
        maxParticipants,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    console.error("CREATE ERROR:", error);
    return NextResponse.json({ success: false, error: "Create failed" }, { status: 500 });
  }
}
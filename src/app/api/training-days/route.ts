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
        include: { semester: true },
        orderBy: { startTime: 'asc' },
      });
    } else {
      // Admins see all
      events = await prisma.event.findMany({
        include: { semester: true },
        orderBy: { startTime: 'asc' },
      });
    }

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Training days fetch error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
    console.log("CREATE EVENT BODY:", body);

    const { semesterId, title, description, location, startTime, endTime, registrationStart, registrationEnd, maxParticipants } = body;

    // Validate required fields
    if (!semesterId || !title || !location || !startTime || !registrationStart || !registrationEnd) {
      return NextResponse.json({ error: "Missing required fields: semesterId, title, location, startTime, registrationStart, registrationEnd" }, { status: 400 });
    }

    const parsedSemesterId = parseInt(semesterId, 10);
    if (isNaN(parsedSemesterId)) {
      return NextResponse.json(
        { error: "semesterId must be a valid number" },
        { status: 400 }
      );
    }

    const parsedMaxParticipants =
      maxParticipants !== undefined &&
      maxParticipants !== null &&
      maxParticipants !== ""
        ? parseInt(maxParticipants, 10)
        : null;

    if (parsedMaxParticipants !== null && isNaN(parsedMaxParticipants)) {
      return NextResponse.json(
        { error: "maxParticipants must be a valid number" },
        { status: 400 }
      );
    }

    // Validate time logic
    if (new Date(registrationStart) >= new Date(registrationEnd)) {
      return NextResponse.json(
        { error: "Thời gian kết thúc đăng ký phải sau thời gian bắt đầu đăng ký" },
        { status: 400 }
      );
    }

    if (endTime && new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        { error: "Thời gian kết thúc sự kiện phải sau thời gian bắt đầu sự kiện" },
        { status: 400 }
      );
    }

    if (new Date(registrationEnd) > new Date(startTime)) {
      return NextResponse.json(
        { error: "Thời gian kết thúc đăng ký phải trước hoặc bằng thời gian bắt đầu sự kiện" },
        { status: 400 }
      );
    }

    // Prepare data object, filter out undefined values
    const eventData: any = {
      semesterId: parsedSemesterId,
      title,
      location,
      startTime: new Date(startTime),
      registrationStart: new Date(registrationStart),
      registrationEnd: new Date(registrationEnd),
      status: "DRAFT",
    };

    // Add optional fields only if they exist
    if (description) eventData.description = description;
    if (endTime) eventData.endTime = new Date(endTime);
    if (parsedMaxParticipants !== null) {
      eventData.maxParticipants = parsedMaxParticipants;
    }

    const event = await prisma.event.create({
      data: eventData,
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    console.error("CREATE ERROR FULL:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      meta: error.meta,
    });
    return NextResponse.json(
      {
        error: error.message || "Create failed",
        meta: error.meta,
      },
      { status: 500 }
    );
  }
}
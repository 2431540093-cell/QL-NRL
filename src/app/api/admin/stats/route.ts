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
    if (!['EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.registration.count();
    const checkedIn = await prisma.registration.count({
      where: { checkedIn: true },
    });
    const checkInRate = totalRegistrations > 0 ? ((checkedIn / totalRegistrations) * 100).toFixed(2) : 0;

    return NextResponse.json({
      totalEvents,
      totalRegistrations,
      checkInRate,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ CHECK-IN bằng QR
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { qrToken } = body;

    if (!qrToken) {
      return NextResponse.json(
        { error: "Missing qrToken" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.update({
      where: { qrToken },
      data: { checkedIn: true },
    });

    return NextResponse.json({
      message: "Check-in success",
      registration,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      { error: "Check-in failed" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const { qrToken } = await req.json();

    const registration = await prisma.registration.update({
      where: { qrToken },
      data: { checkedIn: true },
    });

    return Response.json(registration);
  } catch {
    return Response.json({ error: "Check-in failed" }, { status: 400 });
  }
}
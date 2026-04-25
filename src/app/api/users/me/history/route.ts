import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

    const registrations = await prisma.registration.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: {
          include: {
            semester: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      registrations,
    });
  } catch (error) {
    return NextResponse.json({ error: "History fetch failed" }, { status: 500 });
  }
}
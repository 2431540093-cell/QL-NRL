import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    requireRole(request, ["ADMIN", "SUPER_ADMIN"]);
    const defaultPassword = await bcrypt.hash("password123", 10);

    const users = await prisma.user.createMany({
      data: [
        { email: "student1@test.com", name: "Student One", role: "STUDENT", mssv: "123456", faculty: "Computer Science", class: "CS01", password: defaultPassword },
        { email: "student2@test.com", name: "Student Two", role: "STUDENT", mssv: "123457", faculty: "Engineering", class: "EN01", password: defaultPassword },
        { email: "admin@test.com", name: "Admin", role: "ADMIN", password: defaultPassword },
        { email: "eventmanager@test.com", name: "Event Manager", role: "EVENT_MANAGER", password: defaultPassword },
        { email: "superadmin@test.com", name: "Super Admin", role: "SUPER_ADMIN", password: defaultPassword },
      ],
      skipDuplicates: true,
    });

    return Response.json({
      message: "Import successful",
      count: users.count,
    });
  } catch (error) {
    console.error("IMPORT ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 }
    );
  }
}
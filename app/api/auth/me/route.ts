import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const payload = await getAuthUser();
  if (!payload) {
    return NextResponse.json({ code: 40101, message: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, nickname: true, role: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ code: 40101, message: "User not found" }, { status: 401 });
  }

  return NextResponse.json({ code: 0, data: user, message: "ok" });
}

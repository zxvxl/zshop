import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setAdminCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ code: 40001, message: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ code: 40301, message: "Access denied" }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ code: 40101, message: "Invalid credentials" }, { status: 401 });
    }

    await setAdminCookie({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({ code: 0, message: "ok" });
  } catch (err: any) {
    return NextResponse.json({ code: 50001, message: "Server error" }, { status: 500 });
  }
}

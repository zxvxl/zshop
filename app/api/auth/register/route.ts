import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, setAuthCookie } from "@/lib/auth";
import { success, error, validate, rateLimit, rateLimitError, getClientIp } from "@/lib/api";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 5, 60000)) return rateLimitError();

  try {
    const body = await request.json();
    const result = validate(registerSchema, body);
    if ("error" in result) return result.error;

    const { email, password, nickname } = result.data;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return error(40004, "Email already registered", 409);

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), password: hashed, nickname: nickname || "" },
    });

    await setAuthCookie({ userId: user.id, email: user.email, role: user.role });

    return success({ id: user.id, email: user.email, nickname: user.nickname });
  } catch (err: any) {
    return error(50001, "Server error", 500);
  }
}

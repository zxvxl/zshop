import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setAuthCookie } from "@/lib/auth";
import { success, error, validate, rateLimit, rateLimitError, getClientIp } from "@/lib/api";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 5, 60000)) return rateLimitError();

  try {
    const body = await request.json();
    const result = validate(loginSchema, body);
    if ("error" in result) return result.error;

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return error(40101, "Invalid email or password", 401);

    const valid = await verifyPassword(password, user.password);
    if (!valid) return error(40101, "Invalid email or password", 401);

    await setAuthCookie({ userId: user.id, email: user.email, role: user.role });

    return success({ id: user.id, email: user.email, nickname: user.nickname, role: user.role });
  } catch (err: any) {
    return error(50001, "Server error", 500);
  }
}

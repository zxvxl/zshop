import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, hashPassword, verifyPassword } from "@/lib/auth";
import { success, error, validate } from "@/lib/api";
import { changePasswordSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) return error(40101, "Not authenticated", 401);

  try {
    const body = await request.json();
    const result = validate(changePasswordSchema, body);
    if ("error" in result) return result.error;

    const { oldPassword, newPassword } = result.data;

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!user) return error(40101, "User not found", 401);

    const valid = await verifyPassword(oldPassword, user.password);
    if (!valid) return error(40101, "Current password is incorrect", 401);

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return success(null, "Password changed successfully");
  } catch (err: any) {
    return error(50001, "Server error", 500);
  }
}

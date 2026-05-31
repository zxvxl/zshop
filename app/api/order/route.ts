import { NextRequest } from "next/server";
import { createOrder } from "@/lib/order";
import { getAuthUser } from "@/lib/auth";
import { success, error, validate, rateLimit, rateLimitError, getClientIp } from "@/lib/api";
import { createOrderSchema } from "@/lib/schemas";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 10, 60000)) return rateLimitError();

  try {
    const body = await request.json();
    const result = validate(createOrderSchema, body);
    if ("error" in result) return result.error;

    const { productId, email, quantity } = result.data;

    const order = await createOrder(productId, email, quantity);

    // If user is logged in, associate the order
    const authUser = await getAuthUser();
    if (authUser) {
      await prisma.order.update({
        where: { id: order.id },
        data: { userId: authUser.userId },
      });
    }

    return success(order);
  } catch (err: any) {
    return error(40001, err.message || "Failed to create order", 400);
  }
}

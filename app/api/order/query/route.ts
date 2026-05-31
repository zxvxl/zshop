import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, validate, rateLimit, rateLimitError, getClientIp } from "@/lib/api";
import { orderQuerySchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 10, 60000)) return rateLimitError();

  try {
    const body = await request.json();
    const result = validate(orderQuerySchema, body);
    if ("error" in result) return result.error;

    const { email, orderNo } = result.data;

    const orders = await prisma.order.findMany({
      where: {
        email: email.trim().toLowerCase(),
        orderNo: orderNo.trim(),
      },
      include: {
        product: { select: { title: true, titleEn: true } },
        cards: { select: { content: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const data = orders.map((order) => ({
      orderNo: order.orderNo,
      status: order.status,
      amount: order.amount,
      product: order.product,
      quantity: order.quantity,
      cards: order.status === "paid" ? order.cards.map((c) => c.content) : [],
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    }));

    return success(data);
  } catch (err: any) {
    return error(50001, "Server error", 500);
  }
}

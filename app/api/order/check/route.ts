import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, validate } from "@/lib/api";
import { orderCheckSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validate(orderCheckSchema, body);
    if ("error" in result) return result.error;

    const { orderNo } = result.data;

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: {
        product: { select: { title: true, titleEn: true } },
        cards: { select: { content: true } },
      },
    });

    if (!order) return error(40401, "Order not found", 404);

    return success({
      status: order.status,
      amount: order.amount,
      product: order.product,
      cards: order.status === "paid" ? order.cards.map((c) => c.content) : [],
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    });
  } catch (err: any) {
    return error(50001, "Server error", 500);
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword || keyword.trim().length < 3) {
      return NextResponse.json({ error: "Keyword too short" }, { status: 400 });
    }

    const trimmed = keyword.trim();

    // Search by orderNo or email
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNo: trimmed },
          { email: trimmed },
        ],
      },
      include: {
        product: { select: { title: true, titleEn: true } },
        cards: { select: { content: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const result = orders.map((order) => ({
      orderNo: order.orderNo,
      status: order.status,
      amount: order.amount,
      product: order.product,
      quantity: order.quantity,
      cards: order.status === "paid" ? order.cards.map((c) => c.content) : [],
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    }));

    return NextResponse.json({ orders: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

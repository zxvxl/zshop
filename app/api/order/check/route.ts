import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { orderNo } = await request.json();

    if (!orderNo || orderNo.trim().length < 8) {
      return NextResponse.json({ error: "Invalid orderNo" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNo: orderNo.trim() },
      include: {
        product: { select: { title: true, titleEn: true } },
        cards: { select: { content: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only return cards if paid (no email/address leak)
    return NextResponse.json({
      status: order.status,
      amount: order.amount,
      product: order.product,
      cards: order.status === "paid" ? order.cards.map((c) => c.content) : [],
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

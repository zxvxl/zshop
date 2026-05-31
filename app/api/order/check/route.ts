import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { orderNo } = await request.json();

    if (!orderNo) {
      return NextResponse.json({ error: "Missing orderNo" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: {
        product: { select: { title: true, titleEn: true } },
        cards: { select: { content: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: order.status,
      amount: order.amount,
      email: order.email,
      address: order.address,
      product: order.product,
      cards: order.status === "paid" ? order.cards.map((c) => c.content) : [],
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

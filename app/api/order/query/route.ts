import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, orderNo } = await request.json();

    // Require both email AND orderNo for security
    if (!email || !orderNo) {
      return NextResponse.json(
        { error: "Both email and order number are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOrderNo = orderNo.trim();

    if (trimmedEmail.length < 5 || trimmedOrderNo.length < 5) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        email: trimmedEmail,
        orderNo: trimmedOrderNo,
      },
      include: {
        product: { select: { title: true, titleEn: true } },
        cards: { select: { content: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

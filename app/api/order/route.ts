import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/order";

export async function POST(request: NextRequest) {
  try {
    const { productId, email, quantity } = await request.json();

    if (!productId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const order = await createOrder(productId, email, quantity || 1);

    return NextResponse.json({ status: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 400 });
  }
}

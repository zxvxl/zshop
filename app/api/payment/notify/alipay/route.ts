import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getProvider } from "@/lib/payment";
import { deliverCards } from "@/lib/order";

export async function POST(request: NextRequest) {
  try {
    // Parse form-encoded body from Alipay
    const text = await request.text();
    const params: Record<string, string> = {};
    text.split("&").forEach((pair) => {
      const [key, val] = pair.split("=");
      params[decodeURIComponent(key)] = decodeURIComponent(val || "");
    });

    const orderNo = params.out_trade_no;
    if (!orderNo) return new Response("fail", { status: 400 });

    // Find order and its channel
    const order = await prisma.order.findUnique({ where: { orderNo } });
    if (!order || !order.channelId) return new Response("fail", { status: 400 });
    if (order.status === "paid") return new Response("success"); // Already processed

    const channel = await prisma.paymentChannel.findUnique({ where: { id: order.channelId } });
    if (!channel) return new Response("fail", { status: 400 });

    const config = JSON.parse(channel.config);
    const provider = getProvider(channel.provider);
    if (!provider?.handleNotify) return new Response("fail", { status: 400 });

    const result = await provider.handleNotify(params, config);
    if (!result.success) return new Response("fail", { status: 400 });

    // Mark order as paid
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid", paidAt: new Date() },
    });

    // Auto deliver cards
    await deliverCards(order.id);

    // Alipay requires "success" response
    return new Response("success");
  } catch (err) {
    console.error("Alipay notify error:", err);
    return new Response("fail", { status: 500 });
  }
}

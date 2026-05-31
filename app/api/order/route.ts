import { NextRequest } from "next/server";
import { createOrder } from "@/lib/order";
import { getAuthUser } from "@/lib/auth";
import { getProvider } from "@/lib/payment";
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

    const { productId, email, quantity, channelId } = result.data;

    // Resolve payment channel
    let channel: any = null;
    if (channelId) {
      channel = await prisma.paymentChannel.findUnique({ where: { id: channelId, enabled: true } });
      if (!channel) return error(40001, "Invalid payment channel", 400);
    } else {
      // Auto-select first enabled channel
      channel = await prisma.paymentChannel.findFirst({ where: { enabled: true }, orderBy: { sort: "asc" } });
    }

    // Fallback: create order with env-based USDT if no channel configured
    const order = await createOrder(productId, email, quantity);

    // Associate user if logged in
    const authUser = await getAuthUser();
    const updateData: any = {};
    if (authUser) updateData.userId = authUser.userId;
    if (channel) updateData.channelId = channel.id;

    // Generate payment info via provider
    let paymentInfo: any = null;
    if (channel) {
      const config = JSON.parse(channel.config);
      const provider = getProvider(channel.provider);
      if (provider) {
        paymentInfo = await provider.createPayment(order, config);
        if (paymentInfo.payUrl) updateData.payUrl = paymentInfo.payUrl;
        if (paymentInfo.qrCode) updateData.qrCode = paymentInfo.qrCode;
      }
    } else {
      // Fallback: use env wallet
      paymentInfo = {
        mode: "address",
        address: process.env.BSC_WALLET || "",
        amount: order.amount,
        network: "BSC (BEP-20)",
      };
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.order.update({ where: { id: order.id }, data: updateData });
    }

    return success({
      orderNo: order.orderNo,
      amount: order.amount,
      payment: paymentInfo,
    });
  } catch (err: any) {
    return error(40001, err.message || "Failed to create order", 400);
  }
}

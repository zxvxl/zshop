import prisma from "@/lib/prisma";
import { getProvider } from "@/lib/payment";
import { deliverCards } from "@/lib/order";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optional: verify cron secret
  const authHeader = request.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET || "";
  if (expectedSecret && authHeader !== expectedSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all pending orders that need polling (USDT channels)
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "pending",
        createdAt: { gt: dayjs().subtract(30, "minute").toDate() },
        channelId: { not: null },
      },
      include: { product: true },
    });

    // Group by channel
    const channelOrders = new Map<number, any[]>();
    for (const order of pendingOrders) {
      if (!order.channelId) continue;
      const list = channelOrders.get(order.channelId) || [];
      list.push(order);
      channelOrders.set(order.channelId, list);
    }

    // Process each channel
    for (const [channelId, orders] of channelOrders) {
      const channel = await prisma.paymentChannel.findUnique({ where: { id: channelId } });
      if (!channel || !channel.enabled) continue;

      // Only poll-based providers (USDT) + Alipay as fallback
      const config = JSON.parse(channel.config);
      const provider = getProvider(channel.provider);
      if (!provider) continue;

      for (const order of orders) {
        const paid = await provider.checkPayment(order, config);
        if (paid) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "paid", paidAt: new Date() },
          });
          await deliverCards(order.id);
        }
      }
    }

    // Also handle legacy orders (no channelId, fallback .env wallet)
    const legacyOrders = await prisma.order.findMany({
      where: {
        status: "pending",
        channelId: null,
        createdAt: { gt: dayjs().subtract(30, "minute").toDate() },
      },
    });

    if (legacyOrders.length > 0 && process.env.BSC_WALLET) {
      const { UsdtBscProvider } = await import("@/lib/payment/usdt-bsc");
      const provider = new UsdtBscProvider();
      const config = {
        wallet: process.env.BSC_WALLET,
        token: process.env.BSC_USDT_TOKEN,
        bscscanKey: process.env.BSCSCAN_KEY,
        testnet: process.env.TEST === "true",
      };

      for (const order of legacyOrders) {
        const paid = await provider.checkPayment(order, config);
        if (paid) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "paid", paidAt: new Date() },
          });
          await deliverCards(order.id);
        }
      }
    }

    // Expire old pending orders
    await prisma.order.updateMany({
      where: {
        status: "pending",
        createdAt: { lt: dayjs().subtract(30, "minute").toDate() },
      },
      data: { status: "expired" },
    });

    return Response.json({ status: true });
  } catch (err: any) {
    console.error("Job error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

import { fetchTransactions } from "@/lib/chain";
import { deliverCards } from "@/lib/order";
import prisma from "@/lib/prisma";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

interface ChainTx {
  hash: string;
  value: string;
  tokenDecimal: string;
  to: string;
}

async function checkTx(tx: ChainTx) {
  // Convert from wei to USDT amount
  const decimals = parseInt(tx.tokenDecimal) || 18;
  const amount = new BigNumber(tx.value)
    .dividedBy(new BigNumber(10).pow(decimals))
    .toString();

  // Skip if already processed
  const existingTx = await prisma.tx.findFirst({ where: { hash: tx.hash } });
  if (existingTx?.matched) return;

  // Find matching pending order within 30 minutes
  const order = await prisma.order.findFirst({
    where: {
      amount,
      status: "pending",
      createdAt: { gt: dayjs().subtract(30, "minute").toDate() },
    },
  });

  if (!order) return;

  // Mark order as paid
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid", paidAt: new Date() },
  });

  // Record transaction
  await prisma.tx.upsert({
    where: { hash: tx.hash },
    update: { matched: true, orderId: order.id },
    create: { hash: tx.hash, amount, matched: true, orderId: order.id },
  });

  // Auto deliver cards
  await deliverCards(order.id);
}

export async function GET() {
  try {
    const wallet = process.env.BSC_WALLET?.toLowerCase();
    if (!wallet) {
      return Response.json({ error: "No wallet configured" }, { status: 500 });
    }

    const transactions = await fetchTransactions();

    for (const tx of transactions) {
      // Only process incoming transfers to our wallet
      if (tx.to?.toLowerCase() === wallet) {
        await checkTx(tx);
      }
    }

    // Expire old pending orders (> 30 min)
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

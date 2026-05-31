import type { PaymentProvider, PaymentResult } from "./types";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import prisma from "@/lib/prisma";

export class UsdtBscProvider implements PaymentProvider {
  async createPayment(order: any, config: any): Promise<PaymentResult> {
    return {
      mode: "address",
      address: config.wallet,
      amount: order.amount,
      network: "BSC (BEP-20)",
    };
  }

  async checkPayment(order: any, config: any): Promise<boolean> {
    // Fetch recent transactions from BSCScan
    const endpoint = config.testnet
      ? "https://api-testnet.bscscan.com/api"
      : "https://api.bscscan.com/api";

    const url = `${endpoint}?module=account&action=tokentx&contractaddress=${config.token}&address=${config.wallet}&page=1&sort=desc&offset=50&apikey=${config.bscscanKey}`;

    try {
      const res = await fetch(url, { cache: "no-cache" });
      const { result } = await res.json();
      if (!Array.isArray(result)) return false;

      const wallet = config.wallet.toLowerCase();

      for (const tx of result) {
        if (tx.to?.toLowerCase() !== wallet) continue;

        const decimals = parseInt(tx.tokenDecimal) || 18;
        const amount = new BigNumber(tx.value)
          .dividedBy(new BigNumber(10).pow(decimals))
          .toString();

        if (amount !== order.amount) continue;

        // Check if tx already used
        const existing = await prisma.tx.findFirst({ where: { hash: tx.hash } });
        if (existing?.matched) continue;

        // Match! Record and return true
        await prisma.tx.upsert({
          where: { hash: tx.hash },
          update: { matched: true, orderId: order.id },
          create: { hash: tx.hash, amount, matched: true, orderId: order.id },
        });

        return true;
      }
    } catch (err) {
      console.error("BSCScan fetch error:", err);
    }

    return false;
  }
}

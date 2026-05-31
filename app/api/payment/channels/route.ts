import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const channels = await prisma.paymentChannel.findMany({
    where: { enabled: true },
    orderBy: { sort: "asc" },
    select: {
      id: true,
      name: true,
      nameEn: true,
      provider: true,
      icon: true,
      feeRate: true,
      minAmount: true,
      maxAmount: true,
    },
  });

  return NextResponse.json({ code: 0, data: channels, message: "ok" });
}

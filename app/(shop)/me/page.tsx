import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import MeClient from "./me-client";

export default async function MePage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { id: true, email: true, nickname: true, createdAt: true },
  });

  if (!user) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      product: { select: { title: true, titleEn: true } },
      cards: { select: { content: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <MeClient
      user={{ email: user.email, nickname: user.nickname, createdAt: user.createdAt.toISOString() }}
      orders={orders.map((o) => ({
        orderNo: o.orderNo,
        status: o.status,
        amount: o.amount,
        quantity: o.quantity,
        productTitle: o.product.title,
        cards: o.status === "paid" ? o.cards.map((c) => c.content) : [],
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}

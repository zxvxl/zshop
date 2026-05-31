import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import PaymentStatus from "./payment-status";

export default async function PayPage({ params }: { params: { orderNo: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNo: params.orderNo },
    include: {
      product: { select: { title: true, titleEn: true } },
      cards: { select: { content: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-lg mx-auto">
      <PaymentStatus
        order={{
          orderNo: order.orderNo,
          status: order.status,
          amount: order.amount,
          address: order.address,
          payUrl: order.payUrl || "",
          qrCode: order.qrCode || "",
          productTitle: order.product.title,
          cards: order.cards.map((c) => c.content),
          createdAt: order.createdAt.toISOString(),
        }}
      />
    </div>
  );
}

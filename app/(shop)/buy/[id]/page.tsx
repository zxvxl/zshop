import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import BuyForm from "./buy-form";

export default async function BuyPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id);
  if (isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId, show: true },
    include: { _count: { select: { cards: { where: { sold: false } } } } },
  });

  if (!product) notFound();

  return (
    <div className="max-w-lg mx-auto">
      <BuyForm
        product={{
          id: product.id,
          title: product.title,
          titleEn: product.titleEn,
          price: product.price,
          stock: product._count.cards,
          autoDeliver: product.autoDeliver,
        }}
      />
    </div>
  );
}

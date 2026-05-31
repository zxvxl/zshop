import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const where: any = { show: true };
  if (categoryId) {
    where.categoryId = parseInt(categoryId);
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, nameEn: true } },
      _count: { select: { cards: { where: { sold: false } } } },
    },
    orderBy: [{ sort: "asc" }, { price: "asc" }],
  });

  // Count sold per product
  const result = await Promise.all(
    products.map(async (p) => {
      const soldCount = await prisma.card.count({
        where: { productId: p.id, sold: true },
      });
      return {
        id: p.id,
        title: p.title,
        titleEn: p.titleEn,
        description: p.description,
        descEn: p.descEn,
        price: p.price,
        category: p.category,
        autoDeliver: p.autoDeliver,
        stock: p._count.cards,
        sold: soldCount,
      };
    })
  );

  return NextResponse.json({ products: result });
}

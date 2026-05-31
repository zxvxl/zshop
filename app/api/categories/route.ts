import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: {
      _count: { select: { products: { where: { show: true } } } },
    },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      count: c._count.products,
    })),
  });
}

import prisma from "@/lib/prisma";
import ProductGrid from "./product-grid";
import Notice from "./notice";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: { _count: { select: { products: { where: { show: true } } } } },
  });

  const products = await prisma.product.findMany({
    where: { show: true },
    include: {
      category: { select: { id: true, name: true, nameEn: true } },
      _count: { select: { cards: { where: { sold: false } } } },
    },
    orderBy: [{ sort: "asc" }, { price: "asc" }],
  });

  const productsWithStats = await Promise.all(
    products.map(async (p) => {
      const sold = await prisma.card.count({ where: { productId: p.id, sold: true } });
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
        sold,
      };
    })
  );

  return (
    <div className="space-y-6">
      <Notice />
      <ProductGrid
        products={productsWithStats}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          nameEn: c.nameEn,
          count: c._count.products,
        }))}
      />
    </div>
  );
}

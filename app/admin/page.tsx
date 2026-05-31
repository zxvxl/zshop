import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const paidCount = await prisma.order.count({ where: { status: "paid" } });
  const cardCount = await prisma.card.count();
  const soldCards = await prisma.card.count({ where: { sold: true } });

  // Use aggregate instead of loading all orders into memory
  const revenueResult = await prisma.order.aggregate({
    where: { status: "paid" },
    _sum: { quantity: true },
  });

  // Since amount is String (not Float), calculate from orders efficiently
  const paidOrders = await prisma.order.findMany({
    where: { status: "paid" },
    select: { amount: true },
  });
  const revenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);

  const stats = [
    { label: "Revenue (USDT)", value: revenue.toFixed(2) },
    { label: "Paid Orders", value: paidCount },
    { label: "Total Orders", value: orderCount },
    { label: "Products", value: productCount },
    { label: "Cards (total)", value: cardCount },
    { label: "Cards (sold)", value: soldCards },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: {
      product: { select: { title: true } },
      _count: { select: { cards: true } },
    },
    orderBy: { id: "desc" },
    take: 100,
  });

  const statusColor = (s: string) => {
    if (s === "paid") return "bg-green-100 text-green-700";
    if (s === "expired") return "bg-gray-100 text-gray-500";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500">Order No</th>
              <th className="text-left px-4 py-3 text-gray-500">Product</th>
              <th className="text-left px-4 py-3 text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 text-gray-500">Cards</th>
              <th className="text-left px-4 py-3 text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-gray-500">Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.orderNo}</td>
                <td className="px-4 py-3 text-gray-900">{o.product.title}</td>
                <td className="px-4 py-3 text-gray-600">{o.email}</td>
                <td className="px-4 py-3 font-bold text-orange-500">${o.amount}</td>
                <td className="px-4 py-3">{o._count.cards}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

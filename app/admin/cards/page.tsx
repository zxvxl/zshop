import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function importCards(formData: FormData) {
  "use server";
  const productId = parseInt(formData.get("productId") as string);
  const content = formData.get("content") as string;

  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    await prisma.card.create({
      data: { productId, content: line },
    });
  }

  revalidatePath("/admin/cards");
}

export default async function AdminCards() {
  const products = await prisma.product.findMany({ orderBy: { id: "desc" } });
  const recentCards = await prisma.card.findMany({
    include: { product: { select: { title: true } } },
    orderBy: { id: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Card Management</h1>

      {/* Import Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Import Cards</h2>
        <form action={importCards} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select name="productId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {products.map((p) => <option key={p.id} value={p.id}>{p.title} (${p.price})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Content (one per line)</label>
            <textarea name="content" rows={8} required placeholder="card-key-001&#10;card-key-002&#10;card-key-003" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">
            Import
          </button>
        </form>
      </div>

      {/* Recent Cards */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <span className="font-medium text-gray-700">Recent Cards (last 50)</span>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-2 text-gray-500">ID</th>
              <th className="text-left px-4 py-2 text-gray-500">Product</th>
              <th className="text-left px-4 py-2 text-gray-500">Content</th>
              <th className="text-left px-4 py-2 text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentCards.map((card) => (
              <tr key={card.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400">{card.id}</td>
                <td className="px-4 py-2 text-gray-600">{card.product.title}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-700 max-w-xs truncate">{card.content}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${card.sold ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                    {card.sold ? "Sold" : "Available"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

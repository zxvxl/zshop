import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function toggleShow(formData: FormData) {
  "use server";
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  const id = parseInt(formData.get("id") as string);
  const current = formData.get("show") === "true";
  await prisma.product.update({ where: { id }, data: { show: !current } });
  revalidatePath("/admin/products");
}

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      _count: { select: { cards: { where: { sold: false } } } },
    },
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new" className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600">
          + New Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{p.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                <td className="px-4 py-3 font-bold text-orange-500">${p.price}</td>
                <td className="px-4 py-3">{p._count.cards}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.show ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.show ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleShow} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="show" value={String(p.show)} />
                    <button type="submit" className="text-xs text-orange-500 hover:text-orange-700 font-medium">
                      {p.show ? "Hide" : "Show"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

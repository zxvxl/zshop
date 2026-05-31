import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createCategory(formData: FormData) {
  "use server";
  await prisma.category.create({
    data: {
      name: formData.get("name") as string,
      nameEn: (formData.get("nameEn") as string) || "",
      sort: parseInt((formData.get("sort") as string) || "0"),
    },
  });
  revalidatePath("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) return; // Can't delete if has products
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sort: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>

      {/* Create Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">New Category</h2>
        <form action={createCategory} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Name (Chinese)</label>
            <input name="name" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Name (English)</label>
            <input name="nameEn" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="w-20">
            <label className="block text-xs text-gray-500 mb-1">Sort</label>
            <input name="sort" type="number" defaultValue={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 whitespace-nowrap">
            Create
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500">ID</th>
              <th className="text-left px-4 py-3 text-gray-500">Name</th>
              <th className="text-left px-4 py-3 text-gray-500">Name (EN)</th>
              <th className="text-left px-4 py-3 text-gray-500">Products</th>
              <th className="text-left px-4 py-3 text-gray-500">Sort</th>
              <th className="text-left px-4 py-3 text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{c.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.nameEn || "-"}</td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3 text-gray-400">{c.sort}</td>
                <td className="px-4 py-3">
                  {c._count.products === 0 && (
                    <form action={deleteCategory} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

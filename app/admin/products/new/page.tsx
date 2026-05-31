import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function createProduct(formData: FormData) {
  "use server";
  await prisma.product.create({
    data: {
      title: formData.get("title") as string,
      titleEn: (formData.get("titleEn") as string) || "",
      description: (formData.get("description") as string) || "",
      descEn: (formData.get("descEn") as string) || "",
      price: parseFloat(formData.get("price") as string),
      categoryId: parseInt(formData.get("categoryId") as string),
      autoDeliver: formData.get("autoDeliver") === "on",
    },
  });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export default async function NewProduct() {
  const categories = await prisma.category.findMany({ orderBy: { sort: "asc" } });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Product</h1>
      <form action={createProduct} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input name="title" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
          <input name="titleEn" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
          <textarea name="descEn" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (USDT)</label>
          <input name="price" type="number" step="0.01" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="categoryId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input name="autoDeliver" type="checkbox" defaultChecked className="rounded" />
          <label className="text-sm text-gray-700">Auto deliver cards after payment</label>
        </div>
        <button type="submit" className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">
          Create Product
        </button>
      </form>
    </div>
  );
}

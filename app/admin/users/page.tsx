import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function toggleRole(formData: FormData) {
  "use server";
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  const id = parseInt(formData.get("id") as string);
  const currentRole = formData.get("role") as string;
  const newRole = currentRole === "admin" ? "user" : "admin";
  await prisma.user.update({ where: { id }, data: { role: newRole } });
  revalidatePath("/admin/users");
}

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500">ID</th>
              <th className="text-left px-4 py-3 text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-gray-500">Nickname</th>
              <th className="text-left px-4 py-3 text-gray-500">Role</th>
              <th className="text-left px-4 py-3 text-gray-500">Orders</th>
              <th className="text-left px-4 py-3 text-gray-500">Joined</th>
              <th className="text-left px-4 py-3 text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{u.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.nickname || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{u._count.orders}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <form action={toggleRole} className="inline">
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="role" value={u.role} />
                    <button type="submit" className="text-xs text-orange-500 hover:text-orange-700 font-medium">
                      {u.role === "admin" ? "Remove Admin" : "Make Admin"}
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

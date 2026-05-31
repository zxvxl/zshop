import AdminLogout from "./admin-logout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-gray-900">ZShop Admin</span>
            <div className="flex gap-4 text-sm">
              <a href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</a>
              <a href="/admin/products" className="text-gray-600 hover:text-gray-900 font-medium">Products</a>
              <a href="/admin/cards" className="text-gray-600 hover:text-gray-900 font-medium">Cards</a>
              <a href="/admin/orders" className="text-gray-600 hover:text-gray-900 font-medium">Orders</a>
              <a href="/admin/categories" className="text-gray-600 hover:text-gray-900 font-medium">Categories</a>
              <a href="/admin/payment" className="text-gray-600 hover:text-gray-900 font-medium">Payment</a>
              <a href="/admin/users" className="text-gray-600 hover:text-gray-900 font-medium">Users</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-orange-500 font-medium hover:text-orange-600">View Shop &rarr;</a>
            <AdminLogout />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

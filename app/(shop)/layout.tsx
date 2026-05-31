import Navbar from "@/components/ui/navbar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100">
        <p>&copy; {new Date().getFullYear()} ZShop. Powered by USDT.</p>
      </footer>
    </>
  );
}

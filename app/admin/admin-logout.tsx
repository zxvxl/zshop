"use client";
import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors">
      Logout
    </button>
  );
}

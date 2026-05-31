"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  orderNo: string;
  status: string;
  amount: string;
  quantity: number;
  productTitle: string;
  cards: string[];
  createdAt: string;
}

export default function MeClient({
  user,
  orders,
}: {
  user: { email: string; nickname: string; createdAt: string };
  orders: Order[];
}) {
  const t = useTranslations("me");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "password">("orders");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdMsg("Passwords do not match"); return; }
    if (newPwd.length < 6) { setPwdMsg("Password must be at least 6 characters"); return; }
    setPwdLoading(true);
    setPwdMsg("");
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (data.code !== 0) throw new Error(data.message);
      setPwdMsg("Password changed successfully");
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: any) {
      setPwdMsg(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "paid") return "bg-green-100 text-green-700";
    if (s === "expired") return "bg-gray-100 text-gray-500";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <button onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          {tAuth("logoutBtn")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("orders")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === "orders" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          {t("orders")}
        </button>
        <button onClick={() => setTab("password")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === "password" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          {t("changePassword")}
        </button>
      </div>

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">{t("empty")}</div>
          ) : (
            orders.map((order) => (
              <div key={order.orderNo} className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-mono">{order.orderNo}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900">{order.productTitle}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-black text-orange-500">${order.amount} USDT</span>
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {order.cards.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {order.cards.map((card, i) => (
                      <div key={i} className="bg-gray-50 border rounded-lg p-2">
                        <code className="text-xs text-gray-700 break-all">{card}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Password Tab */}
      {tab === "password" && (
        <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t("changePassword")}</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("oldPassword")}</label>
              <input type="password" required value={oldPwd} onChange={(e) => setOldPwd(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("newPassword")}</label>
              <input type="password" required minLength={6} value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirmPassword")}</label>
              <input type="password" required minLength={6} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
            </div>
            {pwdMsg && <div className={`text-sm rounded-xl px-4 py-3 ${pwdMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{pwdMsg}</div>}
            <button type="submit" disabled={pwdLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {t("saveBtn")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

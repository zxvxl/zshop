"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function OrdersPage() {
  const t = useTranslations("order");
  const [keyword, setKeyword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/order/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "paid": return t("statusPaid");
      case "expired": return t("statusExpired");
      default: return t("statusPending");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "expired": return "bg-gray-100 text-gray-500";
      default: return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">{t("queryTitle")}</h1>

      <form onSubmit={search} className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("queryPlaceholder")}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl text-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {t("queryBtn")}
        </button>
      </form>

      {searched && orders.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">{t("queryEmpty")}</div>
      )}

      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.orderNo} className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-mono">{order.orderNo}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${statusColor(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900">{order.product?.title}</div>
              <div className="text-lg font-black text-orange-500 mt-1">${order.amount} USDT</div>

              {order.status === "paid" && order.cards.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {order.cards.map((card: string, i: number) => (
                    <div key={i} className="bg-gray-50 border rounded-lg p-2">
                      <code className="text-xs text-gray-700 break-all">{card}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

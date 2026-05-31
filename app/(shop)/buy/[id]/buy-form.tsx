"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/client-api";

interface Props {
  product: {
    id: number;
    title: string;
    titleEn: string;
    price: number;
    stock: number;
    autoDeliver: boolean;
  };
}

export default function BuyForm({ product }: Props) {
  const t = useTranslations("order");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const order = await apiPost("/api/order", { productId: product.id, email, quantity });
      router.push(`/pay/${order.orderNo}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900 mb-6">{t("title")}</h1>

      {/* Product Info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="font-semibold text-gray-900">{product.title}</div>
        <div className="text-2xl font-black text-orange-500 mt-2">
          ${product.price.toFixed(2)} <span className="text-sm text-gray-400">USDT</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("email")}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">{t("emailHint")}</p>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("quantity")}</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              disabled={quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</button>
            <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              disabled={product.autoDeliver && quantity >= product.stock}
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("amount")}</span>
            <span className="text-xl font-black text-orange-500">
              ${(product.price * quantity).toFixed(2)} USDT
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : t("submit")}
        </button>
      </form>
    </div>
  );
}

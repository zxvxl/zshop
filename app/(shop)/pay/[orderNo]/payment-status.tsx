"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { apiPost } from "@/lib/client-api";

interface OrderData {
  orderNo: string;
  status: string;
  amount: string;
  address: string;
  payUrl: string;
  qrCode: string;
  productTitle: string;
  cards: string[];
  createdAt: string;
}

export default function PaymentStatus({ order: initial }: { order: OrderData }) {
  const t = useTranslations("order");
  const [order, setOrder] = useState(initial);
  const [copied, setCopied] = useState("");

  // Determine payment mode
  const paymentMode = order.payUrl ? "url" : order.qrCode ? "qrcode" : "address";

  // Poll for payment status
  useEffect(() => {
    if (order.status !== "pending") return;
    const interval = setInterval(async () => {
      try {
        const data = await apiPost("/api/order/check", { orderNo: order.orderNo });
        if (data.status === "paid") {
          setOrder({ ...order, status: "paid", cards: data.cards || [] });
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [order.status, order.orderNo]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  // --- PAID: Show cards ---
  if (order.status === "paid") {
    return (
      <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t("paid")}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("paidHint")}</p>
        </div>
        <div className="space-y-2">
          {order.cards.map((card, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2">
              <code className="text-sm text-gray-800 break-all flex-1">{card}</code>
              <button
                onClick={() => copyText(card, `card-${i}`)}
                className="shrink-0 text-xs text-orange-500 font-bold hover:text-orange-600"
              >
                {copied === `card-${i}` ? t("payCopied") : t("payCopy")}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- PENDING: Show payment instructions ---
  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{t("payTitle")}</h2>
      <p className="text-sm text-gray-500 mb-6">{t("payHint")}</p>

      <div className="space-y-4">
        {/* Mode: URL redirect (Alipay web) */}
        {paymentMode === "url" && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700 mb-3">支付金额: <span className="font-black text-lg">¥{order.amount}</span></p>
              <a
                href={order.payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
              >
                前往支付宝付款 →
              </a>
            </div>
            <p className="text-xs text-gray-400 text-center">支付完成后页面将自动更新</p>
          </>
        )}

        {/* Mode: QR code (Alipay face-to-face) */}
        {paymentMode === "qrcode" && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700 mb-3">请使用支付宝扫码支付</p>
              <div className="bg-white p-4 rounded-lg inline-block border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.qrCode)}`}
                  alt="Payment QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-lg font-black text-blue-700 mt-3">¥{order.amount}</p>
            </div>
          </>
        )}

        {/* Mode: Address (USDT) */}
        {paymentMode === "address" && (
          <>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{t("payNetwork")}</div>
              <div className="font-bold text-gray-900">BSC (BEP-20 USDT)</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{t("payAddress")}</div>
              <div className="font-mono text-sm text-gray-900 break-all">{order.address}</div>
              <button
                onClick={() => copyText(order.address, "addr")}
                className="mt-2 text-xs text-orange-500 font-bold"
              >
                {copied === "addr" ? t("payCopied") : t("payCopy")}
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="text-xs text-orange-600 mb-1">{t("payAmount")}</div>
              <div className="text-2xl font-black text-orange-600">{order.amount} USDT</div>
              <button
                onClick={() => copyText(order.amount, "amount")}
                className="mt-2 text-xs text-orange-500 font-bold"
              >
                {copied === "amount" ? t("payCopied") : t("payCopy")}
              </button>
            </div>
          </>
        )}

        {/* Waiting indicator */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            {t("payWaiting")}
          </div>
          <p className="text-xs text-gray-400 mt-2">{t("payExpire")}</p>
        </div>
      </div>
    </div>
  );
}

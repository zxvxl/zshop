"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  descEn: string;
  price: number;
  category: { id: number; name: string; nameEn: string };
  autoDeliver: boolean;
  stock: number;
  sold: number;
}

interface Category {
  id: number;
  name: string;
  nameEn: string;
  count: number;
}

const CARD_COLORS = [
  "from-orange-50 via-amber-50 to-red-50",
  "from-blue-50 via-sky-50 to-cyan-50",
  "from-emerald-50 via-green-50 to-teal-50",
  "from-purple-50 via-violet-50 to-fuchsia-50",
  "from-rose-50 via-pink-50 to-red-50",
  "from-indigo-50 via-blue-50 to-purple-50",
];

export default function ProductGrid({ products, categories }: { products: Product[]; categories: Category[] }) {
  const t = useTranslations("home");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const filtered = selectedCategory
    ? products.filter((p) => p.category.id === selectedCategory)
    : products;

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
            selectedCategory === null
              ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-[0_8px_16px_-6px_rgba(249,115,22,0.4)] -translate-y-0.5"
              : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-900/5 hover:ring-gray-900/10 hover:shadow-md hover:-translate-y-0.5"
          }`}
        >
          <span>{t("allProducts")}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
              selectedCategory === cat.id
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-[0_8px_16px_-6px_rgba(249,115,22,0.4)] -translate-y-0.5"
                : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-900/5 hover:ring-gray-900/10 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
          {t("totalProducts", { count: filtered.length })}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {filtered.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">{t("empty")}</div>
      )}
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const t = useTranslations("home");
  const isSoldOut = product.autoDeliver && product.stock === 0;
  const colorClass = CARD_COLORS[product.id % CARD_COLORS.length];

  return (
    <Link
      href={isSoldOut ? "#" : `/buy/${product.id}`}
      className={`group flex flex-col h-full bg-white/70 backdrop-blur-md rounded-2xl border overflow-hidden transition-all duration-300 ring-1 ring-black/5 ${
        isSoldOut
          ? "grayscale opacity-70 border-gray-200 cursor-not-allowed"
          : "hover:shadow-xl hover:bg-white hover:-translate-y-1 cursor-pointer border-gray-200/60"
      }`}
    >
      {/* Visual Header */}
      <div className={`relative shrink-0 bg-gradient-to-br ${isSoldOut ? "from-gray-100 to-gray-200" : colorClass} h-36 flex items-center justify-center overflow-hidden`}>
        {isSoldOut && (
          <div className="absolute -left-[30px] top-[14px] -rotate-45 bg-gray-500 text-white text-[10px] tracking-widest font-bold py-1 w-[100px] text-center shadow-md z-20">
            {t("outOfStock")}
          </div>
        )}
        {!isSoldOut && product.autoDeliver && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              {t("autoDelivery")}
            </span>
          </div>
        )}
        <div className={`flex items-center justify-center gap-2 transition-transform duration-500 ${isSoldOut ? "" : "group-hover:scale-110"}`}>
          <span className={`text-2xl font-black tracking-tight ${isSoldOut ? "text-gray-400" : "text-gray-700"}`}>
            {product.title.slice(0, 10)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price & Stats */}
        <div className="flex items-end justify-between pt-1 mt-auto">
          <div>
            <div className="text-xl font-black text-orange-500">
              <span className="text-sm font-bold mr-0.5">$</span>
              {product.price.toFixed(2)}
              <span className="text-xs text-gray-400 ml-1">USDT</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 text-right">
            <span>{t("stock")}: {product.stock > 99 ? t("stockEnough") : product.stock}</span>
            <span className="mx-1.5">|</span>
            <span>{t("sold")}: {product.sold}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

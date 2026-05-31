"use client";
import { useTranslations } from "next-intl";

export default function Notice() {
  const t = useTranslations("notice");
  const rules = t.raw("rules") as string[];

  return (
    <div className="bg-gradient-to-r from-orange-500/10 via-amber-50 to-orange-50 border border-orange-500/20 rounded-2xl p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="bg-orange-500 text-white p-2 rounded-xl shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" strokeLinecap="round" />
            <line x1="12" x2="12.01" y1="16" y2="16" strokeLinecap="round" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base">{t("title")}</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 leading-relaxed">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

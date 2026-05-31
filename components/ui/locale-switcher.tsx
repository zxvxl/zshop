"use client";
import { useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const router = useRouter();

  const switchLocale = (locale: string) => {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        onClick={() => switchLocale("zh")}
        className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
      >
        中文
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => switchLocale("en")}
        className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
      >
        EN
      </button>
    </div>
  );
}

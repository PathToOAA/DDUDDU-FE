import { House, Sparkles, Heart, UserRound, type LucideIcon } from "lucide-react";
import type { TabKey } from "../../types/navigation";

export default function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const items: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
    { key: "home", label: "홈", icon: House },
    { key: "recommend", label: "추천", icon: Sparkles },

    { key: "saved", label: "저장", icon: Heart },
    { key: "my", label: "마이", icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 grid h-20 w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#e7ebe8] bg-white">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)} aria-current={activeTab === item.key ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
            activeTab === item.key
              ? "font-bold text-[#16883b]"
              : "text-[#59625c]"
          }`}
        >
          <item.icon size={22} strokeWidth={activeTab === item.key ? 2.25 : 1.75} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

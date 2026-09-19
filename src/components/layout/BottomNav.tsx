import type { TabKey } from "../../types/navigation";

export default function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const items: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: "home", label: "홈", icon: "⌂" },
    { key: "recommend", label: "추천", icon: "✦" },
    { key: "map", label: "지도", icon: "▱" },
    { key: "saved", label: "저장", icon: "♡" },
    { key: "my", label: "마이", icon: "♙" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 grid h-20 w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-[#e7ebe8] bg-white">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
            activeTab === item.key
              ? "font-bold text-[#16883b]"
              : "text-[#59625c]"
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

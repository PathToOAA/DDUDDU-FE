import { ChevronRight } from "lucide-react";
export default function SectionTitle({
  title,
  action,
  onClick,
}: {
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-extrabold">{title}</h2>
      {action && (
        <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-bold text-[#16883b]">
          {action}<ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

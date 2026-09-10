export default function Segmented({
  options,
  activeIndex,
}: {
  options: string[];
  activeIndex: number;
}) {
  return (
    <div className="flex gap-2">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          className={`flex-1 rounded-lg border px-3 py-3 text-sm font-bold ${
            index === activeIndex
              ? "border-[#b9ddc3] bg-[#eef8f0] text-[#16883b]"
              : "border-[#e4e8e5] bg-white text-[#222]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

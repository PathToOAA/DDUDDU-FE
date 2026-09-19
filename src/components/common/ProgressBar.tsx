export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e3e8e4]">
      <div
        className="h-full rounded-full bg-[#16883b]"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

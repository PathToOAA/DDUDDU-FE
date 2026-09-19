export default function ScreenHeader({
  title,
  left,
  right,
  onLeft,
}: {
  title: string;
  left?: string;
  right?: string;
  onLeft?: () => void;
}) {
  return (
    <header className="mb-7 grid grid-cols-[44px_1fr_44px] items-center">
      <button className="h-10 text-2xl" onClick={onLeft}>
        {left}
      </button>
      <h1 className="text-center text-base font-extrabold">{title}</h1>
      <button className="h-10 text-sm font-bold text-[#59625c]">{right}</button>
    </header>
  );
}

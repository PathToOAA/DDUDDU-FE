import type { ReactNode } from "react";

export default function ScreenHeader({
  title, left, right, onLeft, leftLabel, rightLabel,
}: {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  onLeft?: () => void;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <header className="mb-7 grid grid-cols-[44px_1fr_44px] items-center">
      {left ? <button type="button" aria-label={leftLabel} className="flex h-10 w-10 items-center justify-center" onClick={onLeft}>{left}</button> : <span />}
      <h1 className="text-center text-base font-extrabold">{title}</h1>
      {right ? <button type="button" aria-label={rightLabel} className="flex h-10 items-center justify-center text-sm font-bold text-[#59625c]">{right}</button> : <span />}
    </header>
  );
}
import type { ReactNode } from "react";

export default function Bubble({
  children,
  mine = false,
}: {
  children: ReactNode;
  mine?: boolean;
}) {
  return (
    <div
      className={`max-w-[82%] rounded-lg px-4 py-3 text-left text-sm leading-6 ${
        mine ? "ml-auto bg-[#16883b] text-white" : "bg-[#f2f3f1] text-[#26302a]"
      }`}
    >
      {children}
    </div>
  );
}

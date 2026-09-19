import type { ReactNode } from "react";

export default function FormBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-7">
      <h2 className="mb-3 text-left text-sm font-extrabold">{label}</h2>
      {children}
    </div>
  );
}

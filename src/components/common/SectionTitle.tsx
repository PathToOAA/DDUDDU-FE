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
        <button onClick={onClick} className="text-xs font-bold text-[#16883b]">
          {action} 〉
        </button>
      )}
    </div>
  );
}

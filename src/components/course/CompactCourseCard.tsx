import type { CourseSummary } from "../../data/mockCourses";
import { formatWon } from "../../utils/format";

export default function CompactCourseCard({
  course,
  onClick,
}: {
  course: CourseSummary;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#e7ebe8] bg-white p-4 text-left"
    >
      <div>
        <h3 className="font-extrabold">{course.title}</h3>
        <p className="mt-3 text-xs text-[#3c4740]">
          도보 {course.walkDistance}
        </p>
        <p className="mt-1 text-xs text-[#3c4740]">버스 {course.busCount}</p>
        <p className="mt-1 text-xs text-[#3c4740]">
          예상 {formatWon(course.cost)}원
        </p>
      </div>
      <img
        src={course.images[0]}
        alt=""
        className="h-20 w-20 rounded-lg object-cover"
      />
    </button>
  );
}

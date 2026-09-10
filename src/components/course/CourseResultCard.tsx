import type { CourseSummary } from "../../data/mockCourses";
import MetaRow from "./MetaRow";
import ProgressBar from "../common/ProgressBar";
import { formatWon } from "../../utils/format";

export default function CourseResultCard({
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
      className="w-full rounded-lg border border-[#e7ebe8] bg-white p-4 text-left shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {course.badge && (
            <span className="rounded-full bg-[#16883b] px-3 py-1 text-[11px] font-bold text-white">
              {course.badge}
            </span>
          )}
          <h2 className="text-base font-extrabold">{course.title}</h2>
        </div>
        <span className="text-[#a6afa9]">♡</span>
      </div>
      <MetaRow course={course} />
      <div className="mt-3 grid grid-cols-4 gap-2">
        {course.images.map((image) => (
          <img
            key={image}
            src={image}
            alt=""
            className="h-16 rounded-lg object-cover"
          />
        ))}
      </div>
      <div className="mt-4 flex items-end justify-between text-sm">
        <span>
          총 예상 비용{" "}
          <strong className="text-base">{formatWon(course.cost)}원</strong>
        </span>
        <span className="text-xs text-[#68736c]">
          예산 {formatWon(course.budget)}원
        </span>
      </div>
      <ProgressBar value={(course.cost / course.budget) * 100} />
      <p className="mt-2 text-right text-xs font-bold text-[#16883b]">
        남은 예산 {formatWon(course.budget - course.cost)}원
      </p>
    </button>
  );
}

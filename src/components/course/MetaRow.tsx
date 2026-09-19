import type { CourseSummary } from "../../data/mockCourses";

export default function MetaRow({ course }: { course: CourseSummary }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#59625c]">
      <span>도보 {course.walkDistance}</span>
      <span>버스 {course.busCount}</span>
      <span>{course.duration} 소요</span>
    </div>
  );
}

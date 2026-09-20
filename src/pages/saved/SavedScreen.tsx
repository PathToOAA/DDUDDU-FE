import { useEffect, useState } from "react";
import type { CourseSummary } from "../../data/mockCourses";
import ScreenHeader from "../../components/common/ScreenHeader";
import CompactCourseCard from "../../components/course/CompactCourseCard";
import { listSavedCourses } from "../../api/savedCourseApi";

export default function SavedScreen({
  onOpenCourse,
}: {
  onOpenCourse: (course: CourseSummary) => void;
}) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSavedCourses().then(setCourses).catch((e: Error) => setError(e.message));
  }, []);

  return (
    <section className="px-5 pt-6">
      <ScreenHeader title="저장한 코스" />
      <div className="mt-6 space-y-3">
        {courses.some(c => !c.detail) && <p className="text-xs text-gray-500">이전에 저장한 코스에는 경로 정보가 없어요. 새 추천 코스를 저장하면 지도와 이동 정보도 함께 보관돼요.</p>}
        {courses.map((course) => (
          <CompactCourseCard
            key={course.id}
            course={course}
            onClick={() => onOpenCourse(course)}
          />
        ))}
        {courses.length === 0 && !error && <p className="py-12 text-center text-sm text-[#68736c]">저장한 코스가 아직 없어요.</p>}
        {error && <p className="py-12 text-center text-sm text-red-500">{error}</p>}
      </div>
    </section>
  );
}

import { recommendedCourses } from "../../data/mockCourses";
import type { CourseSummary } from "../../data/mockCourses";
import ScreenHeader from "../../components/common/ScreenHeader";
import CompactCourseCard from "../../components/course/CompactCourseCard";

export default function SavedScreen({
  onOpenCourse,
}: {
  onOpenCourse: (course: CourseSummary) => void;
}) {
  return (
    <section className="px-5 pt-6">
      <ScreenHeader title="저장한 코스" />
      <div className="mt-6 space-y-3">
        {recommendedCourses.slice(0, 2).map((course) => (
          <CompactCourseCard
            key={course.id}
            course={course}
            onClick={() => onOpenCourse(course)}
          />
        ))}
      </div>
    </section>
  );
}

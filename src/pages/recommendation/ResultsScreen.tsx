import { recommendedCourses } from "../../data/mockCourses";
import type { CourseSummary } from "../../data/mockCourses";
import ScreenHeader from "../../components/common/ScreenHeader";
import CourseResultCard from "../../components/course/CourseResultCard";
import { saveCourse } from "../../api/savedCourseApi";
import { useState } from "react";

export default function ResultsScreen({
  onBack,
  onOpenCourse,
}: {
  onBack: () => void;
  onOpenCourse: (course: CourseSummary) => void;
}) {
  const [savedIds, setSavedIds] = useState<number[]>([]);
  return (
    <section className="pt-6">
      <div className="px-5">
        <ScreenHeader
          title="추천 코스 결과"
          left="‹"
          right="필터"
          onLeft={onBack}
        />
      </div>
      <div className="mt-2 grid grid-cols-4 border-b border-[#e7ebe8] text-center text-sm">
        {["추천순", "예산순", "도보 적은순", "인기순"].map((item, index) => (
          <button
            key={item}
            className={`py-3 ${index === 0 ? "border-b-2 border-[#16883b] font-bold text-[#16883b]" : "text-[#59625c]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-4 bg-[#f7f8f6] px-4 py-4">
        {recommendedCourses.map((course) => (
          <CourseResultCard
            key={course.id}
            course={course}
            onClick={() => onOpenCourse(course)}
            onSave={async () => {
              await saveCourse(course);
              setSavedIds((ids) => ids.includes(course.id) ? ids : [...ids, course.id]);
            }}
          />
        ))}
        {savedIds.length > 0 && <p className="text-center text-xs text-[#16883b]">저장한 코스가 내 저장 탭에 추가됐어요.</p>}
      </div>
    </section>
  );
}

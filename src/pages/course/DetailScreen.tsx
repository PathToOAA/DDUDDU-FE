import TourPhoto from "../../components/tour/TourPhoto";
import { ArrowLeft } from "lucide-react";
import type { CourseSummary } from "../../data/mockCourses";
import MetaRow from "../../components/course/MetaRow";
import ProgressBar from "../../components/common/ProgressBar";
import { formatWon } from "../../utils/format";

export default function DetailScreen({
  course,
  onBack,
  onOpenMap,
}: {
  course: CourseSummary;
  onBack: () => void;
  onOpenMap: () => void;
}) {
  return (
    <section>
      <div className="relative h-52 text-white">
        <TourPhoto
          src={course.images[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기" className="absolute left-4 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/30"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="mb-2 inline-flex rounded-full bg-[#16883b] px-3 py-1 text-xs font-bold">
            {course.badge ?? course.tags}
          </div>
          <h1 className="text-2xl font-extrabold">{course.title}</h1>
        </div>
      </div>

      <div className="px-5 py-5">
        <MetaRow course={course} />
        <div className="mt-6">
          <p className="text-sm font-bold">총 예상 비용</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-extrabold">
              {formatWon(course.cost)}원
            </p>
            <p className="text-sm font-bold text-[#16883b]">
              남은 예산 {formatWon(course.budget - course.cost)}원
            </p>
          </div>
          <ProgressBar value={(course.cost / course.budget) * 100} />
        </div>

        <h2 className="mt-8 text-lg font-extrabold">코스 일정</h2>
        <div className="mt-4 space-y-4 border-l-2 border-dashed border-[#b9ddc3] pl-5">
          {course.stops.map((stop, index) => (
            <article key={stop.name} className="relative">
              <span className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#16883b] text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold">{stop.name}</h3>
                  <p className="mt-1 text-xs text-[#68736c]">{stop.move}</p>
                </div>
                <p className="text-xs text-[#68736c]">{stop.time}</p>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenMap}
          className="mt-8 w-full rounded-lg bg-[#16883b] py-4 text-sm font-bold text-white"
        >
          지도에서 코스 보기
        </button>
      </div>
    </section>
  );
}

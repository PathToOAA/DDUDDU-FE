import { cities, recommendedCourses } from "../../data/mockCourses";
import type { CourseSummary } from "../../data/mockCourses";
import SectionTitle from "../../components/common/SectionTitle";
import CompactCourseCard from "../../components/course/CompactCourseCard";

export default function HomeScreen({
  onOpenRecommend,
  onOpenResults,
  onOpenCourse,
}: {
  onOpenRecommend: () => void;
  onOpenResults: () => void;
  onOpenCourse: (course: CourseSummary) => void;
}) {
  return (
    <section className="px-5 pt-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-normal text-[#101713]">
            뚜벅뚜벅
          </h1>
          <p className="mt-1 text-xs text-[#68736c]">
            지혜로운 뚜벅이 여행의 시작
          </p>
        </div>
        <button className="h-9 w-9 rounded-full border border-[#e3e8e4] text-lg">
          ♧
        </button>
      </header>

      <SectionTitle
        title="오늘의 추천 코스"
        action="더보기"
        onClick={onOpenResults}
      />

      <button
        type="button"
        onClick={() => onOpenCourse(recommendedCourses[0])}
        className="relative mb-7 h-48 w-full overflow-hidden rounded-lg text-left text-white shadow-sm"
      >
        <img
          src={recommendedCourses[0].images[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/25 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-5">
          <span className="self-end text-xl">×</span>
          <div>
            <p className="text-2xl font-extrabold leading-tight">
              5만원으로 떠나는
              <br />
              강릉 당일치기
            </p>
            <p className="mt-3 text-sm font-semibold">
              강릉역 출발 · 도보 4.2km · 버스 3회
            </p>
            <p className="mt-1 text-sm font-semibold">예상 비용 47,300원</p>
          </div>
        </div>
      </button>

      <SectionTitle title="이런 도시는 어때요?" action="전체보기" />
      <div className="mb-8 grid grid-cols-4 gap-3">
        {cities.map((city) => (
          <article key={city.name} className="text-left">
            <img
              src={city.image}
              alt={city.name}
              className="mb-2 h-24 w-full rounded-lg object-cover"
            />
            <h3 className="text-sm font-bold">{city.name}</h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#68736c]">
              {city.description}
            </p>
          </article>
        ))}
      </div>

      <SectionTitle title="인기 뚜벅이 코스" />
      <div className="space-y-3">
        {recommendedCourses.slice(1).map((course) => (
          <CompactCourseCard
            key={course.id}
            course={course}
            onClick={() => onOpenCourse(course)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenRecommend}
        className="mt-6 w-full rounded-lg bg-[#16883b] py-4 text-sm font-bold text-white"
      >
        내 조건으로 코스 추천받기
      </button>
    </section>
  );
}

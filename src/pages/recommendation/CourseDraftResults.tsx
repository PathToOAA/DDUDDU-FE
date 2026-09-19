import CourseRouteDetails from "./CourseRouteDetails";
import { useState } from "react";
import type { CourseSummary } from "../../data/mockCourses";
import { saveCourse } from "../../api/savedCourseApi";
import type {
  RecommendationDraftResponse,
  TravelType,
} from "../../types/recommendation";

const TRAVEL_LABELS: Record<TravelType, string> = {
  DAY_TRIP: "당일치기",
  ONE_NIGHT: "1박 2일",
  TWO_NIGHTS: "2박 3일",
};

type Props = {
  result: RecommendationDraftResponse;
  onOpenMap: (courseIndex: number) => void;
};

export default function CourseDraftResults({ result, onOpenMap }: Props) {
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const placesById = new Map(
    result.places.map((place) => [place.contentId, place]),
  );

  const conditions = result.conditions;

  return (
    <section className="mt-8 pb-8" aria-label="생성된 여행 코스">
      <h2 className="text-xl font-extrabold">
        여행 코스 초안 {result.courses.length}개
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        생성에 사용한 조건: {TRAVEL_LABELS[conditions.travelType]}
        {" · "}
        {conditions.startTime}~{conditions.endTime}
        {" · "}
        1인 {conditions.budget.toLocaleString("ko-KR")}원
      </p>

      <p className="mt-2 text-sm text-gray-500">
        이동 정보는 조회 시점의 예상치예요. 여행일 운행, 영업시간과 전체 예산은 별도 확인이 필요해요. 조건을
        바꿨다면 다시 생성해주세요.
      </p>

      <p className="mt-2 text-sm font-semibold">출발: {result.departure?.title} → 복귀: {result.returnPoint?.title}</p>
      {result.conditions.travelType !== "DAY_TRIP" && <p className="mt-2 text-xs text-amber-800">첫날 출발과 마지막 날 복귀를 포함해요. 숙소·날짜 사이 이동은 미정이에요.</p>}
      {result.candidatePoolLimited && (
        <p className="mt-2 text-xs text-amber-700">
          조회된 관광지 중 일부 후보를 사용해 만든 결과예요.
        </p>
      )}

      <div className="mt-5 space-y-5">
        {result.courses.map((course, courseIndex) => (
          <article
            key={courseIndex}
            className="rounded-2xl border border-[#dce8df] bg-white p-5"
          >
            <span className="rounded-full bg-[#eef8f0] px-3 py-1 text-xs font-bold text-[#16883b]">
              코스 {courseIndex + 1}
            </span>

            <h3 className="mt-3 text-lg font-extrabold">{course.title}</h3>

            <button
              type="button"
              disabled={savingIndex === courseIndex}
              onClick={async () => {
                setSavingIndex(courseIndex);
                const analysis = result.routeAnalysis?.find((item) => item.courseIndex === courseIndex);
                const places = course.days.flatMap((day) => day.contentIds.map((id) => placesById.get(id))).filter(Boolean);
                const summary: CourseSummary = {
                  id: courseIndex + 1,
                  title: course.title,
                  badge: "AI 추천",
                  tags: TRAVEL_LABELS[conditions.travelType],
                  walkDistance: analysis?.walkDistanceMeters ? `${(analysis.walkDistanceMeters / 1000).toFixed(1)}km` : "조회 중",
                  busCount: analysis?.transfers ? `${analysis.transfers.length}회` : "조회 중",
                  duration: analysis?.durationSeconds ? `${Math.round(analysis.durationSeconds / 60)}분` : "조회 중",
                  cost: analysis?.transportFareKrw ?? 0,
                  budget: conditions.budget,
                  images: places.map((place) => place!.imageUrl).filter(Boolean).slice(0, 4),
                  stops: places.map((place) => ({ name: place!.title, time: "", category: place!.categoryCode, move: "" })),
                };
                try { await saveCourse(summary); setSavedIndex(courseIndex); } finally { setSavingIndex(null); }
              }}
              className="mt-3 rounded-lg border border-[#16883b] px-3 py-2 text-sm font-semibold text-[#16883b] disabled:opacity-60"
            >{savingIndex === courseIndex ? "저장 중..." : savedIndex === courseIndex ? "저장됨 ✓" : "코스 저장"}</button>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {course.reason}
            </p>

            <button type="button" onClick={() => onOpenMap(courseIndex)} className="mt-4 w-full rounded-lg bg-green-700 px-4 py-3 font-bold text-white">TMAP 지도에서 코스 보기</button>

            <CourseRouteDetails
              analysis={result.routeAnalysis?.find((item) => item.courseIndex === courseIndex)}
              places={result.places}
            />

            {course.days.map((day) => (
              <div key={day.day} className="mt-5">
                <h4 className="font-bold text-[#16883b]">{day.day}일차</h4>

                <ol className="mt-3 space-y-3">
                  {day.contentIds.map((contentId, index) => {
                    const place = placesById.get(contentId);

                    return (
                      <li
                        key={`${index}-${contentId}`}
                        className="flex gap-3 rounded-lg bg-[#f7faf8] p-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#16883b] text-xs font-bold text-white">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="font-semibold">
                            {place?.title ?? "장소 정보를 찾을 수 없어요"}
                          </p>

                          {place?.address && (
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              {place.address}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

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
};

export default function CourseDraftResults({ result }: Props) {
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
        실제 이동 시간, 영업시간, 비용을 확인하기 전의 코스 초안이에요. 조건을
        바꿨다면 다시 생성해주세요.
      </p>

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

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {course.reason}
            </p>

            {course.days.map((day) => (
              <div key={day.day} className="mt-5">
                <h4 className="font-bold text-[#16883b]">{day.day}일차</h4>

                <ol className="mt-3 space-y-3">
                  {day.contentIds.map((contentId, index) => {
                    const place = placesById.get(contentId);

                    return (
                      <li
                        key={contentId}
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

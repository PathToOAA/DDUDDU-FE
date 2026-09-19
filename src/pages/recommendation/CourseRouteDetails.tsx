import type { CourseRouteAnalysis, PlaceCandidateResponse } from "../../types/recommendation";

const minutes = (seconds: number) => `${Math.ceil(seconds / 60)}분`;
const distance = (meters: number) => meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
const modeLabels: Record<string, string> = {
  WALK: "도보", BUS: "버스", SUBWAY: "지하철", EXPRESSBUS: "고속버스",
  TRAIN: "기차", AIRPLANE: "항공", FERRY: "선박",
};

export default function CourseRouteDetails({ analysis, places }: {
  analysis: CourseRouteAnalysis | undefined;
  places: PlaceCandidateResponse["places"];
}) {
  if (!analysis) return <p className="mt-3 text-sm text-amber-700">이동 정보가 없는 이전 결과예요. 다시 생성해주세요.</p>;
  if (analysis.transfers.length === 0) return <p className="mt-3 text-sm text-gray-500">하루에 한 장소를 방문해 출발·복귀 포함 이동 구간이 없어요.</p>;
  const names = new Map(places.map((p) => [p.contentId, p.title]));
  return (
    <div className="mt-4 rounded-xl bg-[#f0f7f2] p-3 text-sm">
      <p className="font-bold">자동 선택한 이동 경로</p>
      {analysis.complete ? (
        <p className="mt-2">
          출발·복귀 포함 이동 {minutes(analysis.durationSeconds ?? 0)} · 도보 {distance(analysis.walkDistanceMeters ?? 0)}
        </p>
      ) : <p className="mt-2 text-amber-800">확인하지 못했거나 이동이 어려운 구간이 있어요. 전체 이동 합계는 미확정이에요.</p>}
      <p className="mt-1">
        구간별 예상 교통비 합계: {analysis.transportFareKrw == null ? "미확인" : `${analysis.transportFareKrw.toLocaleString("ko-KR")}원`}
      </p>
      <p className="mt-1 text-xs text-gray-600">관광지 체류 시간과 숙소 이동은 제외돼요. 구간 사이 환승 할인은 반영하지 않았어요.</p>
      <ol className="mt-3 space-y-3">
        {analysis.transfers.map((transfer, index) => {
          const route = transfer.route;
          return <li key={index} className="rounded-lg bg-white p-3">
            <p className="text-xs text-gray-600">{transfer.day}일차 · {names.get(transfer.fromContentId)} → {names.get(transfer.toContentId)}</p>
            <p className="mt-1 font-semibold">
              {route.status === "FOUND" ? `${route.mode === "WALK" ? "도보" : "대중교통"} · ${minutes(route.durationSeconds ?? 0)}` : route.status === "DIFFICULT" ? "이동 어려움" : "조회 실패"}
            </p>
            {route.status === "FOUND" && <p className="mt-1 text-xs">
              도보 {distance(route.walkDistanceMeters ?? 0)} · {route.fare == null ? "요금 미확인" : `${route.fare.toLocaleString("ko-KR")} ${route.currency === "KRW" ? "원" : route.currency ?? "(통화 미확인)"}`}
            </p>}
            <p className="mt-1 text-xs text-gray-600">{route.message}</p>
            {route.legs.length > 0 && <ul className="mt-2 space-y-1 text-xs">
              {route.legs.map((leg, legIndex) => <li key={legIndex}>
                {modeLabels[leg.mode] ?? leg.mode}{leg.routeName ? ` ${leg.routeName}` : ""} · {leg.startName ?? "출발"} → {leg.endName ?? "도착"} ({minutes(leg.durationSeconds)})
              </li>)}
            </ul>}
          </li>;
        })}
      </ol>
    </div>
  );
}
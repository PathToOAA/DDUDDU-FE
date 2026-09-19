import { useEffect, useId, useRef, useState } from "react";
import type { RecommendationDraftResponse } from "../../types/recommendation";

type Props = { result: RecommendationDraftResponse; courseIndex: number; onBack: () => void };

export default function CourseMap({ result, courseIndex, onBack }: Props) {
  const course = result.courses[courseIndex];
  const [dayIndex, setDayIndex] = useState(0);
  const day = course.days[dayIndex] ?? course.days[0];
  return <section className="p-4">
    <button type="button" onClick={onBack} className="mb-3 rounded-lg border px-3 py-2">← 추천 결과</button>
    <h2 className="text-lg font-bold">{course.title}</h2>
    <p className="mt-2 text-sm">출발: {result.departure?.title} · 복귀: {result.returnPoint?.title}</p>
    <div className="my-3 flex gap-2" aria-label="지도에 표시할 여행일">
      {course.days.map((item, index) => <button type="button" key={item.day} aria-pressed={index === dayIndex}
        onClick={() => setDayIndex(index)} className={`rounded-lg border px-4 py-2 ${index === dayIndex ? "bg-green-700 text-white" : "bg-white"}`}>{item.day}일차</button>)}
    </div>
    <CourseMapCanvas key={`${courseIndex}-${day.day}`} result={result} courseIndex={courseIndex} dayIndex={dayIndex} />
    <p className="mt-3 text-xs text-gray-600">초록 선: 도보 · 파란 선: 대중교통. 조회된 경로만 표시해요. 장소의 체류 시간은 정하지 않아요.</p>
    {course.days.length > 1 && <p className="mt-2 text-xs text-amber-800">첫날 출발·마지막 날 복귀를 포함해요. 숙소와 날짜 사이 이동은 아직 포함하지 않았어요.</p>}
  </section>;
}

function CourseMapCanvas({ result, courseIndex, dayIndex }: Omit<Props, "onBack"> & { dayIndex: number }) {
  const id = `course-map-${useId().replace(/:/g, "")}`;
  const mapRef = useRef<Tmapv2.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const day = result.courses[courseIndex].days[dayIndex];
  const transfers = result.routeAnalysis?.find((a) => a.courseIndex === courseIndex)?.transfers.filter((t) => t.day === day.day) ?? [];
  const places = day.contentIds.map((id) => result.places.find((p) => p.contentId === id)).filter((p) => p !== undefined);
  const incomplete = transfers.some((t) => t.route.status !== "FOUND" || !t.route.paths?.length ||
    (t.route.mode === "TRANSIT" && t.route.legs.some((l) => !l.paths?.length)));

  useEffect(() => {
    let disposed = false;
    const markers: Tmapv2.Marker[] = [];
    const lines: Tmapv2.Polyline[] = [];
    let attempts = 0;
    const timer = window.setInterval(() => {
      if (disposed) return;
      if (typeof Tmapv2 === "undefined") {
        if (++attempts >= 40) { window.clearInterval(timer); setError("지도를 불러오지 못했어요. 지도 API 키와 네트워크를 확인한 뒤 새로고침해주세요."); }
        return;
      }
      window.clearInterval(timer);
      try {
        const selectedDay = result.courses[courseIndex].days[dayIndex];
        const points = selectedDay.contentIds.map((id) => result.places.find((p) => p.contentId === id)).filter((p) => p !== undefined);
        if (!points.length) { setError("표시할 장소가 없어요."); return; }
        const map = new Tmapv2.Map(id, { center: new Tmapv2.LatLng(points[0].latitude, points[0].longitude), width: "100%", height: "420px", zoom: 13, zoomControl: true, scrollwheel: true });
        mapRef.current = map;
        const bounds = new Tmapv2.LatLngBounds();
        const grouped = new Map<string, { place: typeof points[number]; labels: string[] }>();
        points.forEach((place, index) => {
          const label = place.contentId.startsWith("hub:") ? (index === 0 ? "출발" : "복귀") : String(index + 1);
          const existing = grouped.get(place.contentId);
          if (existing) existing.labels.push(label); else grouped.set(place.contentId, { place, labels: [label] });
        });
        grouped.forEach(({ place, labels }) => {
          const position = new Tmapv2.LatLng(place.latitude, place.longitude);
          bounds.extend(position);
          const marker = new Tmapv2.Marker({ position, map, title: `${labels.join("·")} ${place.title}`,
            iconSize: new Tmapv2.Size(80, 36), iconHTML: `<div style="display:inline-block;background:${place.contentId.startsWith("hub:") ? "#b45309" : "#16883b"};color:white;border:2px solid white;border-radius:20px;padding:5px 9px;white-space:nowrap;font-size:12px;font-weight:bold">${labels.join("·")}</div>` });
          marker.addListener("click", () => { if (!disposed) setSelectedName(place.title); });
          markers.push(marker);
        });
        const routes = result.routeAnalysis?.find((a) => a.courseIndex === courseIndex)?.transfers.filter((t) => t.day === selectedDay.day) ?? [];
        routes.forEach(({ route }) => {
          (route.paths ?? []).forEach((path) => {
            if (path.points.length < 2) return;
            const positions = path.points.map((p) => new Tmapv2.LatLng(p.latitude, p.longitude));
            positions.forEach((p) => bounds.extend(p));
            lines.push(new Tmapv2.Polyline({ map, path: positions, strokeColor: path.mode === "WALK" ? "#16883b" : "#2563eb", strokeWeight: 5, strokeOpacity: 0.85 }));
          });
        });
        map.fitBounds(bounds);
      } catch {
        setError("지도 표시 중 오류가 발생했어요. 새로고침 후 다시 시도해주세요.");
      }
    }, 250);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      markers.forEach((m) => m.setMap(null));
      lines.forEach((l) => l.setMap(null));
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [result, courseIndex, dayIndex, id]);

  return <>
    {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div id={id} className="h-[420px] overflow-hidden rounded-xl border" aria-label="여행 코스 TMAP 지도" />
    {incomplete && <p className="mt-2 text-sm text-amber-800">일부 구간은 조회 실패 또는 경로선 정보 부족으로 지도에 표시되지 않아요.</p>}
    {selectedName && <p role="status" className="mt-2 rounded-lg bg-green-50 p-3 text-sm">선택한 장소: {selectedName}</p>}
    <ol className="mt-3 space-y-2">
      {places.map((place, index) => <li key={`${index}-${place.contentId}`}>
        <button type="button" className="w-full rounded-lg border p-3 text-left text-sm" onClick={() => {
          setSelectedName(place.title);
          if (typeof Tmapv2 !== "undefined") mapRef.current?.setCenter(new Tmapv2.LatLng(place.latitude, place.longitude));
        }}>{index + 1}. {place.contentId.startsWith("hub:") ? `${index === 0 ? "출발" : "복귀"} · ` : ""}{place.title}</button>
      </li>)}
    </ol>
  </>;
}

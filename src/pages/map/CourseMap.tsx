import KakaoMap from "../../components/KakaoMap";
import TourPhoto from "../../components/tour/TourPhoto";
import PlaceCard, { type SelectedPlace } from "../../components/tour/PlaceCard";
import SaveCourseHeart from "../../components/course/SaveCourseHeart";
import TransferCaption from "../recommendation/TransferCaption";
import { loadCourseDetail, retryCourseDetail } from "../../api/courseDetail";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RecommendationDraftResponse } from "../../types/recommendation";

type Props = { result: RecommendationDraftResponse; courseIndex: number; onBack: () => void; onUpdate?: (r: RecommendationDraftResponse) => void; initiallySaved?: boolean };

export default function CourseMap({ result: initialResult, courseIndex, onBack, onUpdate, initiallySaved }: Props) {
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(true);
  const [routeError, setRouteError] = useState("");
  const updateRef = useRef(onUpdate);
  useEffect(() => { updateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => {
    let active = true;
    loadCourseDetail(initialResult, courseIndex).then(next => {
      if (active) { setResult(next); updateRef.current?.(next); }
    }).catch(e => { if(active) setRouteError(e instanceof Error ? e.message : "이동 정보를 불러오지 못했어요."); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  }, [initialResult, courseIndex]);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const course = result.courses[courseIndex];
  const [dayIndex, setDayIndex] = useState(0);
  const day = course.days[dayIndex] ?? course.days[0];
  const stops = day.contentIds.map(id=>result.places.find(p=>p.contentId===id)).filter(p=>p!==undefined);
  const hero = course.days.flatMap(d=>d.contentIds).map(id=>result.places.find(p=>p.contentId===id)).find(p=>p?.imageUrl);
  const analysis = result.routeAnalysis.find(a=>a.courseIndex===courseIndex);
  return <section className="pb-6">
    <div className="relative h-60 overflow-hidden bg-green-900">
      <TourPhoto src={hero?.imageUrl} alt={hero?.title??course.title} className="h-full w-full object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20"/>
      <button type="button" aria-label="뒤로" onClick={onBack} className="absolute left-4 top-4 rounded-full bg-white/95 p-2.5"><ArrowLeft size={20}/></button>
      <div className="absolute bottom-5 left-5 right-5"><span className="rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">나의 여행 코스</span><h1 className="mt-3 text-2xl font-extrabold leading-tight text-white">{course.title}</h1></div>
    </div>
    <div className="px-5">
    <div className="flex items-center justify-between py-4"><p className="text-xs text-gray-500">{result.source === "TOUR_API" ? "추천 코스" : result.conditions.travelType === "DAY_TRIP" ? "당일치기" : `${course.days.length}일 일정`} · {analysis?.durationSeconds!=null?`이동 ${Math.ceil(analysis.durationSeconds/60)}분`:"이동 확인 중"} · 도보 {analysis?.walkDistanceMeters!=null?`${(analysis.walkDistanceMeters/1000).toFixed(1)}km`:"미확인"}</p><SaveCourseHeart result={result} courseIndex={courseIndex} onUpdate={setResult} initiallySaved={initiallySaved}/></div>
    <div aria-disabled="true" className="flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-4 text-gray-400"><span className="text-sm font-semibold">여행 예산</span><span className="rounded-full bg-gray-200 px-3 py-1 text-xs">준비 중</span></div>
    <p className="mt-5 text-sm leading-6 text-gray-600">{course.reason}</p>
    <h2 className="mt-7 text-lg font-bold">코스 일정</h2>
    <div className="my-3 flex gap-2" aria-label="지도에 표시할 여행일">
      {course.days.map((item, index) => <button type="button" key={item.day} aria-pressed={index === dayIndex}
        onClick={() => setDayIndex(index)} className={`rounded-lg border px-4 py-2 ${index === dayIndex ? "bg-green-700 text-white" : "bg-white"}`}>{result.source === "TOUR_API" ? "추천 코스" : result.conditions.travelType === "DAY_TRIP" ? "당일치기" : `${item.day}일차`}</button>)}
    </div>
    <ol className="my-5 ml-3 border-l-2 border-dashed border-green-200">{stops.map((place,index)=><li key={`${index}-${place.contentId}`} className="relative pb-5 pl-6 last:pb-1"><span className="absolute -left-3 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">{index+1}</span><button type="button" onClick={()=>setSelectedPlace(place)} className="flex w-full items-center gap-3 rounded-xl p-1 text-left hover:bg-green-50">{!place.contentId.startsWith("hub:")&&<TourPhoto src={place.imageUrl} alt="" className="h-14 w-16 shrink-0 rounded-lg object-cover"/>}<div><p className="text-sm font-bold">{place.title}</p><p className="mt-1 text-xs text-gray-500">{place.address||"출발·복귀 지점"}</p></div></button>{index < stops.length - 1 && <TransferCaption route={analysis?.transfers.filter(t=>t.day===day.day)[index]?.route} loading={loading}/>}</li>)}</ol>
    <h2 className="mb-3 mt-7 text-lg font-bold">지도에서 보기</h2>
    <CourseMapCanvas onSelectPlace={setSelectedPlace} key={`${courseIndex}-${day.day}`} result={result} courseIndex={courseIndex} dayIndex={dayIndex} />
    <p className="mt-3 text-xs text-gray-600">초록 선: 도보 · 파란 선: 대중교통. 정류장 연결 도보선은 일부 생략될 수 있어요.</p>
    {loading && <p role="status" className="mt-4 text-sm text-green-700">이동 경로를 찾고 있어요…</p>}
    {routeError && <div role="alert" className="mt-3 text-sm text-red-700">{routeError}<button className="ml-2 underline" disabled={loading} onClick={async()=>{ setLoading(true);setRouteError("");try { const next=await retryCourseDetail(result,courseIndex);setResult(next);onUpdate?.(next); } catch(e){setRouteError(e instanceof Error?e.message:"조회 실패");}finally{setLoading(false);} }}>다시 시도</button></div>}
    {course.days.length > 1 && <p className="mt-2 text-xs text-amber-800">첫날 출발·마지막 날 복귀를 포함해요. 숙소와 날짜 사이 이동은 아직 포함하지 않았어요.</p>}
    </div>{selectedPlace&&<PlaceCard key={selectedPlace.contentId} place={selectedPlace} onClose={()=>setSelectedPlace(null)}/>}
  </section>;
}

function CourseMapCanvas({ result, courseIndex, dayIndex, onSelectPlace }: Omit<Props, "onBack"> & { dayIndex: number; onSelectPlace: (place: SelectedPlace)=>void }) {
  const { places, paths, incomplete } = useMemo(() => {
    const day = result.courses[courseIndex].days[dayIndex];
    const places = day.contentIds.map(id => result.places.find(p => p.contentId === id)).filter(p => p !== undefined);
    const transfers = result.routeAnalysis.find(a => a.courseIndex === courseIndex)?.transfers.filter(t => t.day === day.day) ?? [];
    return { places, paths: transfers.flatMap(t => t.route.paths ?? []),
      incomplete: transfers.some(t => t.route.status !== "FOUND" || !t.route.paths?.length) };
  }, [result, courseIndex, dayIndex]);
  return <>
    <KakaoMap places={places} paths={paths} onSelectPlace={onSelectPlace}/>
    {incomplete && <p className="mt-2 text-xs text-gray-500">아직 확인되지 않은 구간의 경로선은 표시되지 않아요.</p>}
  </>;
}

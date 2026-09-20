import { ChevronRight } from "lucide-react";
import SaveCourseHeart from "../../components/course/SaveCourseHeart";
import type { RecommendationDraftResponse } from "../../types/recommendation";
export default function CourseDraftResults({result,onOpenMap,onUpdateResult}: {
 result: RecommendationDraftResponse; onOpenMap:(index:number)=>void; onUpdateResult:(r:RecommendationDraftResponse)=>void;
}) {
 const names = new Map(result.places.map(p=>[p.contentId,p.title]));
 return <section className="mt-8 pb-8" aria-label="추천 코스"><h2 className="text-xl font-bold">추천 코스</h2>
 <div className="mt-4 space-y-4">{result.courses.map((course,index)=><article key={index} className="rounded-2xl border border-gray-200 bg-white p-5">
 <div className="flex items-start justify-between gap-2"><h3 className="pt-2 text-lg font-bold">{course.title}</h3>
 <SaveCourseHeart result={result} courseIndex={index} onUpdate={onUpdateResult} /></div>
 <p className="mt-2 text-sm leading-6 text-gray-600">{course.reason}</p>
 <div className="mt-3 space-y-2">{course.days.map(day=><p key={day.day} className="text-sm leading-6"><span className="mr-2 font-semibold text-green-700">{result.conditions.travelType === "DAY_TRIP" ? "당일치기" : `${day.day}일차`}</span>{day.contentIds.map(id=>names.get(id)??"장소").join(" → ")}</p>)}</div>
 <button type="button" onClick={()=>onOpenMap(index)} className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-green-700 py-3 font-semibold text-white">자세히 보기<ChevronRight size={18}/></button>
 </article>)}</div></section>;
}

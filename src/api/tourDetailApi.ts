import { apiUrl } from "./apiUrl";
export type TourItem = Record<string, string>;
export type TourDetail = { common: TourItem; intro: TourItem | TourItem[]; images: TourItem | TourItem[]; partial: boolean };
const cache = new Map<string, Promise<TourDetail>>();
export const items = (value: TourItem | TourItem[]): TourItem[] => Array.isArray(value) ? value : value && Object.keys(value).length ? [value] : [];
export function getTourDetail(id: string) {
 if (!cache.has(id)) cache.set(id, fetch(apiUrl(`/api/tour/places/${encodeURIComponent(id)}`)).then(async r => { if(!r.ok) throw new Error("관광지 정보를 불러오지 못했어요."); return r.json() as Promise<TourDetail>; }).catch(e => { cache.delete(id); throw e; }));
 return cache.get(id)!;
}
export async function getFeatured(): Promise<TourItem[]> {
 const r = await fetch(apiUrl("/api/tour/featured")); if (!r.ok) throw new Error("관광지를 불러오지 못했어요."); return items(await r.json());
}
export function plain(value?: string) {
 const doc = new DOMParser().parseFromString(value ?? "", "text/html");
 doc.querySelectorAll("script,style").forEach(e=>e.remove());
 doc.querySelectorAll("br").forEach(e=>e.replaceWith("\n"));
 return doc.body.textContent?.trim() ?? "";
}

export async function getReadyCourses(): Promise<TourItem[]> {
 const r=await fetch(apiUrl("/api/tour/courses"));if(!r.ok)throw new Error("여행 코스를 불러오지 못했어요.");return items(await r.json());
}
export async function openReadyCourse(course:TourItem) {
 const r=await fetch(apiUrl(`/api/tour/courses/${course.contentid}`));if(!r.ok)throw new Error("코스 일정을 불러오지 못했어요.");
 const data=await r.json() as {stops:TourItem[];itinerary:TourItem[]};
 const places=data.stops.map(p=>({contentId:p.contentid,title:p.title,address:p.addr1||"",imageUrl:p.firstimage||"",imageCopyrightType:p.cpyrhtDivCd||"",categoryCode:p.cat3||"",latitude:Number(p.mapy),longitude:Number(p.mapx)}));
 if(places.length<2 || places.length!==data.itinerary.length || places.some(p=>!p.latitude||!p.longitude))throw new Error("이 코스는 일부 장소의 지도 정보가 없어 아직 열 수 없어요.");
 const result: import("../types/recommendation").RecommendationDraftResponse={
 source:"TOUR_API",
 conditions:{regionCode:"51",themes:[],travelType:"DAY_TRIP",startTime:"09:00",endTime:"18:00",budget:70000,walkingPreference:"MEDIUM",includedCosts:[],departureHubCode:"",returnHubCode:""},
 courses:[{title:course.title,reason:"한국관광공사에서 제공하는 여행 코스예요. 방문 순서대로 둘러보세요.",days:[{day:1,contentIds:places.map(p=>p.contentId)}]}],places,departure:places[0],returnPoint:places[places.length-1],candidatePoolLimited:false,
 routeAnalysis:[{courseIndex:0,complete:false,durationSeconds:null,walkDistanceMeters:null,transportFareKrw:null,transfers:places.slice(1).map((p,i)=>({day:1,fromContentId:places[i].contentId,toContentId:p.contentId,route:{status:"PENDING",mode:null,message:"",durationSeconds:null,distanceMeters:null,walkDistanceMeters:null,fare:null,currency:null,paths:[],legs:[]}}))}]
 };
 const {courseSummary}=await import("./courseDetail");return courseSummary(result,0);
}

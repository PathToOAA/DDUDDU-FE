import { useEffect, useRef, useState } from "react";
import { X, MapPin, Phone, Clock } from "lucide-react";
import { getTourDetail, items, plain, type TourDetail } from "../../api/tourDetailApi";
import TourPhoto from "./TourPhoto";
export type SelectedPlace = {contentId:string;title:string;address?:string;imageUrl?:string};
export default function PlaceCard({place,onClose}:{place:SelectedPlace;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const [data,setData]=useState<TourDetail|null>(null),[error,setError]=useState("");
 useEffect(()=>{const el=dialog.current;const previous=document.activeElement as HTMLElement|null;el?.showModal();return()=>{el?.close();previous?.focus();};},[]);
 useEffect(()=>{let active=true;if(!/^\d+$/.test(place.contentId))return;
 getTourDetail(place.contentId).then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[place.contentId]);
 const common=data?.common;const intro=data?items(data.intro)[0]??{}:{};
 const photos=[...new Set([common?.firstimage,place.imageUrl,...(data?items(data.images).map(i=>i.originimgurl):[])].filter((s):s is string=>!!s))];
 const hours=intro.usetime||intro.opentimefood||intro.usetimeculture||intro.opentime||intro.usetimeleports;
 const rest=intro.restdate||intro.restdatefood||intro.restdateculture||intro.restdateshopping;
 return <dialog aria-label={`${place.title} 관광지 정보`} ref={dialog} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-24px)] max-w-[410px] overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-black/45">
 <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4"><h2 className="font-bold">{plain(common?.title)||place.title}</h2><button onClick={onClose} aria-label="관광지 정보 닫기" className="rounded-full p-2"><X size={20}/></button></div>
 <TourPhoto src={photos[0]} alt={place.title} className="h-56 w-full object-cover"/>
 {photos.length>1&&<div className="flex gap-2 overflow-x-auto p-3">{photos.slice(1,9).map(src=><TourPhoto key={src} src={src} alt={`${place.title} 사진`} className="h-28 w-40 shrink-0 rounded-xl object-contain"/>)}</div>}
 <div className="space-y-5 p-5"><p className="flex gap-2 text-sm text-gray-600"><MapPin size={17} className="shrink-0"/>{plain(common?.addr1)||place.address||"주소 정보 없음"}</p>
 {!data&&!error&&/^\d+$/.test(place.contentId)&&<p role="status" className="text-sm text-gray-500">관광지 정보를 불러오고 있어요…</p>}
 {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
 <p className="whitespace-pre-line text-sm leading-7 text-gray-700">{plain(common?.overview)||(!data?"":"등록된 소개가 없어요.")}</p>
 {hours&&<p className="flex gap-2 whitespace-pre-line text-sm"><Clock size={17} className="shrink-0"/>{plain(hours)}</p>}
 {rest&&<p className="text-sm">쉬는 날 · {plain(rest)}</p>}
 {(common?.tel||intro.infocenter||intro.infocenterfood)&&<p className="flex gap-2 text-sm"><Phone size={17}/>{plain(common?.tel||intro.infocenter||intro.infocenterfood)}</p>}
 {data?.partial&&<p className="text-xs text-amber-800">일부 이용 정보나 추가 사진을 불러오지 못했어요.</p>}
 <p className="text-[11px] text-gray-400">사진·정보 제공: 한국관광공사 TourAPI{common?.cpyrhtDivCd?` · ${common.cpyrhtDivCd}`:""}</p></div></dialog>;
}

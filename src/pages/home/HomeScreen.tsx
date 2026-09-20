import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { CourseSummary } from "../../data/mockCourses";
import { getFeatured, getReadyCourses, openReadyCourse, type TourItem } from "../../api/tourDetailApi";
import TourPhoto from "../../components/tour/TourPhoto";
import PlaceCard from "../../components/tour/PlaceCard";
export default function HomeScreen({onOpenRecommend,onOpenCourse}: {onOpenRecommend:()=>void;onOpenResults:()=>void;onOpenCourse:(course:CourseSummary)=>void}) {
 const [places,setPlaces]=useState<TourItem[]>([]),[selected,setSelected]=useState<TourItem|null>(null),[error,setError]=useState("");
 useEffect(()=>{let active=true;getFeatured().then(p=>{if(active)setPlaces(p);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 const [courses,setCourses]=useState<TourItem[]>([]),[opening,setOpening]=useState(false),[courseError,setCourseError]=useState("");
 useEffect(()=>{let active=true;getReadyCourses().then(c=>{if(active)setCourses(c);}).catch(e=>{if(active)setCourseError(e.message);});return()=>{active=false;};},[]);
 const hero=courses.find(p=>p.firstimage)??courses[0];
 return <section className="px-5 pt-7 pb-6"><header><h1 className="text-xl font-extrabold">뚜벅뚜벅</h1><p className="mt-1 text-xs text-gray-500">가볍게 떠나는, 나만의 강원도 여행</p></header>
 <h2 className="mb-4 mt-8 text-lg font-bold">오늘은 어디로 떠날까요?</h2>
 {hero&&<button disabled={opening} onClick={async()=>{setOpening(true);setCourseError("");try{onOpenCourse(await openReadyCourse(hero));}catch(e){setCourseError(e instanceof Error?e.message:"코스를 열지 못했어요.");}finally{setOpening(false);}}} className="relative h-60 w-full overflow-hidden rounded-2xl text-left"><TourPhoto src={hero.firstimage} alt={hero.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"/><div className="absolute bottom-5 left-5 right-5 text-white"><p className="text-xs">한국관광공사 추천 여행 코스</p><h3 className="mt-2 text-2xl font-bold">{hero.title}</h3><p className="mt-3 text-xs">{opening?"코스 여는 중…":"코스 자세히 보기"}</p><ArrowUpRight className="absolute bottom-0 right-0"/></div></button>}
 {courseError&&<p role="alert" className="mt-3 text-sm text-red-700">{courseError}</p>}{!hero&&!courseError&&<p className="rounded-2xl bg-green-50 p-8 text-sm">여행 코스를 불러오고 있어요…</p>}
 {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}{!places.length&&!error&&<p className="rounded-2xl bg-green-50 p-8 text-sm">여행지를 불러오고 있어요…</p>}
 <button onClick={onOpenRecommend} className="my-6 w-full rounded-xl bg-green-700 py-4 font-bold text-white">내 조건으로 코스 추천받기</button>
 <h2 className="mb-4 text-lg font-bold">강원도 관광지 둘러보기</h2><div className="grid grid-cols-2 gap-4">{places.slice(0,12).map(place=><button key={place.contentid} onClick={()=>setSelected(place)} className="text-left"><TourPhoto src={place.firstimage} alt={place.title} className="h-32 w-full rounded-xl object-cover"/><h3 className="mt-2 text-sm font-bold">{place.title}</h3><p className="mt-1 line-clamp-1 text-xs text-gray-500">{place.addr1}</p></button>)}</div><p className="mt-5 text-[10px] text-gray-400">사진·관광정보 제공: 한국관광공사 TourAPI</p>
 {selected&&<PlaceCard key={selected.contentid} place={{contentId:selected.contentid,title:selected.title,address:selected.addr1,imageUrl:selected.firstimage}} onClose={()=>setSelected(null)}/>}
 </section>;
}

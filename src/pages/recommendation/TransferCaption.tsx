import { Footprints, Bus, TrainFront } from "lucide-react";
import type { RouteSelection } from "../../types/recommendation";
const mins=(seconds:number)=>`${Math.ceil(seconds/60)}분`;
const dist=(meters:number)=>meters>=1000?`${(meters/1000).toFixed(1)}km`:`${Math.round(meters)}m`;
export default function TransferCaption({route,loading}:{route?:RouteSelection;loading:boolean}) {
 if(!route||route.status!=="FOUND") return <p className="ml-1 mt-3 text-xs text-gray-400">{loading?"이동 확인 중…":"이동 정보 미확인"}</p>;
 if(route.mode==="WALK") return <p className="ml-1 mt-3 flex items-center gap-1.5 text-xs text-gray-500"><Footprints size={13}/>도보 {route.durationSeconds==null?"":mins(route.durationSeconds)}{route.walkDistanceMeters==null?"":` · ${dist(route.walkDistanceMeters)}`}</p>;
 return <div className="ml-1 mt-3 space-y-1.5 text-xs text-gray-500">{route.legs.map((leg,i)=><p key={i} className="flex items-center gap-1.5">{leg.mode==="WALK"?<Footprints size={13}/>:leg.mode==="BUS"?<Bus size={13}/>:<TrainFront size={13}/>}<span>{leg.mode==="WALK"?`도보 ${mins(leg.durationSeconds)} · ${dist(leg.distanceMeters)}`:`${leg.routeName|| (leg.mode==="BUS"?"버스":"대중교통")} · ${mins(leg.durationSeconds)}`}</span></p>)}</div>;
}

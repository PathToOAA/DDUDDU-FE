import { useEffect, useMemo, useState } from "react";
import { fetchGangneungTourPlaces } from "../api/tourApi";
import type { TourPlace } from "../types/tour";
import KakaoMap from "./KakaoMap";
import type { RoutePath } from "../types/recommendation";
const paths: RoutePath[] = [];
export default function TourMap({onSelectPlace}: {onSelectPlace: (place: TourPlace) => void}) {
  const [items,setItems] = useState<TourPlace[]>([]);
  const [error,setError] = useState("");
  useEffect(() => {
    let active = true;
    fetchGangneungTourPlaces().then(data => { if(active) setItems(data); })
      .catch(() => { if(active) setError("관광지를 불러오지 못했어요."); });
    return () => { active = false; };
  },[]);
  const places = useMemo(() => items.filter(p => p.mapx && p.mapy && p.contentid && p.title).map(p => ({
    ...p, contentId: p.contentid!, title: p.title!, latitude:Number(p.mapy), longitude:Number(p.mapx),
  })),[items]);
  return error ? <p role="alert">{error}</p> : places.length ? <KakaoMap places={places} paths={paths} onSelectPlace={onSelectPlace} height={700}/> : <p role="status">지도를 준비하고 있어요…</p>;
}

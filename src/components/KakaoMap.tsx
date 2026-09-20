import { useEffect, useRef, useState } from "react";
import { loadKakaoMap } from "../api/kakaoMapSdk";
import type { RoutePath } from "../types/recommendation";

export type MapPlace = { contentId: string; title: string; latitude: number; longitude: number };
type Props<T extends MapPlace> = { places: T[]; paths: RoutePath[]; onSelectPlace: (place: T) => void; height?: number };
const valid = (p: {latitude: number; longitude: number}) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;

export default function KakaoMap<T extends MapPlace>({ places, paths, onSelectPlace, height = 420 }: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef(onSelectPlace);
  useEffect(() => { selectRef.current = onSelectPlace; }, [onSelectPlace]);
  const [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    const overlays: kakao.maps.CustomOverlay[] = [];
    const lines: kakao.maps.Polyline[] = [];
    let observer: ResizeObserver | undefined;
    const container = containerRef.current;
    if (!container) return;
    loadKakaoMap().then(() => {
      if (disposed) return;
      const points = places.filter(valid);
      if (!points.length) throw new Error("지도에 표시할 장소가 없어요.");
      setError("");
      const map = new kakao.maps.Map(container, { center: new kakao.maps.LatLng(points[0].latitude, points[0].longitude), level: 6 });
      map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
      const bounds = new kakao.maps.LatLngBounds();
      const grouped = new Map<string, { place: T; labels: string[] }>();
      points.forEach((place, index) => {
        const label = place.contentId.startsWith("hub:") ? (index === 0 ? "출발" : "복귀") : String(index + 1);
        const previous = grouped.get(place.contentId);
        if (previous) previous.labels.push(label);
        else grouped.set(place.contentId, {place, labels: [label]});
      });
      grouped.forEach(({place, labels}) => {
        const position = new kakao.maps.LatLng(place.latitude, place.longitude);
        bounds.extend(position);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = labels.join("·");
        button.setAttribute("aria-label", place.title + " 정보 보기");
        button.title = place.title;
        button.style.cssText = "background:" + (place.contentId.startsWith("hub:") ? "#b45309" : "#16883b") + ";color:white;border:2px solid white;border-radius:20px;padding:6px 10px;min-width:34px;font:700 12px Pretendard,sans-serif;box-shadow:0 2px 5px #0003;cursor:pointer";
        button.onclick = () => { if (!disposed) selectRef.current(place); };
        overlays.push(new kakao.maps.CustomOverlay({map, position, content: button, yAnchor: 1, zIndex: 3}));
      });
      paths.forEach(path => {
        if (path.points.length < 2 || !path.points.every(valid)) return;
        const positions = path.points.map(p => new kakao.maps.LatLng(p.latitude,p.longitude));
        positions.forEach(p => bounds.extend(p));
        lines.push(new kakao.maps.Polyline({map, path: positions, strokeWeight: 5, strokeColor: path.mode === "WALK" ? "#16883b" : "#2563eb", strokeOpacity: .85}));
      });
      map.setBounds(bounds, 45, 35, 35, 35);
      observer = new ResizeObserver(() => { if (!disposed) map.relayout(); });
      observer.observe(container);
    }).catch(e => { if (!disposed) setError(e instanceof Error ? e.message : "지도를 표시하지 못했어요."); });
    return () => {
      disposed = true;
      observer?.disconnect();
      overlays.forEach(overlay => overlay.setMap(null));
      lines.forEach(line => line.setMap(null));
      container.replaceChildren();
    };
  }, [places, paths]);
  return <>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div ref={containerRef} style={{height}} className="overflow-hidden rounded-xl border border-gray-200" aria-label="여행 코스 카카오 지도"/>
  </>;
}

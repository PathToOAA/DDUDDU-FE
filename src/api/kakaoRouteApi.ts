import { apiUrl } from "./apiUrl";
import type { CourseRouteAnalysis, RecommendationDraftResponse, RouteSelection } from "../types/recommendation";

export function summarizeCourse(analysis: CourseRouteAnalysis): CourseRouteAnalysis {
  const routes = analysis.transfers.map(t => t.route);
  const complete = routes.every(r => r.status === "FOUND");
  const sum = (field: "durationSeconds" | "walkDistanceMeters" | "fare") =>
    complete && routes.every(r => r[field] != null) ? routes.reduce((n,r) => n + r[field]!,0) : null;
  return {...analysis, complete, durationSeconds:sum("durationSeconds"), walkDistanceMeters:sum("walkDistanceMeters"),
    transportFareKrw:routes.every(r => r.currency === "KRW") ? sum("fare") : null};
}

export async function resolveCourseTransit(result: RecommendationDraftResponse, courseIndex: number, signal: AbortSignal,
  onProgress: (analysis: CourseRouteAnalysis) => void): Promise<void> {
  const original = result.routeAnalysis.find(a => a.courseIndex === courseIndex);
  if (!original) throw new Error("코스의 이동 구간 정보가 없어요.");
  let analysis = {...original, transfers:[...original.transfers]};
  const places = new Map(result.places.map(p => [p.contentId,p]));
  const resolved = new Map<string,RouteSelection>();
  for (let i=0;i<analysis.transfers.length;i++) {
    signal.throwIfAborted();
    const transfer = analysis.transfers[i];
    if (transfer.route.status !== "PENDING" && transfer.route.status !== "ERROR") continue;
    const from = places.get(transfer.fromContentId), to = places.get(transfer.toContentId);
    if (!from || !to) throw new Error("출발·도착 장소 정보가 없어요.");
    const pair = JSON.stringify([from.latitude,from.longitude,to.latitude,to.longitude]);
    let route = resolved.get(pair);
    if (!route) {
      const response = await fetch(apiUrl("/api/routes/select"), {
        method:"POST", headers:{"Content-Type":"application/json"},
        signal:AbortSignal.any([signal,AbortSignal.timeout(60000)]),
        body:JSON.stringify({preference:result.conditions.walkingPreference, points:{
          startName:from.title, startLatitude:from.latitude, startLongitude:from.longitude,
          endName:to.title, endLatitude:to.latitude, endLongitude:to.longitude,
        }}),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message ?? "카카오 이동 경로를 불러오지 못했어요.");
      if (!body || !["FOUND","DIFFICULT","ERROR"].includes(body.status) || !Array.isArray(body.legs) || !Array.isArray(body.paths))
        throw new Error("경로 응답이 올바르지 않아요.");
      if (body.status === "ERROR") throw new Error(body.message || "카카오 경로 조회에 실패했어요.");
      route = body as RouteSelection;
      resolved.set(pair,route);
    }
    analysis.transfers[i] = {...transfer,route};
    analysis = summarizeCourse(analysis);
    onProgress(analysis);
  }
}

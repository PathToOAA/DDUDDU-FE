import type { CourseRouteAnalysis, PlaceCandidateResponse, RecommendationDraftResponse, RoutePath, RouteSelection, WalkingPreference } from "../types/recommendation";

type Obj = Record<string, unknown>;
const obj = (value: unknown): Obj => value && typeof value === "object" ? value as Obj : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const number = (value: unknown): number | null => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const text = (value: unknown): string | null => typeof value === "string" ? value : null;
type Place = PlaceCandidateResponse["places"][number];

export class OdsayError extends Error {
  code: string; constructor(message: string, code = "") { super(message); this.code = code; }
}

export function parseOdsayRoute(payload: unknown, preference: WalkingPreference): { route: RouteSelection; mapObj: string | null } {
  const root = obj(payload);
  if (root.error) {
    const error = obj(Array.isArray(root.error) ? root.error[0] : root.error);
    const code = String(error.code ?? "UNKNOWN");
    const noRoute = ["3", "4", "5", "6", "-98", "-99"].includes(code);
    throw new OdsayError(noRoute ? "이 구간의 대중교통 경로를 찾지 못했어요." : "ODsay 요청이 거절됐어요. Web 키·등록 URI·호출 한도를 확인해주세요. (코드 " + code + ")", code);
  }
  const result = obj(root.result);
  // Intercity responses omit access/egress legs, so do not report them as a complete trip.
  if (number(result.searchType) === 1 || number(result.searchType) === 2) {
    throw new OdsayError("도시 간 경로는 출발·도착 연결 구간을 별도로 확인해야 해요.", "INTERCITY");
  }
  const candidates = array(result.path).map(obj).filter(path => {
    const info = obj(path.info);
    return number(info.totalTime) != null && number(info.totalDistance) != null &&
      number(info.totalWalk) != null && array(path.subPath).length > 0 &&
      array(path.subPath).every(raw => [1, 2, 3].includes(Number(obj(raw).trafficType)) &&
        number(obj(raw).sectionTime) != null && number(obj(raw).distance) != null) &&
      array(path.subPath).some(raw => [1, 2].includes(Number(obj(raw).trafficType)));
  });
  candidates.sort((a, b) => {
    const ai = obj(a.info), bi = obj(b.info);
    return (preference === "LOW" ? Number(ai.totalWalk) - Number(bi.totalWalk) : 0) ||
      Number(ai.totalTime) - Number(bi.totalTime) || Number(ai.totalWalk) - Number(bi.totalWalk);
  });
  if (!candidates.length) throw new OdsayError("사용 가능한 대중교통 경로가 없거나 응답 정보가 부족해요.", "NO_ROUTE");
  const best = candidates[0], info = obj(best.info);
  const legs: RouteSelection["legs"] = array(best.subPath).map(raw => {
    const leg = obj(raw);
    const lanes = Array.isArray(leg.lane) ? leg.lane.map(obj) : [obj(leg.lane)];
    return {
      mode: Number(leg.trafficType) === 3 ? "WALK" : Number(leg.trafficType) === 2 ? "BUS" : "SUBWAY",
      routeName: lanes.map(l => text(l.busNo) ?? text(l.name)).filter(Boolean).join(" / ") || null,
      startName: text(leg.startName), endName: text(leg.endName),
      durationSeconds: Number(leg.sectionTime) * 60, distanceMeters: Number(leg.distance),
      service: null, paths: [],
    };
  });
  return { mapObj: text(info.mapObj), route: {
    status: "FOUND", mode: "TRANSIT",
    message: preference === "LOW" ? "ODsay 조회 결과 중 걷는 거리가 적은 경로예요." : "ODsay 조회 결과 중 소요 시간이 짧은 경로예요.",
    durationSeconds: Number(info.totalTime) * 60, distanceMeters: Number(info.totalDistance),
    walkDistanceMeters: Number(info.totalWalk), fare: number(info.payment), currency: "KRW", legs, paths: [],
  }};
}

let nextRequestAt = 0;
let courseLookupActive = false;
async function requestOdsay(endpoint: string, params: Record<string, string>, signal: AbortSignal): Promise<unknown> {
  const key = (import.meta.env.VITE_ODSAY_API_KEY as string | undefined)?.trim();
  if (!key) throw new OdsayError("프론트 .env에 VITE_ODSAY_API_KEY를 설정하고 개발 서버를 다시 시작해주세요.");
  const url = new URL("https://api.odsay.com/v1/api/" + endpoint);
  Object.entries({ ...params, apiKey: key }).forEach(([k, v]) => url.searchParams.set(k, v));
  signal.throwIfAborted();
  const delay = Math.max(0, nextRequestAt - Date.now());
  nextRequestAt = Date.now() + delay + 1100;
  if (delay) await new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException("조회 중단", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, delay);
    signal.addEventListener("abort", abort, { once: true });
  });
  signal.throwIfAborted();
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]) });
  } catch {
    if (signal.aborted) throw new DOMException("조회 중단", "AbortError");
    throw new OdsayError("ODsay에 연결하지 못했어요. 네트워크와 등록 URI를 확인해주세요.");
  }
  if (!response.ok) throw new OdsayError("ODsay HTTP " + response.status + " 오류가 발생했어요.");
  try { return await response.json(); }
  catch { throw new OdsayError("ODsay 응답을 해석하지 못했어요."); }
}

export async function findOdsayRoute(from: Place, to: Place, preference: WalkingPreference, signal: AbortSignal): Promise<RouteSelection> {
  const { route } = parseOdsayRoute(await requestOdsay("searchPubTransPathT", {
    SX: String(from.longitude), SY: String(from.latitude),
    EX: String(to.longitude), EY: String(to.latitude), SearchType: "0",
  }, signal), preference);
  // Exact line geometry is fetched only when the user asks; stop coordinates are not road geometry.
  return { ...route, message: route.message + " 실시간 운행 여부와 지도 경로선은 포함하지 않아요." };
}

export async function findOdsayRouteWithGeometry(from: Place, to: Place, preference: WalkingPreference, signal: AbortSignal): Promise<RouteSelection> {
  const { route, mapObj } = parseOdsayRoute(await requestOdsay("searchPubTransPathT", {
    SX: String(from.longitude), SY: String(from.latitude),
    EX: String(to.longitude), EY: String(to.latitude), SearchType: "0",
  }, signal), preference);
  if (!mapObj) return { ...route, message: route.message + " 지도 경로선은 제공되지 않아요." };
  try {
    const root = obj(await requestOdsay("loadLane", { mapObject: "0:0@" + mapObj }, signal));
    if (root.error) throw new OdsayError("지도 경로선 조회 실패");
    const paths: RoutePath[] = array(obj(root.result).lane).flatMap(raw =>
      array(obj(raw).section).map(section => ({
        mode: "TRANSIT",
        points: array(obj(section).graphPos).map(point => ({
          latitude: Number(obj(point).y), longitude: Number(obj(point).x),
        })).filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180),
      })).filter(path => path.points.length >= 2));
    return { ...route, paths, message: route.message + " 실시간 운행 여부는 미확인이고, 환승·정류장 연결 도보선은 생략돼요." };
  } catch (error) {
    if (signal.aborted) throw error;
    // Stop additional calls after a geometry error.
    throw new OdsayError("대중교통 지도 경로선을 불러오지 못했어요. 경로선 옵션을 끄고 다시 조회해주세요.");
  }
}

export function summarizeCourse(analysis: CourseRouteAnalysis): CourseRouteAnalysis {
  const routes = analysis.transfers.map(t => t.route);
  const complete = routes.every(r => r.status === "FOUND");
  const sum = (field: "durationSeconds" | "walkDistanceMeters" | "fare") =>
    complete && routes.every(r => r[field] != null) ? routes.reduce((n, r) => n + r[field]!, 0) : null;
  return { ...analysis, complete, durationSeconds: sum("durationSeconds"), walkDistanceMeters: sum("walkDistanceMeters"),
    transportFareKrw: routes.every(r => r.currency === "KRW") ? sum("fare") : null };
}

export async function resolveCourseTransit(result: RecommendationDraftResponse, courseIndex: number, signal: AbortSignal,
  onProgress: (analysis: CourseRouteAnalysis) => void, geometry = false): Promise<void> {
  if (courseLookupActive) throw new OdsayError("진행 중인 코스 조회가 끝난 뒤 다시 눌러주세요.");
  courseLookupActive = true;
  try {
  const original = result.routeAnalysis.find(a => a.courseIndex === courseIndex);
  if (!original) throw new OdsayError("도보 분석 결과가 없어요. 백엔드를 다시 시작하고 코스를 생성해주세요.");
  let analysis = { ...original, transfers: [...original.transfers] };
  const places = new Map(result.places.map(p => [p.contentId, p]));
  // Reuse only within this explicit course lookup, not a persistent data cache.
  const resolved = new Map<string, RouteSelection>();
  for (let i = 0; i < analysis.transfers.length; i++) {
    signal.throwIfAborted();
    const transfer = analysis.transfers[i];
    if (transfer.route.status !== "PENDING") continue;
    const from = places.get(transfer.fromContentId), to = places.get(transfer.toContentId);
    if (!from || !to) throw new OdsayError("출발·도착 장소 정보가 없어요.");
    const key = JSON.stringify([from.contentId, to.contentId]);
    let route = resolved.get(key);
    if (!route) {
      try {
        route = await (geometry ? findOdsayRouteWithGeometry : findOdsayRoute)(from, to, result.conditions.walkingPreference, signal);
      } catch (error) {
        if (!(error instanceof OdsayError) || !["3", "4", "5", "6", "-98", "-99", "NO_ROUTE", "INTERCITY"].includes(error.code)) throw error;
        route = { status: "DIFFICULT", mode: null, message: error.message, durationSeconds: null, distanceMeters: null, walkDistanceMeters: null, fare: null, currency: null, legs: [], paths: [] };
      }
      resolved.set(key, route);
    }
    analysis.transfers[i] = { ...transfer, route };
    analysis = summarizeCourse(analysis);
    onProgress(analysis);
  }
  } finally { courseLookupActive = false; }
}

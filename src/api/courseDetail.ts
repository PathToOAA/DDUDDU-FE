import type { RecommendationDraftResponse } from "../types/recommendation";
import type { CourseSummary } from "../data/mockCourses";
import { resolveCourseTransit } from "./kakaoRouteApi";
const partials = new WeakMap<RecommendationDraftResponse, Map<number, RecommendationDraftResponse>>();
const requests = new WeakMap<RecommendationDraftResponse, Map<number, Promise<RecommendationDraftResponse>>>();
export function loadCourseDetail(result: RecommendationDraftResponse, index: number) {
  let entries = requests.get(result);
  if (!entries) { entries = new Map(); requests.set(result, entries); }
  const existing = entries.get(index);
  if (existing) return existing;
  const promise = (async () => {
    let current = partials.get(result)?.get(index) ?? result;
    if (current.routeAnalysis.find(a => a.courseIndex === index)?.transfers.some(t => t.route.status === "PENDING" || t.route.status === "ERROR")) {
      await resolveCourseTransit(current, index, new AbortController().signal, analysis => {
        current = { ...current, routeAnalysis: current.routeAnalysis.map(a => a.courseIndex === index ? analysis : a) };
        let progress = partials.get(result);
        if (!progress) { progress = new Map(); partials.set(result, progress); }
        progress.set(index, current);
      });
    }
    return current;
  })();
  entries.set(index, promise);
  // Keep a failed attempt until an explicit retry, so remounts do not consume quota.
  return promise;
}
export function retryCourseDetail(result: RecommendationDraftResponse, index: number) {
  requests.get(result)?.delete(index);
  return loadCourseDetail(result, index);
}
export function courseSummary(result: RecommendationDraftResponse, index: number): CourseSummary {
  const course = result.courses[index];
  const analysis = result.routeAnalysis.find(a => a.courseIndex === index);
  const ids = new Set(course.days.flatMap(d => d.contentIds));
  const places = result.places.filter(p => ids.has(p.contentId));
  const snapshot = { ...result, courses: [course], places,
    routeAnalysis: analysis ? [{ ...analysis, courseIndex: 0 }] : [] };
  return { id: index + 1, title: course.title, tags: `${course.days.length}일 코스`,
    walkDistance: analysis?.walkDistanceMeters == null ? "미확인" : `${(analysis.walkDistanceMeters / 1000).toFixed(1)}km`,
    busCount: analysis?.complete ? `${analysis.transfers.flatMap(t => t.route.legs).filter(l => l.mode === "BUS").length}회` : "미확인",
    duration: analysis?.durationSeconds == null ? "미확인" : `${Math.ceil(analysis.durationSeconds / 60)}분`,
    cost: analysis?.transportFareKrw ?? 0, budget: result.conditions.budget,
    images: places.map(p => p.imageUrl).filter(Boolean),
    stops: course.days.flatMap(d => d.contentIds.map(id => ({name: places.find(p => p.contentId === id)?.title ?? id, time: "", category: "", move: ""}))),
    detail: { result: snapshot, courseIndex: 0 } };
}

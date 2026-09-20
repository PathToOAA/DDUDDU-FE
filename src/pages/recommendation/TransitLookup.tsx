import { useEffect, useRef, useState } from "react";
import { Bus, LoaderCircle } from "lucide-react";
import { resolveCourseTransit } from "../../api/odsayApi";
import type { RecommendationDraftResponse } from "../../types/recommendation";

export default function TransitLookup({ result, courseIndex, onUpdate }: {
  result: RecommendationDraftResponse;
  courseIndex: number;
  onUpdate: (result: RecommendationDraftResponse) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const latestRef = useRef({ result, onUpdate });
  useEffect(() => { latestRef.current = { result, onUpdate }; }, [result, onUpdate]);
  useEffect(() => () => controllerRef.current?.abort(), []);
  const pending = result.routeAnalysis.find(a => a.courseIndex === courseIndex)?.transfers.filter(t => t.route.status === "PENDING") ?? [];
  if (!pending.length && !busy) return null;

  async function lookup() {
    if (controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true); setError("");
    try {
      await resolveCourseTransit(latestRef.current.result, courseIndex, controller.signal, analysis => {
        const current = latestRef.current;
        const updated = { ...current.result, routeAnalysis: current.result.routeAnalysis.map(a => a.courseIndex === courseIndex ? analysis : a) };
        latestRef.current = { ...current, result: updated };
        current.onUpdate(updated);
      }, geometry);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "대중교통 조회에 실패했어요.");
    } finally {
      controllerRef.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-3">
    <p className="text-sm">이 코스의 대중교통 {pending.length}개 구간을 조회할 수 있어요.</p>
    <label className="mt-2 flex items-center gap-2 text-xs">
      <input type="checkbox" checked={geometry} disabled={busy} onChange={e => setGeometry(e.target.checked)} />
      지도 경로선도 조회 (구간당 추가 호출)
    </label>
    <button type="button" disabled={busy} onClick={() => void lookup()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
      {busy ? <LoaderCircle size={18} className="motion-safe:animate-spin" aria-hidden="true" /> : <Bus size={18} aria-hidden="true" />}
      {busy ? "대중교통 조회 중…" : "이 코스 대중교통 조회"}
    </button>
    <p className="mt-2 text-xs text-gray-600">대중교통 정보 제공: ODsay. 조회할 때 API 호출량이 사용돼요.</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}
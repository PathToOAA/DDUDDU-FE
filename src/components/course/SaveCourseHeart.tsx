import { Heart, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { saveCourse } from "../../api/savedCourseApi";
import { courseSummary, loadCourseDetail } from "../../api/courseDetail";
import type { RecommendationDraftResponse } from "../../types/recommendation";
export default function SaveCourseHeart({ result, courseIndex, onUpdate, initiallySaved = false }: {
 result: RecommendationDraftResponse; courseIndex: number; onUpdate?: (r: RecommendationDraftResponse) => void; initiallySaved?: boolean;
}) {
 const [saved, setSaved] = useState(initiallySaved), [busy, setBusy] = useState(false), [error, setError] = useState("");
 return <div className="shrink-0 text-right">
 <button type="button" aria-label={saved ? "경로 포함 다시 저장" : "코스와 경로 저장"} aria-pressed={saved} disabled={busy}
 className="flex h-11 w-11 items-center justify-center rounded-full text-green-700 hover:bg-green-50 disabled:opacity-50"
 onClick={async () => { if (busy) return; setBusy(true); setError(""); try {
 const detail = await loadCourseDetail(result, courseIndex); onUpdate?.(detail);
 await saveCourse(courseSummary(detail, courseIndex)); setSaved(true);
 } catch(e) { setError(e instanceof Error ? e.message : "저장하지 못했어요."); } finally { setBusy(false); } }}>
 {busy ? <LoaderCircle size={21} className="animate-spin" /> : <Heart size={23} fill={saved ? "currentColor" : "none"} />}</button>
 {error && <p role="alert" className="max-w-48 text-xs text-red-700">{error}</p>}
 </div>;
}

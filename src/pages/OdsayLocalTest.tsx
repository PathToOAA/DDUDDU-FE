import { useState } from "react";
import { findOdsayRoute } from "../api/odsayApi";
import type { PlaceCandidateResponse, RouteSelection } from "../types/recommendation";

export default function OdsayLocalTest() {
  const [route, setRoute] = useState<RouteSelection | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const point = (id: string, latitude: number, longitude: number): PlaceCandidateResponse["places"][number] => ({
    contentId: id, title: id, latitude, longitude, address: "", imageUrl: "", imageCopyrightType: "", categoryCode: "",
  });
  async function test() {
    setBusy(true); setError("");
    try {
      setRoute(await findOdsayRoute(point("신논현", 37.5045, 127.025), point("양재", 37.4845, 127.034), "MEDIUM", new AbortController().signal));
    } catch (e) { setError(e instanceof Error ? e.message : "조회 실패"); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-xl p-6">
    <h1 className="text-xl font-bold">ODsay 로컬 연결 테스트</h1>
    <p className="my-4">신논현 → 양재. 버튼을 누르면 대중교통 API를 1회 호출해요.</p>
    <button disabled={busy} onClick={() => void test()} className="rounded-lg bg-green-700 px-4 py-3 text-white disabled:opacity-50">{busy ? "조회 중…" : "대중교통 1회 테스트"}</button>
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {route && <pre className="mt-4 overflow-auto rounded-lg bg-white p-4 text-xs">{JSON.stringify(route, null, 2)}</pre>}
  </main>;
}
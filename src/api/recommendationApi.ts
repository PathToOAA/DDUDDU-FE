import type {
  PlaceCandidateRequest,
  PlaceCandidateResponse,
} from "../types/recommendation";

export async function fetchPlaceCandidates(
  request: PlaceCandidateRequest,
): Promise<PlaceCandidateResponse> {
  const response = await fetch("/api/places/candidates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(
      `장소 후보를 조회하지 못했어요. 지역과 테마를 확인해주세요. (${response.status})`,
    );
  }
  return response.json();
}

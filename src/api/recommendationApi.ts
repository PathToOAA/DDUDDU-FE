import type {
  RecommendationDraftResponse,
  RecommendationPreparationResponse,
  RecommendationRequest,
} from "../types/recommendation";

export async function prepareRecommendation(
  request: RecommendationRequest,
): Promise<RecommendationPreparationResponse> {
  const response = await fetch("/api/recommendations/prepare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = `여행 준비 데이터를 불러오지 못했어요. (${response.status})`;

    try {
      const errorBody: unknown = await response.json();

      if (
        typeof errorBody === "object" &&
        errorBody !== null &&
        "message" in errorBody &&
        typeof errorBody.message === "string"
      ) {
        message = errorBody.message;
      }
    } catch {
      // JSON 오류 응답이 아니면 기본 메시지를 사용합니다.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function generateRecommendationDrafts(
  request: RecommendationRequest,
): Promise<RecommendationDraftResponse> {
  const response = await fetch("/api/recommendations/drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = `코스를 생성하지 못했어요. (${response.status})`;

    try {
      const body: unknown = await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string"
      ) {
        message = body.message;
      }
    } catch {
      // JSON 응답이 아니면 기본 오류 메시지를 표시합니다.
    }

    throw new Error(message);
  }

  return response.json();
}

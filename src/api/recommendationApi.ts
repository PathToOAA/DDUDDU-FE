import type {
  RecommendationDraftResponse,
  RecommendationJobResponse,
  RecommendationPreparationResponse,
  RecommendationRequest,
} from "../types/recommendation";
import { apiUrl } from "./apiUrl";

export async function prepareRecommendation(
  request: RecommendationRequest,
): Promise<RecommendationPreparationResponse> {
  const response = await fetch(apiUrl("/api/recommendations/prepare"), {
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
  const response = await fetch(apiUrl("/api/recommendations/drafts"), {
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

async function readJobResponse(
  response: Response,
): Promise<RecommendationJobResponse> {
  if (!response.ok) {
    let message = `요청을 처리하지 못했어요. (${response.status})`;

    if (response.status === 404) {
      message = "작업이 만료됐거나 서버가 재시작됐어요. 다시 생성해주세요.";
    } else if (response.status === 503) {
      message = "서버가 혼잡해요. 잠시 후 다시 시도해주세요.";
    }

    try {
      const body: unknown = await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message.trim()
      ) {
        message = body.message;
      }
    } catch {
      // JSON 오류 응답이 아니면 기본 메시지를 사용합니다.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function createRecommendationJob(
  request: RecommendationRequest,
  signal: AbortSignal,
): Promise<RecommendationJobResponse> {
  const response = await fetch(apiUrl("/api/recommendations/jobs"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });

  return readJobResponse(response);
}

export async function fetchRecommendationJob(
  jobId: string,
  signal: AbortSignal,
): Promise<RecommendationJobResponse> {
  const response = await fetch(
    apiUrl(`/api/recommendations/jobs/${encodeURIComponent(jobId)}`),
    {
      signal,
      cache: "no-store",
    },
  );

  return readJobResponse(response);
}

import { useEffect, useRef, useState } from "react";
import {
  createRecommendationJob,
  fetchRecommendationJob,
} from "../../../api/recommendationApi";
import type {
  RecommendationDraftResponse,
  RecommendationJobStatus,
  RecommendationRequest,
} from "../../../types/recommendation";

type LoadingStatus = RecommendationJobStatus | "SUBMITTING";

const STATUS_MESSAGES: Record<LoadingStatus, string> = {
  SUBMITTING: "여행 요청을 보내고 있어요…",
  QUEUED: "잠시만요, 순서를 기다리고 있어요…",
  SEARCHING_PLACES: "관광지를 알아보고 있어요…",
  GENERATING_COURSES: "취향에 맞는 코스를 구성하고 있어요…",
  CHECKING_ROUTES: "도보와 대중교통 경로를 확인하고 있어요…",
  COMPLETED: "여행 코스가 완성됐어요!",
  FAILED: "코스를 생성하지 못했어요.",
};

function waitForNextPoll(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("조회 중단", "AbortError"));
      return;
    }

    function onAbort() {
      window.clearTimeout(timer);
      reject(new DOMException("조회 중단", "AbortError"));
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, 2000);

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export default function useRecommendationJob() {
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState<LoadingStatus>("SUBMITTING");

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  async function generate(
    request: RecommendationRequest,
  ): Promise<RecommendationDraftResponse> {
    if (controllerRef.current) {
      throw new Error("이미 코스를 생성하고 있어요.");
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setIsSearching(true);
    setStatus("SUBMITTING");

    let timedOut = false;

    const timeout = window.setTimeout(
      () => {
        timedOut = true;
        controller.abort();
      },
      5 * 60 * 1000,
    );

    try {
      let job = await createRecommendationJob(request, controller.signal);

      while (true) {
        if (controller.signal.aborted) {
          throw new DOMException("조회 중단", "AbortError");
        }

        setStatus(job.status);

        if (job.status === "COMPLETED") {
          if (!job.result) {
            throw new Error("완료된 작업에 코스 결과가 없어요.");
          }

          return job.result;
        }

        if (job.status === "FAILED") {
          throw new Error(
            job.error || "코스 생성에 실패했어요. 다시 시도해주세요.",
          );
        }

        await waitForNextPoll(controller.signal);

        job = await fetchRecommendationJob(job.jobId, controller.signal);
      }
    } catch (error) {
      if (timedOut) {
        throw new Error(
          "5분 동안 완료되지 않아 상태 조회를 중단했어요. 서버 작업은 계속 진행될 수 있어요.",
          { cause: error },
        );
      }

      if (controller.signal.aborted) {
        throw new DOMException("조회 중단", "AbortError");
      }

      throw error;
    } finally {
      window.clearTimeout(timeout);

      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsSearching(false);
      }
    }
  }

  return {
    generate,
    isSearching,
    loadingMessage: STATUS_MESSAGES[status],
  };
}

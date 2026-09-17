import { useEffect, useState } from "react";
import ScreenHeader from "../../components/common/ScreenHeader";
import FormBlock from "../../components/common/FormBlock";
import Segmented from "../../components/common/Segmented";
import { generateRecommendationDrafts } from "../../api/recommendationApi";
import CourseDraftResults from "./CourseDraftResults";
import type {
  IncludedCost,
  RecommendationDraftResponse,
  RecommendationOptionsResponse,
  RecommendationRequest,
  TravelTheme,
  TravelType,
  WalkingPreference,
} from "../../types/recommendation";

const SUPPORTED_CANDIDATE_THEMES: TravelTheme[] = [
  "SEA",
  "CAFE",
  "NATURE",
  "FOOD",
  "TRADITIONAL_MARKET",
  "CULTURE_HISTORY",
];

const TRAVEL_OPTIONS: { value: TravelType; label: string }[] = [
  { value: "DAY_TRIP", label: "당일치기" },
  { value: "ONE_NIGHT", label: "1박 2일" },
  { value: "TWO_NIGHTS", label: "2박 3일" },
];

const WALKING_OPTIONS: { value: WalkingPreference; label: string }[] = [
  { value: "LOW", label: "적게 걷기" },
  { value: "MEDIUM", label: "적당히 걷기" },
  { value: "HIGH", label: "많이 걸어도 좋아요" },
];

const COST_OPTIONS: { value: IncludedCost; label: string }[] = [
  { value: "TRANSPORT", label: "교통비 포함" },
  { value: "FOOD", label: "식비 포함" },
  { value: "ACCOMMODATION", label: "숙박비 포함" },
];

export default function RecommendScreen() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [draftResult, setDraftResult] =
    useState<RecommendationDraftResponse | null>(null);

  const [regionCode, setRegionCode] = useState("");
  const [regions, setRegions] = useState<
    RecommendationOptionsResponse["regions"]
  >([]);

  const [themes, setThemes] = useState<RecommendationOptionsResponse["themes"]>(
    [],
  );

  const [selectedThemes, setSelectedThemes] = useState<TravelTheme[]>([]);

  const [travelType, setTravelType] = useState<TravelType>("DAY_TRIP");
  const [walkingPreference, setWalkingPreference] =
    useState<WalkingPreference>("MEDIUM");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [budget, setBudget] = useState(70000);

  const [includedCosts, setIncludedCosts] = useState<IncludedCost[]>([
    "TRANSPORT",
    "FOOD",
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const response = await fetch("/api/recommendation-options", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("테마 목록을 불러오지 못했어요.");
        }

        const data: RecommendationOptionsResponse = await response.json();

        if (!controller.signal.aborted) {
          setRegions(data.regions);

          // 선택지에 강릉이 있으면 기본값으로 사용한다.
          const defaultRegion =
            data.regions.find((region) => region.code === "GANGNEUNG") ??
            data.regions[0];

          setRegionCode(defaultRegion?.code ?? "");

          setThemes(data.themes);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("테마 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => controller.abort();
  }, []);

  function toggleTheme(code: TravelTheme) {
    if (isSearching || !SUPPORTED_CANDIDATE_THEMES.includes(code)) {
      return;
    }

    setSelectedThemes((previous) =>
      previous.includes(code)
        ? previous.filter((theme) => theme !== code)
        : [...previous, code],
    );

    setDraftResult(null);
    setSearchError(null);
  }

  async function handleSubmit() {
    if (
      isLoading ||
      error ||
      isSearching ||
      !regionCode ||
      selectedThemes.length === 0
    ) {
      return;
    }

    setSearchError(null);
    setDraftResult(null);

    if (!startTime || !endTime) {
      setSearchError("관광 시작 시간과 종료 시간을 입력해주세요.");
      return;
    }

    if (startTime >= endTime) {
      setSearchError("종료 시간은 시작 시간보다 늦게 설정해주세요.");
      return;
    }

    const request: RecommendationRequest = {
      regionCode,
      themes: [...selectedThemes],
      travelType,
      startTime,
      endTime,
      budget,
      walkingPreference,
      includedCosts: [...includedCosts],
    };

    setIsSearching(true);

    try {
      const result = await generateRecommendationDrafts(request);
      setDraftResult(result);
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "코스를 생성하지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <section className="px-5 pt-6">
      <ScreenHeader title="여행 조건을 선택해주세요" right="↻" />

      <FormBlock label="여행 지역">
        <p className="mb-2 text-sm text-gray-500">강원특별자치도</p>

        <select
          aria-label="여행 시군 선택"
          value={regionCode}
          disabled={isLoading || isSearching || error !== null}
          onChange={(event) => {
            setRegionCode(event.target.value);
            setDraftResult(null);
            setSearchError(null);
          }}
          className="w-full rounded-lg border border-[#b9ddc3] bg-white px-4 py-3 text-sm disabled:opacity-50"
        >
          <option value="" disabled>
            여행 지역을 선택해주세요
          </option>

          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.label}
            </option>
          ))}
        </select>
      </FormBlock>

      <FormBlock label="여행 기간">
        <Segmented
          options={TRAVEL_OPTIONS.map((option) => option.label)}
          activeIndex={TRAVEL_OPTIONS.findIndex(
            (option) => option.value === travelType,
          )}
          disabled={isSearching}
          onChange={(index) => {
            const option = TRAVEL_OPTIONS[index];
            if (!option) return;

            setTravelType(option.value);

            if (option.value === "DAY_TRIP") {
              setIncludedCosts((prev) =>
                prev.filter((cost) => cost !== "ACCOMMODATION"),
              );
            }
          }}
        />
      </FormBlock>

      <FormBlock label="걷기 선호도">
        <Segmented
          options={WALKING_OPTIONS.map((option) => option.label)}
          activeIndex={WALKING_OPTIONS.findIndex(
            (option) => option.value === walkingPreference,
          )}
          disabled={isSearching}
          onChange={(index) => {
            const option = WALKING_OPTIONS[index];
            if (option) setWalkingPreference(option.value);
          }}
        />
      </FormBlock>

      <FormBlock label="하루 관광 시간">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            시작 시간
            <input
              type="time"
              value={startTime}
              disabled={isSearching}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#e4e8e5] p-3"
            />
          </label>

          <label className="text-sm">
            종료 시간
            <input
              type="time"
              value={endTime}
              disabled={isSearching}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#e4e8e5] p-3"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-[#68736c]">
          여러 날 여행하면 매일 같은 관광 시간대를 적용해요.
        </p>
      </FormBlock>

      <FormBlock label="관심 테마">
        {isLoading && (
          <p className="text-sm text-gray-500">테마를 불러오고 있어요…</p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid grid-cols-4 gap-2">
          {themes.map((theme) => {
            const isSelected = selectedThemes.includes(theme.code);

            const isSupported = SUPPORTED_CANDIDATE_THEMES.includes(theme.code);

            return (
              <button
                key={theme.code}
                type="button"
                aria-pressed={isSelected}
                disabled={isSearching || !isSupported}
                onClick={() => toggleTheme(theme.code)}
                className={`min-h-16 rounded-lg border px-2 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? "border-[#b9ddc3] bg-[#eef8f0] text-[#126f33]"
                    : "border-[#e4e8e5] bg-white text-[#222]"
                }`}
              >
                <span className="block">{theme.label}</span>

                {!isSupported && (
                  <span className="mt-1 block text-[10px] text-gray-500">
                    준비 중
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </FormBlock>

      <FormBlock label="예산 설정">
        <div className="text-left">
          <p className="mb-1 text-2xl font-extrabold">
            {budget.toLocaleString("ko-KR")}원
          </p>

          <p className="mb-3 text-xs text-[#68736c]">
            1인 기준 여행 전체 예산이에요.
          </p>

          <input
            type="range"
            aria-label="여행 예산"
            min={10000}
            max={200000}
            step={1000}
            value={budget}
            disabled={isSearching}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="w-full accent-[#16883b]"
          />

          <div className="mt-1 flex justify-between text-xs text-[#68736c]">
            <span>10,000원</span>
            <span>200,000원</span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            {COST_OPTIONS.map((option) => {
              const disabled =
                isSearching ||
                (travelType === "DAY_TRIP" && option.value === "ACCOMMODATION");

              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 ${
                    disabled ? "opacity-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includedCosts.includes(option.value)}
                    disabled={disabled}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      setIncludedCosts((previous) =>
                        checked
                          ? [...previous, option.value]
                          : previous.filter((cost) => cost !== option.value),
                      );
                    }}
                    className="h-4 w-4 accent-[#16883b]"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </div>
      </FormBlock>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          isLoading ||
          error !== null ||
          isSearching ||
          !regionCode ||
          selectedThemes.length === 0
        }
        className="mt-6 w-full rounded-lg bg-[#16883b] py-4 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSearching
          ? "여행 코스를 만들고 있어요…"
          : searchError
            ? "여행 코스 다시 만들기"
            : "여행 코스 만들기"}{" "}
      </button>

      {isSearching && (
        <div
          role="status"
          className="mt-5 rounded-xl bg-[#eef8f0] p-5 text-center"
        >
          <div
            aria-hidden="true"
            className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#b9ddc3] border-t-[#16883b]"
          />

          <p className="mt-3 font-bold text-[#16883b]">
            여행 코스를 만들고 있어요
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            관광지 후보 조회와 AI 코스 생성을 진행해요.
            <br />
            완료되면 아래에 결과를 보여드릴게요.
          </p>
        </div>
      )}

      {searchError && (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {searchError}
        </div>
      )}

      {draftResult && !isSearching && (
        <CourseDraftResults result={draftResult} />
      )}
    </section>
  );
}

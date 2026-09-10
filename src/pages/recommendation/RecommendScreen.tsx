import { useEffect, useState } from "react";
import ScreenHeader from "../../components/common/ScreenHeader";
import FormBlock from "../../components/common/FormBlock";
import Segmented from "../../components/common/Segmented";
import { fetchPlaceCandidates } from "../../api/recommendationApi";
import type {
  PlaceCandidateRequest,
  PlaceCandidateResponse,
  RecommendationOptionsResponse,
  TravelTheme,
} from "../../types/recommendation";

const SUPPORTED_CANDIDATE_THEMES: TravelTheme[] = [
  "SEA",
  "CAFE",
  "NATURE",
  "FOOD",
  "TRADITIONAL_MARKET",
  "CULTURE_HISTORY",
];

export default function RecommendScreen() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [candidateResult, setCandidateResult] =
    useState<PlaceCandidateResponse | null>(null);

  const [regionCode, setRegionCode] = useState("");
  const [regions, setRegions] = useState<
    RecommendationOptionsResponse["regions"]
  >([]);

  const [themes, setThemes] = useState<RecommendationOptionsResponse["themes"]>(
    [],
  );

  const [selectedThemes, setSelectedThemes] = useState<TravelTheme[]>([]);

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

    setCandidateResult(null);
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

    const request: PlaceCandidateRequest = {
      regionCode,
      themes: selectedThemes,
    };

    setIsSearching(true);
    setSearchError(null);
    setCandidateResult(null);

    try {
      const result = await fetchPlaceCandidates(request);

      setCandidateResult(result);
      console.log("후보 조회 요청:", request);
      console.log("후보 조회 결과:", result);
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "장소 후보를 조회하지 못했어요.",
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
            setCandidateResult(null);
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
          options={["당일치기", "1박 2일", "2박 3일"]}
          activeIndex={0}
        />
      </FormBlock>

      <FormBlock label="이동 방식">
        <Segmented
          options={["대중교통 중심", "도보 중심", "걷는 거리 최소화"]}
          activeIndex={0}
        />
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
          <p className="mb-3 text-2xl font-extrabold">70,000원</p>
          <input
            type="range"
            min="10000"
            max="200000"
            defaultValue="70000"
            className="w-full accent-[#16883b]"
          />
          <div className="mt-1 flex justify-between text-xs text-[#68736c]">
            <span>10,000</span>
            <span>200,000+</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            {["교통비 포함", "식비 포함", "숙박비 포함"].map((item, index) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked={index < 2}
                  className="h-4 w-4 accent-[#16883b]"
                />
                {item}
              </label>
            ))}
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
        {isSearching ? "관광지를 알아보고 있어요…" : "장소 후보 조회하기"}
      </button>

      {searchError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {searchError}
        </p>
      )}

      {candidateResult && (
        <div className="mt-6" aria-live="polite">
          <p className="font-bold">
            장소 후보 {candidateResult.count}개를 찾았어요.
          </p>

          {candidateResult.truncated && (
            <p className="mt-2 text-sm text-amber-700">
              조회 한도에 도달하여 일부 후보만 표시합니다.
            </p>
          )}

          {candidateResult.count === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              선택한 조건에 맞는 장소가 없어요.
            </p>
          )}

          <ul className="mt-3 space-y-2">
            {candidateResult.places.map((place) => (
              <li
                key={place.contentId}
                className="rounded-lg border border-gray-200 p-3"
              >
                <p className="font-semibold">{place.title}</p>
                <p className="mt-1 text-sm text-gray-500">{place.address}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

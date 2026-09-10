import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import TourMap from "./components/TourMap";
import { cities, recommendedCourses } from "./data/mockCourses";
import type { CourseSummary } from "./data/mockCourses";
import type { TourPlace } from "./types/tour";
import type {
  PlaceCandidateRequest,
  PlaceCandidateResponse,
  RecommendationOptionsResponse,
  TravelTheme,
} from "./types/recommendation";
import { fetchPlaceCandidates } from "./api/recommendationApi";

type TabKey = "home" | "recommend" | "map" | "saved" | "my";
type ScreenKey = TabKey | "results" | "detail" | "chat";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("home");
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary>(
    recommendedCourses[0],
  );
  const [selectedPlace, setSelectedPlace] = useState<TourPlace | null>(null);

  const activeTab = useMemo<TabKey>(() => {
    if (activeScreen === "results" || activeScreen === "detail") {
      return "recommend";
    }

    if (activeScreen === "chat") {
      return "home";
    }

    return activeScreen;
  }, [activeScreen]);

  const openCourse = (course: CourseSummary) => {
    setSelectedCourse(course);
    setActiveScreen("detail");
  };

  return (
    <main className="min-h-screen bg-[#f5f6f4] text-[#171c19]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-sm">
        <div className="min-h-screen pb-20">
          {activeScreen === "home" && (
            <HomeScreen
              onOpenRecommend={() => setActiveScreen("recommend")}
              onOpenResults={() => setActiveScreen("results")}
              onOpenCourse={openCourse}
            />
          )}

          {activeScreen === "recommend" && <RecommendScreen />}

          {activeScreen === "results" && (
            <ResultsScreen
              onBack={() => setActiveScreen("recommend")}
              onOpenCourse={openCourse}
            />
          )}

          {activeScreen === "detail" && (
            <DetailScreen
              course={selectedCourse}
              onBack={() => setActiveScreen("results")}
              onOpenMap={() => setActiveScreen("map")}
            />
          )}

          {activeScreen === "map" && (
            <MapScreen
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onBackToResults={() => setActiveScreen("results")}
            />
          )}

          {activeScreen === "saved" && (
            <SavedScreen onOpenCourse={openCourse} />
          )}

          {activeScreen === "my" && <MyScreen />}

          {activeScreen === "chat" && (
            <ChatScreen
              onClose={() => setActiveScreen("home")}
              onOpenCourse={() => openCourse(recommendedCourses[0])}
            />
          )}
        </div>

        <BottomNav activeTab={activeTab} onChange={setActiveScreen} />
      </div>

      {activeScreen !== "chat" && (
        <button
          type="button"
          onClick={() => setActiveScreen("chat")}
          className="fixed bottom-24 left-1/2 z-20 h-12 w-12 translate-x-[150px] rounded-full bg-[#16883b] text-xl text-white shadow-lg"
          aria-label="챗봇 열기"
        >
          ··
        </button>
      )}
    </main>
  );
}

function HomeScreen({
  onOpenRecommend,
  onOpenResults,
  onOpenCourse,
}: {
  onOpenRecommend: () => void;
  onOpenResults: () => void;
  onOpenCourse: (course: CourseSummary) => void;
}) {
  return (
    <section className="px-5 pt-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-normal text-[#101713]">
            뚜벅뚜벅
          </h1>
          <p className="mt-1 text-xs text-[#68736c]">
            지혜로운 뚜벅이 여행의 시작
          </p>
        </div>
        <button className="h-9 w-9 rounded-full border border-[#e3e8e4] text-lg">
          ♧
        </button>
      </header>

      <SectionTitle
        title="오늘의 추천 코스"
        action="더보기"
        onClick={onOpenResults}
      />

      <button
        type="button"
        onClick={() => onOpenCourse(recommendedCourses[0])}
        className="relative mb-7 h-48 w-full overflow-hidden rounded-lg text-left text-white shadow-sm"
      >
        <img
          src={recommendedCourses[0].images[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/25 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-5">
          <span className="self-end text-xl">×</span>
          <div>
            <p className="text-2xl font-extrabold leading-tight">
              5만원으로 떠나는
              <br />
              강릉 당일치기
            </p>
            <p className="mt-3 text-sm font-semibold">
              강릉역 출발 · 도보 4.2km · 버스 3회
            </p>
            <p className="mt-1 text-sm font-semibold">예상 비용 47,300원</p>
          </div>
        </div>
      </button>

      <SectionTitle title="이런 도시는 어때요?" action="전체보기" />
      <div className="mb-8 grid grid-cols-4 gap-3">
        {cities.map((city) => (
          <article key={city.name} className="text-left">
            <img
              src={city.image}
              alt={city.name}
              className="mb-2 h-24 w-full rounded-lg object-cover"
            />
            <h3 className="text-sm font-bold">{city.name}</h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#68736c]">
              {city.description}
            </p>
          </article>
        ))}
      </div>

      <SectionTitle title="인기 뚜벅이 코스" />
      <div className="space-y-3">
        {recommendedCourses.slice(1).map((course) => (
          <CompactCourseCard
            key={course.id}
            course={course}
            onClick={() => onOpenCourse(course)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenRecommend}
        className="mt-6 w-full rounded-lg bg-[#16883b] py-4 text-sm font-bold text-white"
      >
        내 조건으로 코스 추천받기
      </button>
    </section>
  );
}

function RecommendScreen() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [candidateResult, setCandidateResult] =
    useState<PlaceCandidateResponse | null>(null);

  const regionCode = "GANGNEUNG";

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
          setThemes(
            data.themes.filter(
              (theme) => theme.code === "SEA" || theme.code === "CAFE",
            ),
          );
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
    setSelectedThemes((previous) =>
      previous.includes(code)
        ? previous.filter((theme) => theme !== code)
        : [...previous, code],
    );
  }

  async function handleSubmit() {
    if (isLoading || error || isSearching || selectedThemes.length === 0) {
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
        <span className="inline-flex rounded-lg border border-[#b9ddc3] bg-[#eef8f0] px-4 py-2 text-sm font-bold text-[#16883b]">
          강릉 ×
        </span>
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

            return (
              <button
                key={theme.code}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleTheme(theme.code)}
                className={`min-h-16 rounded-lg border text-xs font-semibold ${
                  isSelected
                    ? "border-[#b9ddc3] bg-[#eef8f0] text-[#126f33]"
                    : "border-[#e4e8e5] bg-white text-[#222]"
                }`}
              >
                {theme.label}
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

function ResultsScreen({
  onBack,
  onOpenCourse,
}: {
  onBack: () => void;
  onOpenCourse: (course: CourseSummary) => void;
}) {
  return (
    <section className="pt-6">
      <div className="px-5">
        <ScreenHeader
          title="추천 코스 결과"
          left="‹"
          right="필터"
          onLeft={onBack}
        />
      </div>
      <div className="mt-2 grid grid-cols-4 border-b border-[#e7ebe8] text-center text-sm">
        {["추천순", "예산순", "도보 적은순", "인기순"].map((item, index) => (
          <button
            key={item}
            className={`py-3 ${index === 0 ? "border-b-2 border-[#16883b] font-bold text-[#16883b]" : "text-[#59625c]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-4 bg-[#f7f8f6] px-4 py-4">
        {recommendedCourses.map((course) => (
          <CourseResultCard
            key={course.id}
            course={course}
            onClick={() => onOpenCourse(course)}
          />
        ))}
      </div>
    </section>
  );
}

function DetailScreen({
  course,
  onBack,
  onOpenMap,
}: {
  course: CourseSummary;
  onBack: () => void;
  onOpenMap: () => void;
}) {
  return (
    <section>
      <div className="relative h-52 text-white">
        <img
          src={course.images[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-5 h-9 w-9 rounded-full bg-white/20 text-2xl"
        >
          ‹
        </button>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="mb-2 inline-flex rounded-full bg-[#16883b] px-3 py-1 text-xs font-bold">
            {course.badge ?? course.tags}
          </div>
          <h1 className="text-2xl font-extrabold">{course.title}</h1>
        </div>
      </div>

      <div className="px-5 py-5">
        <MetaRow course={course} />
        <div className="mt-6">
          <p className="text-sm font-bold">총 예상 비용</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-extrabold">
              {formatWon(course.cost)}원
            </p>
            <p className="text-sm font-bold text-[#16883b]">
              남은 예산 {formatWon(course.budget - course.cost)}원
            </p>
          </div>
          <ProgressBar value={(course.cost / course.budget) * 100} />
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            "교통\n24,000원",
            "식비\n31,000원",
            "카페/간식\n8,500원",
            "관광/입장\n10,000원",
          ].map((item) => (
            <div
              key={item}
              className="whitespace-pre-line rounded-lg border border-[#e7ebe8] py-3 text-center text-xs leading-5"
            >
              {item}
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-lg font-extrabold">코스 일정</h2>
        <div className="mt-4 space-y-4 border-l-2 border-dashed border-[#b9ddc3] pl-5">
          {course.stops.map((stop, index) => (
            <article key={stop.name} className="relative">
              <span className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#16883b] text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold">{stop.name}</h3>
                  <p className="mt-1 text-xs text-[#68736c]">{stop.move}</p>
                </div>
                <p className="text-xs text-[#68736c]">{stop.time}</p>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenMap}
          className="mt-8 w-full rounded-lg bg-[#16883b] py-4 text-sm font-bold text-white"
        >
          지도에서 코스 보기
        </button>
      </div>
    </section>
  );
}

function MapScreen({
  selectedPlace,
  onSelectPlace,
  onBackToResults,
}: {
  selectedPlace: TourPlace | null;
  onSelectPlace: (place: TourPlace) => void;
  onBackToResults: () => void;
}) {
  return (
    <section className="relative min-h-screen bg-[#edf2ed]">
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <button
          className="h-10 w-10 rounded-full bg-white shadow"
          onClick={onBackToResults}
        >
          ‹
        </button>
        <button className="rounded-lg bg-white px-4 py-2 text-sm font-bold shadow">
          목록보기
        </button>
      </div>
      <TourMap onSelectPlace={onSelectPlace} />
      <div className="absolute bottom-20 left-4 right-4 rounded-lg bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-extrabold">강릉 6만원 뚜벅이 코스</h2>
            <p className="mt-1 text-xs text-[#68736c]">
              총 7시간 / 도보 4.1km / 버스 3회
            </p>
          </div>
          <span className="text-[#8a958d]">⌃</span>
        </div>
        <div className="mt-4 space-y-3">
          {recommendedCourses[0].stops.slice(0, 4).map((stop, index) => (
            <div
              key={stop.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 font-bold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16883b] text-[11px] text-white">
                  {index + 1}
                </span>
                {stop.name}
              </span>
              <span className="text-xs text-[#68736c]">{stop.time}</span>
            </div>
          ))}
        </div>
        {selectedPlace && (
          <p className="mt-3 rounded-lg bg-[#eef8f0] p-3 text-xs font-bold text-[#126f33]">
            선택한 장소: {selectedPlace.title}
          </p>
        )}
      </div>
    </section>
  );
}

function SavedScreen({
  onOpenCourse,
}: {
  onOpenCourse: (course: CourseSummary) => void;
}) {
  return (
    <section className="px-5 pt-6">
      <ScreenHeader title="저장한 코스" />
      <div className="mt-6 space-y-3">
        {recommendedCourses.slice(0, 2).map((course) => (
          <CompactCourseCard
            key={course.id}
            course={course}
            onClick={() => onOpenCourse(course)}
          />
        ))}
      </div>
    </section>
  );
}

function ChatScreen({
  onClose,
  onOpenCourse,
}: {
  onClose: () => void;
  onOpenCourse: () => void;
}) {
  return (
    <section className="flex min-h-screen flex-col px-5 pt-6">
      <header className="flex items-center justify-between border-b border-[#e7ebe8] pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16883b] text-white">
            ··
          </span>
          <div>
            <h1 className="text-base font-extrabold">뚜벅이 여행 챗봇</h1>
            <p className="text-xs text-[#68736c]">무엇을 도와드릴까요?</p>
          </div>
        </div>
        <button onClick={onClose} className="h-9 w-9 rounded-full text-2xl">
          ×
        </button>
      </header>

      <div className="flex-1 space-y-4 py-5">
        <Bubble>
          안녕하세요! 뚜벅뚜벅 여행 도우미입니다. 여행 계획, 코스 추천, 교통
          정보 등을 안내해 드릴게요.
        </Bubble>
        <Bubble mine>강릉 당일치기 코스 추천해줘. 예산은 6만원 정도야!</Bubble>
        <Bubble>
          네! 강릉 당일치기 코스를 추천해 드릴게요. 예산 60,000원 기준 뚜벅이
          코스입니다.
        </Bubble>
        <article className="rounded-lg border border-[#e7ebe8] bg-white p-4 shadow-sm">
          <h2 className="font-extrabold">강릉 6만원 뚜벅이 코스</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {recommendedCourses[0].images.slice(0, 3).map((image) => (
              <img
                key={image}
                src={image}
                alt=""
                className="h-20 rounded-lg object-cover"
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-[#68736c]">
            도보 4.1km · 버스 3회 · 7시간
          </p>
          <button
            type="button"
            onClick={onOpenCourse}
            className="mt-4 w-full rounded-lg bg-[#16883b] py-3 text-sm font-bold text-white"
          >
            코스 자세히 보기
          </button>
        </article>
      </div>

      <div className="sticky bottom-20 bg-white pb-4">
        <div className="mb-3 flex gap-2 text-xs">
          {["교통편 알려줘", "맛집 추천해줘", "숙소 추천해줘"].map((item) => (
            <button
              key={item}
              className="rounded-full border border-[#e4e8e5] px-3 py-2"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#e4e8e5] px-4 py-2">
          <input
            className="min-w-0 flex-1 text-sm outline-none"
            placeholder="메시지를 입력하세요..."
          />
          <button className="h-9 w-9 rounded-full bg-[#16883b] text-white">
            ↗
          </button>
        </div>
      </div>
    </section>
  );
}

function MyScreen() {
  return (
    <section className="min-h-screen bg-[#f7f8f6]">
      <div className="bg-[#35a554] px-5 pb-10 pt-7 text-white">
        <div className="mb-8 flex justify-end">
          <button className="h-9 w-9 rounded-full text-xl">⚙</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl">
            ☺
          </span>
          <p className="font-bold">
            뚜벅님, 안녕하세요!
            <br />
            즐거운 뚜벅이 여행 되세요
          </p>
        </div>
      </div>

      <div className="-mt-5 px-5">
        <div className="grid grid-cols-3 rounded-lg bg-white py-5 text-center shadow-sm">
          {["저장한 코스\n12", "다녀온 코스\n5", "찜한 장소\n28"].map(
            (item) => (
              <div
                key={item}
                className="whitespace-pre-line border-r border-[#e7ebe8] last:border-r-0"
              >
                <span className="text-xs text-[#68736c]">
                  {item.split("\n")[0]}
                </span>
                <strong className="mt-2 block text-xl">
                  {item.split("\n")[1]}
                </strong>
              </div>
            ),
          )}
        </div>

        <div className="mt-6 rounded-lg bg-white">
          {[
            "내 코스 관리",
            "예약/결제 내역",
            "리뷰 관리",
            "관심 지역 설정",
            "알림 설정",
            "고객센터",
            "로그아웃",
          ].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between border-b border-[#edf0ed] px-4 py-4 text-sm last:border-b-0"
            >
              <span>{item}</span>
              <span className="text-[#8a958d]">›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseResultCard({
  course,
  onClick,
}: {
  course: CourseSummary;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-[#e7ebe8] bg-white p-4 text-left shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {course.badge && (
            <span className="rounded-full bg-[#16883b] px-3 py-1 text-[11px] font-bold text-white">
              {course.badge}
            </span>
          )}
          <h2 className="text-base font-extrabold">{course.title}</h2>
        </div>
        <span className="text-[#a6afa9]">♡</span>
      </div>
      <MetaRow course={course} />
      <div className="mt-3 grid grid-cols-4 gap-2">
        {course.images.map((image) => (
          <img
            key={image}
            src={image}
            alt=""
            className="h-16 rounded-lg object-cover"
          />
        ))}
      </div>
      <div className="mt-4 flex items-end justify-between text-sm">
        <span>
          총 예상 비용{" "}
          <strong className="text-base">{formatWon(course.cost)}원</strong>
        </span>
        <span className="text-xs text-[#68736c]">
          예산 {formatWon(course.budget)}원
        </span>
      </div>
      <ProgressBar value={(course.cost / course.budget) * 100} />
      <p className="mt-2 text-right text-xs font-bold text-[#16883b]">
        남은 예산 {formatWon(course.budget - course.cost)}원
      </p>
    </button>
  );
}

function CompactCourseCard({
  course,
  onClick,
}: {
  course: CourseSummary;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-[#e7ebe8] bg-white p-4 text-left"
    >
      <div>
        <h3 className="font-extrabold">{course.title}</h3>
        <p className="mt-3 text-xs text-[#3c4740]">
          도보 {course.walkDistance}
        </p>
        <p className="mt-1 text-xs text-[#3c4740]">버스 {course.busCount}</p>
        <p className="mt-1 text-xs text-[#3c4740]">
          예상 {formatWon(course.cost)}원
        </p>
      </div>
      <img
        src={course.images[0]}
        alt=""
        className="h-20 w-20 rounded-lg object-cover"
      />
    </button>
  );
}

function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const items: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: "home", label: "홈", icon: "⌂" },
    { key: "recommend", label: "추천", icon: "✦" },
    { key: "map", label: "지도", icon: "▱" },
    { key: "saved", label: "저장", icon: "♡" },
    { key: "my", label: "마이", icon: "♙" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 grid h-20 w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-[#e7ebe8] bg-white">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
            activeTab === item.key
              ? "font-bold text-[#16883b]"
              : "text-[#59625c]"
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function ScreenHeader({
  title,
  left,
  right,
  onLeft,
}: {
  title: string;
  left?: string;
  right?: string;
  onLeft?: () => void;
}) {
  return (
    <header className="mb-7 grid grid-cols-[44px_1fr_44px] items-center">
      <button className="h-10 text-2xl" onClick={onLeft}>
        {left}
      </button>
      <h1 className="text-center text-base font-extrabold">{title}</h1>
      <button className="h-10 text-sm font-bold text-[#59625c]">{right}</button>
    </header>
  );
}

function SectionTitle({
  title,
  action,
  onClick,
}: {
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-extrabold">{title}</h2>
      {action && (
        <button onClick={onClick} className="text-xs font-bold text-[#16883b]">
          {action} 〉
        </button>
      )}
    </div>
  );
}

function FormBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-7">
      <h2 className="mb-3 text-left text-sm font-extrabold">{label}</h2>
      {children}
    </div>
  );
}

function Segmented({
  options,
  activeIndex,
}: {
  options: string[];
  activeIndex: number;
}) {
  return (
    <div className="flex gap-2">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          className={`flex-1 rounded-lg border px-3 py-3 text-sm font-bold ${
            index === activeIndex
              ? "border-[#b9ddc3] bg-[#eef8f0] text-[#16883b]"
              : "border-[#e4e8e5] bg-white text-[#222]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MetaRow({ course }: { course: CourseSummary }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#59625c]">
      <span>도보 {course.walkDistance}</span>
      <span>버스 {course.busCount}</span>
      <span>{course.duration} 소요</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e3e8e4]">
      <div
        className="h-full rounded-full bg-[#16883b]"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function Bubble({
  children,
  mine = false,
}: {
  children: ReactNode;
  mine?: boolean;
}) {
  return (
    <div
      className={`max-w-[82%] rounded-lg px-4 py-3 text-left text-sm leading-6 ${
        mine ? "ml-auto bg-[#16883b] text-white" : "bg-[#f2f3f1] text-[#26302a]"
      }`}
    >
      {children}
    </div>
  );
}

export default App;

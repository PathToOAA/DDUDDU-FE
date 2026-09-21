import { MessageCircle } from "lucide-react";
import CourseMap from "../pages/map/CourseMap";
import type { RecommendationDraftResponse } from "../types/recommendation";
import { useMemo, useState } from "react";
import { recommendedCourses } from "../data/mockCourses";
import type { CourseSummary } from "../data/mockCourses";
import type { TourPlace } from "../types/tour";
import type { TabKey, ScreenKey } from "../types/navigation";
import RecommendScreen from "../pages/recommendation/RecommendScreen";
import HomeScreen from "../pages/home/HomeScreen";
import ResultsScreen from "../pages/recommendation/ResultsScreen";
import DetailScreen from "../pages/course/DetailScreen";
import MapScreen from "../pages/map/MapScreen";
import SavedScreen from "../pages/saved/SavedScreen";
import ChatScreen from "../pages/chat/ChatScreen";
import MyScreen from "../pages/my/MyScreen";
import BottomNav from "../components/layout/BottomNav";
import LoginScreen from "../pages/auth/LoginScreen";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import OnboardingPage from "../pages/recommendation/onboarding/OnboardingPage";

export default function AppShell() {
  const [showRecommendOnboarding, setShowRecommendOnboarding] = useState(
    () => localStorage.getItem("dduddu_recommend_onboarding") !== "completed",
  );

  const openRecommend = () => {
    const completed =
      localStorage.getItem("dduddu_recommend_onboarding") === "completed";

    if (completed) {
      setActiveScreen("recommend");
      return;
    }

    setShowRecommendOnboarding(true);
  };

  const completeRecommendOnboarding = () => {
    localStorage.setItem("dduddu_recommend_onboarding", "completed");
    setShowRecommendOnboarding(false);
  };

  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setShowLogin(!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setShowLogin(!session),
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("home");
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary>(
    recommendedCourses[0],
  );
  const [mapReturn, setMapReturn] = useState<"saved" | "recommend" | "home">(
    "recommend",
  );
  const [mapCourse, setMapCourse] = useState<{
    result: RecommendationDraftResponse;
    courseIndex: number;
  } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TourPlace | null>(null);

  const activeTab = useMemo<TabKey>(() => {
    if (activeScreen === "map" && mapReturn !== "recommend") return mapReturn;
    if (
      activeScreen === "results" ||
      activeScreen === "detail" ||
      activeScreen === "map"
    ) {
      return "recommend";
    }

    if (activeScreen === "chat") {
      return "home";
    }

    return activeScreen;
  }, [activeScreen, mapReturn]);

  const openCourse = (course: CourseSummary) => {
    if (course.detail) {
      setMapCourse(course.detail);
      setMapReturn(activeScreen === "saved" ? "saved" : "home");
      setActiveScreen("map");
      return;
    }
    setMapCourse(null);
    setSelectedCourse(course);
    setActiveScreen("detail");
  };

  if (showRecommendOnboarding) {
    return (
      <OnboardingPage
        onComplete={completeRecommendOnboarding}
        onSkip={completeRecommendOnboarding}
      />
    );
  }

  if (showLogin) return <LoginScreen onSkip={() => setShowLogin(false)} />;

  return (
    <main className="min-h-screen bg-[#f5f6f4] text-[#171c19]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-sm">
        <div className="min-h-screen pb-20">
          {activeScreen === "home" && (
            <HomeScreen
              onOpenRecommend={openRecommend}
              onOpenResults={() => setActiveScreen("results")}
              onOpenCourse={openCourse}
            />
          )}

          <div hidden={activeScreen !== "recommend"}>
            <RecommendScreen
              onOpenMap={(result, courseIndex) => {
                setMapReturn("recommend");
                setMapCourse({ result, courseIndex });
                setActiveScreen("map");
              }}
            />
          </div>

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

          {activeScreen === "map" && mapCourse && (
            <CourseMap
              key={`${mapCourse.courseIndex}-${mapCourse.result.courses[mapCourse.courseIndex].title}`}
              result={mapCourse.result}
              courseIndex={mapCourse.courseIndex}
              onBack={() => setActiveScreen(mapReturn)}
              initiallySaved={mapReturn === "saved"}
            />
          )}
          {activeScreen === "map" && !mapCourse && (
            <MapScreen
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onBackToResults={() => setActiveScreen("results")}
            />
          )}

          {activeScreen === "saved" && (
            <SavedScreen onOpenCourse={openCourse} />
          )}

          {activeScreen === "my" && (
            <MyScreen
              onOpenSaved={() => setActiveScreen("saved")}
              onLogin={() => setShowLogin(true)}
            />
          )}

          {activeScreen === "chat" && (
            <ChatScreen
              onClose={() => setActiveScreen("home")}
              onOpenCourse={() => openCourse(recommendedCourses[0])}
            />
          )}
        </div>
        <BottomNav
          activeTab={activeTab}
          onChange={(screen) => {
            if (screen === "recommend") {
              openRecommend();
              return;
            }

            setActiveScreen(screen);
          }}
        />
      </div>

      {activeScreen !== "chat" && (
        <button
          type="button"
          onClick={() => setActiveScreen("chat")}
          className="fixed bottom-24 left-1/2 z-20 flex h-12 w-12 items-center justify-center translate-x-[150px] rounded-full bg-[#16883b] text-xl text-white shadow-lg"
          aria-label="챗봇 열기"
        >
          <MessageCircle size={24} aria-hidden="true" />
        </button>
      )}
    </main>
  );
}

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

export default function AppShell() {
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

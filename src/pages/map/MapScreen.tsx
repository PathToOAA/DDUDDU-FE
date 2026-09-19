import TourMap from "../../components/TourMap";
import { recommendedCourses } from "../../data/mockCourses";
import type { TourPlace } from "../../types/tour";

export default function MapScreen({
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

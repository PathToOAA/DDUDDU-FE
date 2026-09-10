import type { TourPlace } from "../types/tour";

type SelectedPlaceCardProps = {
  place: TourPlace;
  onClose: () => void;
};

function SelectedPlaceCard({ place, onClose }: SelectedPlaceCardProps) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow">
      {place.firstimage && (
        <img
          src={place.firstimage}
          alt={place.title ?? "선택된 관광지"}
          className="h-64 w-full object-cover"
        />
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{place.title}</h2>

            <p className="mt-2 text-sm text-gray-500">{place.addr1}</p>

            {place.addr2 && (
              <p className="text-sm text-gray-500">{place.addr2}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => console.log("코스에 추가:", place)}
            className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            코스에 추가
          </button>

          <button
            onClick={() => console.log("상세보기 contentId:", place.contentid)}
            className="rounded-xl border border-gray-300 px-5 py-3 font-semibold"
          >
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectedPlaceCard;

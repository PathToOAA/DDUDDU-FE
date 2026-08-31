import { useEffect, useState } from "react";

function App() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  useEffect(() => {
    const container = document.getElementById("map_div");

    if (!container) return;

    container.innerHTML = "";

    const map = new Tmapv2.Map("map_div", {
      center: new Tmapv2.LatLng(37.78, 128.92),
      width: "100%",
      height: "700px",
      zoom: 13,
      zoomControl: true,
      scrollwheel: true,
    });

    // 관광지 API 호출
    const fetchTourPlaces = async () => {
      try {
        const serviceKey = import.meta.env.VITE_TOUR_API_KEY;

        const params = new URLSearchParams({
          MobileOS: "ETC",
          MobileApp: "DDUDDU",
          _type: "json",

          mapX: "128.8996",
          mapY: "37.7640",

          radius: "3000",

          // 관광지
          contentTypeId: "12",

          numOfRows: "20",
          pageNo: "1",
        });

        const response = await fetch(
          `/tour-api/B551011/KorService2/locationBasedList2?serviceKey=${serviceKey}&${params.toString()}`,
        );

        const text = await response.text();

        if (!response.ok) {
          console.error("관광 API HTTP 오류:", text);
          return;
        }

        const data = JSON.parse(text);

        const items = data?.response?.body?.items?.item ?? [];

        console.log("관광지 목록:", items);

        items.forEach((item: any) => {
          if (!item.mapx || !item.mapy) return;

          const lat = Number(item.mapy);
          const lng = Number(item.mapx);

          const marker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(lat, lng),
            map,
            title: item.title,
          });

          // 핀 클릭
          marker.addListener("click", () => {
            console.log("선택한 관광지:", item);

            setSelectedPlace(item);

            // 선택한 핀 위치로 지도 중심 살짝 이동
            map.setCenter(new Tmapv2.LatLng(lat, lng));
          });
        });
      } catch (error) {
        console.error("관광 API 호출 실패:", error);
      }
    };

    fetchTourPlaces();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-3xl font-bold">뚜벅뚜벅</h1>

        <p className="mb-5 text-gray-500">강릉 관광지 테스트</p>

        <div id="map_div" className="overflow-hidden rounded-2xl shadow" />

        {/* 선택한 관광지 카드 */}
        {selectedPlace && (
          <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow">
            {selectedPlace.firstimage && (
              <img
                src={selectedPlace.firstimage}
                alt={selectedPlace.title}
                className="h-64 w-full object-cover"
              />
            )}

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPlace.title}</h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {selectedPlace.addr1}
                  </p>

                  {selectedPlace.addr2 && (
                    <p className="text-sm text-gray-500">
                      {selectedPlace.addr2}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPlace(null)}
                  className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100"
                >
                  닫기
                </button>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => console.log("코스에 추가:", selectedPlace)}
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  코스에 추가
                </button>

                <button
                  onClick={() =>
                    console.log("상세보기 contentId:", selectedPlace.contentid)
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 font-semibold"
                >
                  상세보기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

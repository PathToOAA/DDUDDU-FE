import { useEffect } from "react";

const places = [
  {
    name: "강릉역",
    lat: 37.764,
    lng: 128.8996,
  },
  {
    name: "초당순두부마을",
    lat: 37.7912,
    lng: 128.9145,
  },
  {
    name: "경포호",
    lat: 37.7955,
    lng: 128.8965,
  },
  {
    name: "안목해변",
    lat: 37.7712,
    lng: 128.9472,
  },
];

function App() {
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

    places.forEach((place) => {
      new Tmapv2.Marker({
        position: new Tmapv2.LatLng(place.lat, place.lng),
        map,
        title: place.name,
      });
    });

    const fetchTransitRoute = async () => {
      const response = await fetch(
        "https://apis.openapi.sk.com/transit/routes",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            appKey: import.meta.env.VITE_TMAP_APP_KEY,
          },
          body: JSON.stringify({
            startX: "128.8996",
            startY: "37.7640",
            endX: "128.9145",
            endY: "37.7912",
            count: 1,
            lang: 0,
            format: "json",
          }),
        },
      );

      const data = await response.json();

      console.log("대중교통 응답:", data);

      console.log("metaData 전체:", data.metaData);
      console.log("경로:", data.metaData?.plan?.itineraries);
      console.log("요청정보:", data.metaData?.requestParameters);

      console.log(JSON.stringify(data, null, 2));
    };

    fetchTransitRoute();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-3xl font-bold">뚜벅뚜벅</h1>

        <p className="mb-5 text-gray-500">강릉 6만원 뚜벅이 코스</p>

        <div id="map_div" className="overflow-hidden rounded-2xl shadow" />
      </div>
    </div>
  );
}

export default App;

import { useEffect } from "react";
import { fetchGangneungTourPlaces } from "../api/tourApi";
import type { TourPlace } from "../types/tour";

type TourMapProps = {
  onSelectPlace: (place: TourPlace) => void;
};

function TourMap({ onSelectPlace }: TourMapProps) {
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

    const renderTourPlaceMarkers = async () => {
      try {
        const items = await fetchGangneungTourPlaces();

        console.log("관광지 목록:", items);

        items.forEach((item) => {
          if (!item.mapx || !item.mapy) return;

          const lat = Number(item.mapy);
          const lng = Number(item.mapx);

          if (Number.isNaN(lat) || Number.isNaN(lng)) return;

          const marker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(lat, lng),
            map,
            title: item.title,
          });

          marker.addListener("click", () => {
            console.log("선택한 관광지:", item);

            onSelectPlace(item);
            map.setCenter(new Tmapv2.LatLng(lat, lng));
          });
        });
      } catch (error) {
        console.error("관광 API 호출 실패:", error);
      }
    };

    renderTourPlaceMarkers();
  }, [onSelectPlace]);

  return <div id="map_div" className="overflow-hidden rounded-2xl shadow" />;
}

export default TourMap;

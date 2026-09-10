import type { TourPlace } from "../types/tour";

const TOUR_API_BASE_PATH = "/tour-api/B551011/KorService2";

export async function fetchGangneungTourPlaces(): Promise<TourPlace[]> {
  const serviceKey = import.meta.env.VITE_TOUR_API_KEY;

  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "DDUDDU",
    _type: "json",
    mapX: "128.8996",
    mapY: "37.7640",
    radius: "3000",
    contentTypeId: "12",
    numOfRows: "20",
    pageNo: "1",
  });

  const response = await fetch(
    `${TOUR_API_BASE_PATH}/locationBasedList2?serviceKey=${serviceKey}&${params.toString()}`,
  );
  const text = await response.text();

  if (!response.ok) {
    console.error("관광 API HTTP 오류:", text);
    return [];
  }

  const data = JSON.parse(text);
  const items = data?.response?.body?.items?.item ?? [];

  return Array.isArray(items) ? items : [items];
}

export type TravelTheme =
  | "SEA"
  | "NATURE"
  | "CAFE"
  | "FOOD"
  | "TRADITIONAL_MARKET"
  | "CULTURE_HISTORY"
  | "PHOTO"
  | "HEALING";

export type RecommendationOptionsResponse = {
  themes: {
    code: TravelTheme;
    label: string;
  }[];
};

export type PlaceCandidateRequest = {
  regionCode: string;
  themes: TravelTheme[];
};

export type PlaceCandidateResponse = {
  regionCode: string;
  count: number;
  truncated: boolean;
  places: {
    contentId: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
    imageUrl: string;
    imageCopyrightType: string;
    categoryCode: string;
  }[];
};

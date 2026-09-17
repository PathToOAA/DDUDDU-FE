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
  regions: {
    code: string;
    label: string;
  }[];

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

export type TravelType = "DAY_TRIP" | "ONE_NIGHT" | "TWO_NIGHTS";
export type WalkingPreference = "LOW" | "MEDIUM" | "HIGH";
export type IncludedCost = "TRANSPORT" | "FOOD" | "ACCOMMODATION";

export type RecommendationRequest = {
  regionCode: string;
  themes: TravelTheme[];
  travelType: TravelType;
  startTime: string;
  endTime: string;
  budget: number;
  walkingPreference: WalkingPreference;
  includedCosts: IncludedCost[];
};

export type RecommendationPreparationResponse = {
  conditions: RecommendationRequest;
  candidates: PlaceCandidateResponse;
};

export type CourseDraft = {
  title: string;
  reason: string;
  days: {
    day: number;
    contentIds: string[];
  }[];
};

export type RecommendationDraftResponse = {
  conditions: RecommendationRequest;
  courses: CourseDraft[];
  places: PlaceCandidateResponse["places"];
  candidatePoolLimited: boolean;
};

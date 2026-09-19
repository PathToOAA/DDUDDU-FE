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
    hubs: { code: string; name: string }[];
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
  departureHubCode: string;
  returnHubCode: string;
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
  routeAnalysis: CourseRouteAnalysis[];
  departure: PlaceCandidateResponse["places"][number];
  returnPoint: PlaceCandidateResponse["places"][number];
};

export type RecommendationJobStatus =
  | "QUEUED"
  | "SEARCHING_PLACES"
  | "GENERATING_COURSES"
  | "CHECKING_ROUTES"
  | "COMPLETED"
  | "FAILED";

export type RecommendationJobResponse = {
  jobId: string;
  status: RecommendationJobStatus;
  result: RecommendationDraftResponse | null;
  error: string | null;
};

export type RouteSelection = {
  status: "FOUND" | "DIFFICULT" | "ERROR";
  mode: "WALK" | "TRANSIT" | null;
  message: string;
  durationSeconds: number | null;
  distanceMeters: number | null;
  walkDistanceMeters: number | null;
  fare: number | null;
  currency: string | null;
  paths: RoutePath[];
  legs: {
    mode: string;
    routeName: string | null;
    startName: string | null;
    endName: string | null;
    durationSeconds: number;
    distanceMeters: number;
    service: number | null;
    paths: RoutePath[];
  }[];
};

export type CourseRouteAnalysis = {
  courseIndex: number;
  complete: boolean;
  durationSeconds: number | null;
  walkDistanceMeters: number | null;
  transportFareKrw: number | null;
  transfers: {
    day: number;
    fromContentId: string;
    toContentId: string;
    route: RouteSelection;
  }[];
};
export type RoutePath = { mode: string; points: { latitude: number; longitude: number }[] };

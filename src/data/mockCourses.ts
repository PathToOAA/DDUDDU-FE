import type { RecommendationDraftResponse } from "../types/recommendation";
export type CourseStop = {
  name: string;
  time: string;
  category: string;
  move: string;
};

export type CourseSummary = {
  detail?: { result: RecommendationDraftResponse; courseIndex: number };
  id: number;
  title: string;
  badge?: string;
  tags: string;
  walkDistance: string;
  busCount: string;
  duration: string;
  cost: number;
  budget: number;
  images: string[];
  stops: CourseStop[];
};

export const recommendedCourses: CourseSummary[] = [
  {
    id: 1,
    title: "강릉 6만원 뚜벅이 코스",
    badge: "BEST",
    tags: "당일치기",
    walkDistance: "4.1km",
    busCount: "3회",
    duration: "7시간",
    cost: 63500,
    budget: 70000,
    images: [
      "",
      "",
      "",
      "",
    ],
    stops: [
      {
        name: "강릉역",
        time: "09:00",
        category: "출발지",
        move: "버스 20분 / 1,500원",
      },
      {
        name: "초당순두부 마을",
        time: "09:20 - 10:20",
        category: "식사",
        move: "도보 10분 / 800m",
      },
      {
        name: "경포호",
        time: "10:30 - 12:00",
        category: "산책 / 사진",
        move: "버스 15분 / 1,500원",
      },
      {
        name: "안목해변",
        time: "12:15 - 14:00",
        category: "바다 / 산책",
        move: "도보 5분",
      },
      {
        name: "안목 카페거리",
        time: "14:05 - 15:00",
        category: "카페",
        move: "일정 종료",
      },
    ],
  },
  {
    id: 2,
    title: "강릉 여유로운 1박 2일 코스",
    tags: "바다와 문화",
    walkDistance: "7.2km",
    busCount: "6회",
    duration: "1박 2일",
    cost: 98200,
    budget: 100000,
    images: [
      "",
      "",
      "",
      "",
    ],
    stops: [
      {
        name: "강릉역",
        time: "10:00",
        category: "출발지",
        move: "버스 25분",
      },
      {
        name: "오죽헌",
        time: "10:30 - 12:00",
        category: "문화",
        move: "버스 20분",
      },
      {
        name: "경포해변",
        time: "13:00 - 15:00",
        category: "바다",
        move: "숙소 이동",
      },
    ],
  },
  {
    id: 3,
    title: "속초 당일 뚜벅이 코스",
    tags: "가성비",
    walkDistance: "5.1km",
    busCount: "4회",
    duration: "6시간",
    cost: 61000,
    budget: 70000,
    images: [
      "",
      "",
      "",
      "",
    ],
    stops: [
      {
        name: "속초터미널",
        time: "09:30",
        category: "출발지",
        move: "버스 18분",
      },
      {
        name: "속초해변",
        time: "10:00 - 12:00",
        category: "바다",
        move: "도보 12분",
      },
      {
        name: "중앙시장",
        time: "12:30 - 14:00",
        category: "전통시장",
        move: "버스 10분",
      },
    ],
  },
];

export const cities = [
  {
    name: "강릉",
    description: "바다와 커피의 도시",
    image:
      "",
  },
  {
    name: "춘천",
    description: "호수와 낭만의 도시",
    image:
      "",
  },
  {
    name: "속초",
    description: "자연과 맛의 도시",
    image:
      "",
  },
  {
    name: "원주",
    description: "역사와 문화의 도시",
    image:
      "",
  },
];

// src/pages/recommendation/onboarding/OnboardingPage.tsx
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BusFront,
  Heart,
  MapPinned,
  Sparkles,
} from "lucide-react";

type Props = {
  onComplete: () => void;
  onSkip: () => void;
};

const slides = [
  {
    icon: Sparkles,
    eyebrow: "맞춤 여행 추천",
    title: "원하는 여행 조건만\n간단히 선택하세요",
    description:
      "여행 기간, 걷기 선호도, 관심 테마를 선택하면 뚜벅이 여행에 맞는 코스를 찾아드려요.",
    tags: ["당일치기", "카페", "바다", "적당히 걷기"],
  },
  {
    icon: MapPinned,
    eyebrow: "실제 관광 정보",
    title: "관광지와 이동 순서를\n한눈에 확인하세요",
    description:
      "한국관광공사 관광데이터를 활용해 관광지 사진과 상세 정보가 포함된 코스를 보여드려요.",
    tags: ["관광지 사진", "상세 정보", "카카오맵"],
  },
  {
    icon: BusFront,
    eyebrow: "경로까지 한 번에",
    title: "도보와 대중교통까지\n함께 안내해드려요",
    description:
      "관광지 사이의 도보 거리와 버스 번호, 예상 이동 시간을 확인하고 코스를 저장할 수 있어요.",
    tags: ["도보 경로", "버스 정보", "코스 저장"],
  },
];

export default function OnboardingPage({ onComplete, onSkip }: Props) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const Icon = slide.icon;
  const isLast = current === slides.length - 1;

  return (
    <main className="min-h-svh bg-[#f5f6f4] text-[#171c19]">
      <section className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col overflow-hidden bg-white">
        <header className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 font-extrabold">
            <MapPinned size={21} className="text-[#16883b]" />
            뚜벅뚜벅
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg px-2 py-2 text-sm text-[#68736c]"
          >
            건너뛰기
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-center px-6 pb-8">
          <div className="relative mx-auto flex h-64 w-full items-center justify-center overflow-hidden rounded-[32px] bg-[#eef8f0]">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#d9f1df]" />
            <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/70" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-[32px] bg-[#16883b] text-white shadow-lg shadow-green-900/15">
              <Icon size={54} strokeWidth={1.7} />
            </div>

            {current === 2 && (
              <div className="absolute bottom-7 right-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#16883b] shadow">
                <Heart size={23} />
              </div>
            )}
          </div>

          <div className="mt-10">
            <p className="text-sm font-bold text-[#16883b]">{slide.eyebrow}</p>

            <h1 className="mt-3 whitespace-pre-line text-[28px] font-extrabold leading-[1.35] tracking-[-0.04em]">
              {slide.title}
            </h1>

            <p className="mt-4 break-keep text-[15px] leading-7 text-[#68736c]">
              {slide.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {slide.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#cfe8d6] bg-[#f4faf5] px-3 py-1.5 text-xs font-semibold text-[#16883b]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <footer className="px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
          <div className="mb-6 flex justify-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`${index + 1}번째 안내 보기`}
                className={`h-2 rounded-full transition-all ${
                  index === current ? "w-7 bg-[#16883b]" : "w-2 bg-[#dce3de]"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {current > 0 && (
              <button
                type="button"
                onClick={() => setCurrent((value) => value - 1)}
                aria-label="이전 안내"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#dfe5e0] bg-white text-[#465049]"
              >
                <ArrowLeft size={21} />
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                isLast ? onComplete() : setCurrent((value) => value + 1)
              }
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#16883b] font-bold text-white"
            >
              {isLast ? "내 여행 코스 만들기" : "다음"}
              {!isLast && <ArrowRight size={20} />}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

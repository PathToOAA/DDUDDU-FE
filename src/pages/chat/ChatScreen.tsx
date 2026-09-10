import { recommendedCourses } from "../../data/mockCourses";
import Bubble from "../../components/chat/Bubble";

export default function ChatScreen({
  onClose,
  onOpenCourse,
}: {
  onClose: () => void;
  onOpenCourse: () => void;
}) {
  return (
    <section className="flex min-h-screen flex-col px-5 pt-6">
      <header className="flex items-center justify-between border-b border-[#e7ebe8] pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16883b] text-white">
            ··
          </span>
          <div>
            <h1 className="text-base font-extrabold">뚜벅이 여행 챗봇</h1>
            <p className="text-xs text-[#68736c]">무엇을 도와드릴까요?</p>
          </div>
        </div>
        <button onClick={onClose} className="h-9 w-9 rounded-full text-2xl">
          ×
        </button>
      </header>

      <div className="flex-1 space-y-4 py-5">
        <Bubble>
          안녕하세요! 뚜벅뚜벅 여행 도우미입니다. 여행 계획, 코스 추천, 교통
          정보 등을 안내해 드릴게요.
        </Bubble>
        <Bubble mine>강릉 당일치기 코스 추천해줘. 예산은 6만원 정도야!</Bubble>
        <Bubble>
          네! 강릉 당일치기 코스를 추천해 드릴게요. 예산 60,000원 기준 뚜벅이
          코스입니다.
        </Bubble>
        <article className="rounded-lg border border-[#e7ebe8] bg-white p-4 shadow-sm">
          <h2 className="font-extrabold">강릉 6만원 뚜벅이 코스</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {recommendedCourses[0].images.slice(0, 3).map((image) => (
              <img
                key={image}
                src={image}
                alt=""
                className="h-20 rounded-lg object-cover"
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-[#68736c]">
            도보 4.1km · 버스 3회 · 7시간
          </p>
          <button
            type="button"
            onClick={onOpenCourse}
            className="mt-4 w-full rounded-lg bg-[#16883b] py-3 text-sm font-bold text-white"
          >
            코스 자세히 보기
          </button>
        </article>
      </div>

      <div className="sticky bottom-20 bg-white pb-4">
        <div className="mb-3 flex gap-2 text-xs">
          {["교통편 알려줘", "맛집 추천해줘", "숙소 추천해줘"].map((item) => (
            <button
              key={item}
              className="rounded-full border border-[#e4e8e5] px-3 py-2"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#e4e8e5] px-4 py-2">
          <input
            className="min-w-0 flex-1 text-sm outline-none"
            placeholder="메시지를 입력하세요..."
          />
          <button className="h-9 w-9 rounded-full bg-[#16883b] text-white">
            ↗
          </button>
        </div>
      </div>
    </section>
  );
}

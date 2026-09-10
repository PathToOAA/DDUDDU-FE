export default function MyScreen() {
  return (
    <section className="min-h-screen bg-[#f7f8f6]">
      <div className="bg-[#35a554] px-5 pb-10 pt-7 text-white">
        <div className="mb-8 flex justify-end">
          <button className="h-9 w-9 rounded-full text-xl">⚙</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl">
            ☺
          </span>
          <p className="font-bold">
            뚜벅님, 안녕하세요!
            <br />
            즐거운 뚜벅이 여행 되세요
          </p>
        </div>
      </div>

      <div className="-mt-5 px-5">
        <div className="grid grid-cols-3 rounded-lg bg-white py-5 text-center shadow-sm">
          {["저장한 코스\n12", "다녀온 코스\n5", "찜한 장소\n28"].map(
            (item) => (
              <div
                key={item}
                className="whitespace-pre-line border-r border-[#e7ebe8] last:border-r-0"
              >
                <span className="text-xs text-[#68736c]">
                  {item.split("\n")[0]}
                </span>
                <strong className="mt-2 block text-xl">
                  {item.split("\n")[1]}
                </strong>
              </div>
            ),
          )}
        </div>

        <div className="mt-6 rounded-lg bg-white">
          {[
            "내 코스 관리",
            "예약/결제 내역",
            "리뷰 관리",
            "관심 지역 설정",
            "알림 설정",
            "고객센터",
            "로그아웃",
          ].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between border-b border-[#edf0ed] px-4 py-4 text-sm last:border-b-0"
            >
              <span>{item}</span>
              <span className="text-[#8a958d]">›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

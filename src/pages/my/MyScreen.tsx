import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Profile = { nickname: string | null; avatar_url: string | null };

export default function MyScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let mounted = true;
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user || !mounted) return;
      const { data: row } = await client
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();
      if (mounted) {
        setProfile(row ?? {
          nickname: data.user.user_metadata?.name ?? data.user.user_metadata?.nickname ?? null,
          avatar_url: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.picture ?? null,
        });
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    setIsLoggingOut(true);
    await supabase.auth.signOut();
  };

  const nickname = profile?.nickname ?? "뚜벅님";
  return (
    <section className="min-h-screen bg-[#f7f8f6]">
      <div className="bg-[#35a554] px-5 pb-10 pt-7 text-white">
        <div className="mb-8 flex justify-end">
          <button className="h-9 w-9 rounded-full text-xl">⚙</button>
        </div>
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="프로필" className="h-20 w-20 rounded-full bg-white object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl">☺</span>
          )}
          <p className="font-bold">
            {nickname}님, 안녕하세요!
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
            onClick={item === "로그아웃" ? handleLogout : undefined}
            disabled={item === "로그아웃" && isLoggingOut}
            >
              <span>{item}</span>
              <span className="text-[#8a958d]">{item === "로그아웃" && isLoggingOut ? "처리 중..." : "›"}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

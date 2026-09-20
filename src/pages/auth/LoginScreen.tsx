import { Footprints, MessageCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = { onSkip: () => void };

export default function LoginScreen({ onSkip }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithKakao = async () => {
    if (!supabase) { setError("Supabase 환경변수를 먼저 설정해주세요."); return; }
    setError(null); setIsLoading(true);
    const { error: loginError } = await supabase.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: window.location.origin } });
    if (loginError) { setError(loginError.message); setIsLoading(false); }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f4] px-6">
      <section className="w-full max-w-[430px] rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#16883b] text-4xl text-white"><Footprints size={40} aria-hidden="true" /></div>
        <h1 className="text-3xl font-extrabold tracking-tight">뚜벅뚜벅</h1>
        <p className="mt-3 text-sm leading-6 text-[#68736c]">나에게 맞는 강원도 여행 코스를<br />AI가 찾아드려요</p>
        <button type="button" onClick={loginWithKakao} disabled={isLoading} className="mt-10 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#fee500] font-semibold text-[#191919] disabled:opacity-60"><MessageCircle size={22} fill="currentColor" aria-hidden="true" />{isLoading ? "카카오 로그인 중..." : "카카오로 시작하기"}</button>
        <button type="button" onClick={onSkip} className="mt-5 text-sm text-[#68736c] underline underline-offset-4">로그인 없이 둘러보기</button>
        {error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-left text-xs text-red-600">{error}</p>}
      </section>
    </main>
  );
}

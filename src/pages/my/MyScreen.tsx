import { ChevronRight, Heart, LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Profile = { nickname: string | null; avatar_url: string | null };

export default function MyScreen({ onOpenSaved, onLogin }: {
  onOpenSaved: () => void;
  onLogin: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        if (!supabase) return;
        const { data, error: authError } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!data.user) {
          if (authError && authError.name !== "AuthSessionMissingError") {
            setError("로그인 정보를 확인하지 못했어요. 다시 시도해주세요.");
          }
          return;
        }
        setIsSignedIn(true);
        const metadata = data.user.user_metadata;
        const fallback = {
          nickname: metadata?.name ?? metadata?.nickname ?? null,
          avatar_url: metadata?.avatar_url ?? metadata?.picture ?? null,
        };
        setProfile(fallback);
        const { data: row, error: profileError } = await supabase
          .from("profiles")
          .select("nickname, avatar_url")
          .eq("id", data.user.id)
          .maybeSingle();
        if (!mounted) return;
        if (profileError) {
          setError("프로필을 불러오지 못해 로그인 정보를 표시하고 있어요.");
        } else {
          setProfile({
            nickname: row?.nickname ?? fallback.nickname,
            avatar_url: row?.avatar_url ?? fallback.avatar_url,
          });
        }
      } catch {
        if (mounted) setError("프로필을 불러오지 못했어요. 다시 시도해주세요.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    void loadProfile();
    return () => { mounted = false; };
  }, []);

  async function handleLogout() {
    if (!supabase) return;
    setIsLoggingOut(true);
    setError(null);
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
    } catch {
      setError("로그아웃하지 못했어요. 다시 시도해주세요.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <section className="min-h-screen bg-[#f7f8f6]">
      <div className="bg-[#35a554] px-5 pb-10 pt-7 text-white">
        <h1 className="mb-7 text-xl font-extrabold">마이</h1>
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="내 프로필" className="h-20 w-20 rounded-full bg-white object-cover" />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-[#16883b]">
              <UserRound size={36} aria-hidden="true" />
            </span>
          )}
          <div aria-live="polite">
            <p className="font-bold">
              {isLoading ? "프로필을 불러오는 중이에요" : isSignedIn ? (profile?.nickname || "여행자") + "님, 안녕하세요!" : "로그인하고 여행을 저장해보세요"}
            </p>
            <p className="mt-2 text-sm text-white/85">나만의 여행 코스를 모아보세요.</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-6">
        {!isLoading && (
          <div className="overflow-hidden rounded-xl border border-[#e7ebe8] bg-white">
            {isSignedIn && (
              <button type="button" onClick={onOpenSaved} className="flex w-full items-center gap-3 border-b border-[#edf0ed] p-4 text-sm font-semibold">
                <Heart size={20} className="text-[#16883b]" aria-hidden="true" />
                저장한 코스
                <ChevronRight size={18} className="ml-auto text-[#8a958d]" aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={isSignedIn ? handleLogout : onLogin} disabled={isLoggingOut}
              className="flex w-full items-center gap-3 p-4 text-sm font-semibold disabled:opacity-60">
              {isSignedIn ? <LogOut size={20} aria-hidden="true" /> : <LogIn size={20} aria-hidden="true" />}
              {isLoggingOut ? "로그아웃 중..." : isSignedIn ? "로그아웃" : "카카오로 로그인"}
            </button>
          </div>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
}
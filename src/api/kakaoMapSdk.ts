let sdk: Promise<void> | undefined;

export function loadKakaoMap(): Promise<void> {
  if (typeof kakao !== "undefined" && kakao.maps?.Map) return Promise.resolve();
  if (sdk) return sdk;
  sdk = new Promise<void>((resolve, reject) => {
    const key = (import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined)?.trim();
    if (!key) { reject(new Error("카카오 지도 키가 설정되지 않았어요.")); return; }
    const script = document.createElement("script");
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      script.onload = null; script.onerror = null;
      if (error) { script.remove(); reject(error); } else resolve();
    };
    const timer = window.setTimeout(() => finish(new Error("카카오 지도 로딩 시간이 초과됐어요. 새로고침해주세요.")), 20000);
    script.src = "https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=" + encodeURIComponent(key);
    script.async = true;
    script.onload = () => {
      if (typeof kakao === "undefined" || !kakao.maps?.load) {
        finish(new Error("카카오맵 사용 설정과 JavaScript SDK 도메인을 확인해주세요."));
        return;
      }
      kakao.maps.load(() => finish());
    };
    script.onerror = () => finish(new Error("카카오 지도를 불러오지 못했어요. 사용 설정과 등록 도메인을 확인해주세요."));
    document.head.appendChild(script);
  }).catch(error => { sdk = undefined; throw error; });
  return sdk;
}

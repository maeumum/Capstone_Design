import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowLeftRight,
  Bus,
  CalendarDays,
  ChevronRight,
  HelpCircle,
  LogOut,
  MapPin,
  Ticket,
  Undo2,
} from "lucide-react";

/**
 * UI·UX 참고: 비그플 키오스크 체험 (고속버스 예매)
 * http://www.xn--2i0b122a69q.kr/usquare/index.do
 */

const KIOSK_TERMINAL = "광주 (유·스퀘어) No.30";

const TERMINALS = [
  "동서울",
  "서울남부",
  "서울서부",
  "고양",
  "인천",
  "부산",
  "대전복합",
  "광주(유·스퀘어)",
  "전주",
  "강릉",
  "울산",
  "창원",
];

const WEEKDAY_KO = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function formatDateKorean(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = WEEKDAY_KO[dt.getDay()];
  return `${isoDate} ${wd}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type Screen = "menu" | "search" | "results";

type BusTrip = {
  id: string;
  company: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsLeft: number;
  grade: "일반" | "우등" | "프리미엄";
};

const BASE_TRIPS: Omit<BusTrip, "price" | "seatsLeft">[] = [
  { id: "b1", company: "금호고속", departureTime: "07:10", arrivalTime: "10:25", duration: "3시간 15분", grade: "우등" },
  { id: "b2", company: "삼화고속", departureTime: "08:30", arrivalTime: "11:40", duration: "3시간 10분", grade: "일반" },
  { id: "b3", company: "경기고속", departureTime: "10:00", arrivalTime: "13:05", duration: "3시간 5분", grade: "우등" },
  { id: "b4", company: "한양고속", departureTime: "12:20", arrivalTime: "15:35", duration: "3시간 15분", grade: "프리미엄" },
  { id: "b5", company: "삼화고속", departureTime: "14:50", arrivalTime: "17:55", duration: "3시간 5분", grade: "일반" },
  { id: "b6", company: "동양고속", departureTime: "17:00", arrivalTime: "20:15", duration: "3시간 15분", grade: "우등" },
  { id: "b7", company: "금호고속", departureTime: "19:20", arrivalTime: "22:30", duration: "3시간 10분", grade: "우등" },
  { id: "b8", company: "경기고속", departureTime: "21:00", arrivalTime: "00:05", duration: "3시간 5분", grade: "일반" },
];

function hashRoute(dep: string, arr: string, date: string): number {
  const s = `${dep}|${arr}|${date}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildSchedule(dep: string, arr: string, date: string): BusTrip[] {
  const h = hashRoute(dep, arr, date);
  const basePrice = 18000 + (h % 7) * 2500;

  return BASE_TRIPS.map((t, i) => {
    const offset = ((h >> (i % 4)) + i * 3) % 9;
    return {
      ...t,
      price: basePrice + offset * 500 + (t.grade === "프리미엄" ? 8000 : t.grade === "우등" ? 3000 : 0),
      seatsLeft: 12 + ((h + i * 5) % 33),
    };
  });
}

export default function BusPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [screen, setScreen] = useState<Screen>("menu");
  const [nowText, setNowText] = useState("");
  const [departure, setDeparture] = useState("광주(유·스퀘어)");
  const [arrival, setArrival] = useState("서울남부");
  const [travelDate, setTravelDate] = useState(today);
  const [lang, setLang] = useState<"ko" | "en" | "zh" | "ja">("ko");

  const results = useMemo(
    () => buildSchedule(departure, arrival, travelDate),
    [departure, arrival, travelDate],
  );

  useEffect(() => {
    function tick() {
      const n = new Date();
      setNowText(`${pad2(n.getHours())}:${pad2(n.getMinutes())}:${pad2(n.getSeconds())}`);
    }
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  function swapTerminals() {
    setDeparture(arrival);
    setArrival(departure);
  }

  function handleSearch() {
    if (departure === arrival) {
      alert("출발지와 도착지가 같을 수 없습니다.");
      return;
    }
    if (!travelDate) {
      alert("가는 날을 선택해 주세요.");
      return;
    }
    setScreen("results");
  }

  function handleBack() {
    if (screen === "results") {
      setScreen("search");
      return;
    }
    if (screen === "search") {
      setScreen("menu");
      return;
    }
    navigate("/");
  }

  function handleExitKiosk() {
    navigate("/");
  }

  const langLabel =
    lang === "ko"
      ? "한국어"
      : lang === "en"
        ? "English"
        : lang === "zh"
          ? "中文"
          : "日本語";

  return (
    <div className="min-h-screen bg-[#e9ecef] flex flex-col">
      {/* 키오스크 상단: 터미널 · 날짜 · 시각 (참고 사이트 레이아웃) */}
      <header className="bg-[#1c2834] text-white shrink-0 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-black tracking-tight text-amber-300/95 truncate" style={{ fontSize: "clamp(18px,4vw,26px)" }}>
                {KIOSK_TERMINAL}
              </p>
              <p className="mt-1 text-white/90 font-semibold" style={{ fontSize: "clamp(15px,3.2vw,20px)" }}>
                {formatDateKorean(today)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white/75 text-sm sm:text-base font-medium">현재시간</p>
              <p className="font-mono font-bold tabular-nums text-amber-300" style={{ fontSize: "clamp(22px,5vw,34px)" }}>
                {nowText || "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
            <span className="inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-sm sm:text-base font-bold text-amber-200">
              현금·카드 겸용 / 환불
            </span>
            <button
              type="button"
              onClick={handleExitKiosk}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-bold hover:bg-white/20 active:scale-[0.98]"
              style={{ fontSize: "16px" }}
            >
              <LogOut size={20} />
              나가기
            </button>
          </div>
        </div>
      </header>

      {/* 언어 선택 바 */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-3xl mx-auto px-2 py-2 flex flex-wrap justify-center gap-2">
          {(
            [
              { id: "ko" as const, label: "한국어" },
              { id: "en" as const, label: "English" },
              { id: "zh" as const, label: "中文" },
              { id: "ja" as const, label: "日本語" },
            ]
          ).map((L) => (
            <button
              key={L.id}
              type="button"
              onClick={() => setLang(L.id)}
              className={`rounded-lg px-4 py-2 font-bold border-2 transition-all ${
                lang === L.id
                  ? "border-[#c45c26] bg-orange-50 text-[#8b4513]"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400"
              }`}
              style={{ fontSize: "15px" }}
            >
              {L.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 py-4 pb-8">
        {screen === "menu" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-3 flex items-start gap-3">
              <HelpCircle className="text-amber-800 shrink-0 mt-0.5" size={24} />
              <div>
                <p className="font-bold text-amber-950" style={{ fontSize: "17px" }}>
                  고속버스 예매 키오스크
                </p>
                <p className="text-amber-900/90 mt-1" style={{ fontSize: "15px", lineHeight: 1.45 }}>
                  원하시는 메뉴를 눌러 주세요. (연습용 · 실제 결제 없음)
                </p>
              </div>
            </div>

            <nav className="space-y-3" aria-label="메인 메뉴">
              <button
                type="button"
                onClick={() => setScreen("search")}
                className="w-full flex items-center gap-4 rounded-2xl bg-gradient-to-b from-[#2d5a3d] to-[#1e3f2c] text-white p-5 sm:p-6 shadow-xl border-2 border-[#1a3324] hover:brightness-110 active:scale-[0.99] transition-all text-left"
              >
                <div className="rounded-xl bg-white/15 p-3">
                  <Ticket size={40} strokeWidth={2.2} />
                </div>
                <span className="font-black flex-1" style={{ fontSize: "clamp(22px,4.5vw,30px)" }}>
                  승차권 구매
                </span>
                <ChevronRight size={36} className="opacity-90 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => alert("연습 화면: 예매한 승차권 조회·발권은 구현되지 않았습니다.")}
                className="w-full flex items-center gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-md border-2 border-gray-300 hover:bg-gray-50 active:scale-[0.99] transition-all text-left"
              >
                <div className="rounded-xl bg-gray-100 p-3 text-gray-800">
                  <Bus size={40} strokeWidth={2.2} />
                </div>
                <span className="font-black text-gray-900 flex-1" style={{ fontSize: "clamp(20px,4vw,28px)" }}>
                  예매한 승차권
                </span>
                <ChevronRight size={36} className="text-gray-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => alert("연습 화면: 승차권 환불은 구현되지 않았습니다.")}
                className="w-full flex items-center gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-md border-2 border-gray-300 hover:bg-gray-50 active:scale-[0.99] transition-all text-left"
              >
                <div className="rounded-xl bg-gray-100 p-3 text-gray-800">
                  <Undo2 size={40} strokeWidth={2.2} />
                </div>
                <span className="font-black text-gray-900 flex-1" style={{ fontSize: "clamp(20px,4vw,28px)" }}>
                  승차권 환불
                </span>
                <ChevronRight size={36} className="text-gray-400 shrink-0" />
              </button>
            </nav>

            <p className="text-center text-red-700 font-bold bg-red-50 border border-red-200 rounded-xl py-3 px-4" style={{ fontSize: "15px" }}>
              ※ 동전 사용 불가
            </p>

            <p className="text-center text-gray-500 text-sm">
              참고 UI:{" "}
              <a
                href="http://www.xn--2i0b122a69q.kr/usquare/index.do"
                className="text-[#1565c0] underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                비그플 키오스크 체험
              </a>
            </p>
          </div>
        )}

        {screen === "search" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-gray-300 px-4 py-3 font-bold text-gray-800 shadow-sm hover:bg-gray-50"
              style={{ fontSize: "17px" }}
            >
              <ArrowLeft size={22} />
              이전
            </button>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
              <div className="bg-[#2d5a3d] px-4 py-3">
                <p className="text-white font-black text-center" style={{ fontSize: "19px" }}>
                  노선 조회 ({langLabel})
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-3">
                      <label className="flex items-center gap-2 text-gray-800 font-bold mb-2" style={{ fontSize: "14px" }}>
                        <MapPin size={18} className="text-[#2d5a3d]" />
                        출발지
                      </label>
                      <select
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-3 font-bold text-gray-900 min-h-[52px]"
                        style={{ fontSize: "18px" }}
                      >
                        {TERMINALS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-3">
                      <label className="flex items-center gap-2 text-gray-800 font-bold mb-2" style={{ fontSize: "14px" }}>
                        <MapPin size={18} className="text-[#2d5a3d]" />
                        도착지
                      </label>
                      <select
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-3 font-bold text-gray-900 min-h-[52px]"
                        style={{ fontSize: "18px" }}
                      >
                        {TERMINALS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={swapTerminals}
                    className="self-center shrink-0 mt-14 sm:mt-16 w-14 h-14 rounded-full border-2 border-[#2d5a3d] bg-white text-[#2d5a3d] shadow-md hover:bg-emerald-50 active:scale-95"
                    aria-label="출발지·도착지 바꾸기"
                  >
                    <ArrowLeftRight className="mx-auto" size={24} />
                  </button>
                </div>

                <div className="mt-4 rounded-xl border-2 border-gray-200 bg-white p-3">
                  <label className="flex items-center gap-2 text-gray-800 font-bold mb-2" style={{ fontSize: "14px" }}>
                    <CalendarDays size={18} className="text-[#2d5a3d]" />
                    가는 날
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-3 font-bold text-gray-900 min-h-[52px]"
                    style={{ fontSize: "18px" }}
                  />
                  <p className="mt-2 text-gray-600 font-medium text-sm">{formatDateKorean(travelDate)}</p>
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="mt-5 w-full rounded-xl bg-[#c45c26] text-white font-black py-4 sm:py-5 shadow-lg border-2 border-[#a34a1f] hover:brightness-110 active:scale-[0.99]"
                  style={{ fontSize: "22px" }}
                >
                  버스 조회
                </button>
              </div>
            </div>

            <p className="text-center text-red-700 font-bold text-sm">※ 동전 사용 불가</p>
          </div>
        )}

        {screen === "results" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-gray-300 px-4 py-3 font-bold text-gray-800 shadow-sm hover:bg-gray-50"
              style={{ fontSize: "17px" }}
            >
              <ArrowLeft size={22} />
              이전
            </button>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow">
              <p className="font-black text-gray-900" style={{ fontSize: "20px" }}>
                {departure} → {arrival}
              </p>
              <p className="text-gray-600 mt-1 font-semibold" style={{ fontSize: "16px" }}>
                {formatDateKorean(travelDate)} · 총 {results.length}회
              </p>
            </div>

            <ul className="space-y-3">
              {results.map((trip) => (
                <li key={trip.id}>
                  <button
                    type="button"
                    className="w-full text-left bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4 hover:border-[#2d5a3d]/60 hover:shadow-md active:scale-[0.99] transition-all"
                    onClick={() =>
                      alert(
                        `${trip.company} ${trip.departureTime} 출발편을 선택했습니다.\n(연습: 좌석·결제 단계는 없습니다.)`,
                      )
                    }
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-black ${
                          trip.grade === "프리미엄"
                            ? "bg-violet-100 text-violet-800"
                            : trip.grade === "우등"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {trip.grade}
                      </span>
                      <span className="text-[#c45c26] font-black" style={{ fontSize: "18px" }}>
                        {trip.price.toLocaleString()}원
                      </span>
                    </div>
                    <p className="text-gray-800 font-bold mb-2" style={{ fontSize: "16px" }}>
                      {trip.company}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-gray-900" style={{ fontSize: "26px" }}>
                          {trip.departureTime}
                        </span>
                        <span className="text-gray-400">—</span>
                        <span className="font-black text-gray-900" style={{ fontSize: "26px" }}>
                          {trip.arrivalTime}
                        </span>
                      </div>
                      <ChevronRight className="text-gray-400 shrink-0" size={22} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600 font-medium">
                      <span>소요 {trip.duration}</span>
                      <span className="text-[#2d5a3d] font-bold">잔여 {trip.seatsLeft}석</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

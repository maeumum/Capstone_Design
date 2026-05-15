import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowLeftRight, ChevronLeft, ChevronRight, RefreshCw, Star, Check, Plus, Minus } from "lucide-react";

type Screen = "search" | "results" | "passengers" | "payment" | "complete";

type Grade = "일반" | "우등" | "프리미엄";

interface BusTrip {
  id: string;
  company: string;
  departureTime: string;
  duration: string;
  price: number;
  seatsLeft: number;
  grade: Grade;
}

const TERMINALS = [
  "전주고속터미널",
  "센트럴시티(서울)",
  "동서울터미널",
  "서울남부터미널",
  "인천종합터미널",
  "부산종합터미널",
  "대전복합터미널",
  "광주유스퀘어",
  "대구북부터미널",
  "강릉고속터미널",
  "울산고속터미널",
  "창원종합터미널",
];

const COMPANIES = ["동양고속", "금호고속", "천일고속", "삼화고속", "경기고속", "한양고속"];

const BASE_TIMES = [
  "05:00", "05:15", "05:30", "05:45",
  "06:00", "06:30", "07:00", "07:30",
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:30", "15:00", "17:00",
  "18:30", "20:00", "21:30", "22:50",
];

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

function formatDisplay(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = DAYS_KO[new Date(y, m - 1, d).getDay()];
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}(${day})`;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildTrips(dep: string, arr: string, date: string): BusTrip[] {
  const h = hash(`${dep}|${arr}|${date}`);
  const grades: Grade[] = ["일반", "우등", "프리미엄"];
  const basePrices: Record<Grade, number> = { 일반: 17000, 우등: 22000, 프리미엄: 28600 };
  return BASE_TIMES.map((time, i) => {
    const grade = grades[((h >> i) + i) % 3];
    const company = COMPANIES[((h >> (i + 2)) + i * 3) % COMPANIES.length];
    const seats = 4 + ((h + i * 7) % 38);
    const priceVariant = ((h >> (i + 1)) % 3) * 500;
    return {
      id: `trip-${i}`,
      company,
      departureTime: time,
      duration: "약 2시간 35분",
      price: basePrices[grade] + priceVariant,
      seatsLeft: seats,
      grade,
    };
  });
}

// 등급 badge 스타일
function GradeBadge({ grade }: { grade: Grade }) {
  if (grade === "프리미엄")
    return (
      <span className="inline-block rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "#FFE4EC", color: "#D63384" }}>
        프리미엄
      </span>
    );
  if (grade === "우등")
    return (
      <span className="inline-block rounded-full border px-2 py-0.5 text-xs font-bold" style={{ borderColor: "#F48FB1", color: "#C2185B" }}>
        우등
      </span>
    );
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
      일반
    </span>
  );
}

export default function BusPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [screen, setScreen] = useState<Screen>("search");
  const [departure, setDeparture] = useState("전주고속터미널");
  const [arrival, setArrival] = useState("센트럴시티(서울)");
  const [travelDate, setTravelDate] = useState(today);
  const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [bookingNum] = useState(() => Math.floor(Math.random() * 900000 + 100000));

  const trips = useMemo(() => buildTrips(departure, arrival, travelDate), [departure, arrival, travelDate]);

  const totalPassengers = adults + kids + seniors;
  const totalPrice = selectedTrip
    ? selectedTrip.price * adults + Math.floor(selectedTrip.price * 0.5) * kids + Math.floor(selectedTrip.price * 0.5) * seniors
    : 0;

  const shiftDate = (delta: number) => {
    const d = new Date(travelDate);
    d.setDate(d.getDate() + delta);
    if (d >= new Date(today)) setTravelDate(d.toISOString().split("T")[0]);
  };

  // ── SEARCH ────────────────────────────────────────────────
  if (screen === "search") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => navigate("/")} className="text-gray-700 mr-3">
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>
            버스 예매
          </h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 p-5 space-y-4">
          {/* 출발·도착 */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-semibold mb-1">출발지</p>
                <select
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900"
                  style={{ fontSize: "17px" }}
                >
                  {TERMINALS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <button
                onClick={() => { setDeparture(arrival); setArrival(departure); }}
                className="mt-5 w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center active:scale-95 transition-all"
              >
                <ArrowLeftRight size={18} className="text-gray-500" />
              </button>

              <div className="flex-1">
                <p className="text-xs text-gray-400 font-semibold mb-1">도착지</p>
                <select
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900"
                  style={{ fontSize: "17px" }}
                >
                  {TERMINALS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 날짜 */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-semibold mb-2">가는 날</p>
            <input
              type="date"
              min={today}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900"
              style={{ fontSize: "17px" }}
            />
            <p className="text-sm text-gray-500 mt-2 font-medium">{formatDisplay(travelDate)}</p>
          </div>

          {/* 조회 버튼 */}
          <button
            onClick={() => {
              if (departure === arrival) { alert("출발지와 도착지가 같을 수 없습니다."); return; }
              setScreen("results");
            }}
            className="w-full text-white rounded-2xl py-5 font-bold shadow-lg active:scale-95 transition-all"
            style={{ background: "#1A6FE8", fontSize: "20px" }}
          >
            조회하기
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS (배차 조회) ───────────────────────────────────
  if (screen === "results") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("search")} className="text-gray-700 mr-3">
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>
            배차 조회
          </h1>
          <div style={{ width: 24 }} />
        </div>

        {/* 노선 표시 */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Star size={18} className="text-gray-400 fill-gray-300" />
          <span className="font-bold text-gray-800" style={{ fontSize: "15px" }}>{departure}</span>
          <ArrowLeft size={14} className="text-gray-400 rotate-180" />
          <span className="font-bold text-gray-800" style={{ fontSize: "15px" }}>{arrival}</span>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <button onClick={() => shiftDate(-1)} className="p-1 text-gray-500 active:scale-95">
            <ChevronLeft size={22} />
          </button>
          <span className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "16px" }}>
            {formatDisplay(travelDate)}
          </span>
          <button onClick={() => shiftDate(1)} className="p-1 text-gray-500 active:scale-95">
            <ChevronRight size={22} />
          </button>
          <button className="ml-2 flex items-center gap-1 text-gray-500" style={{ fontSize: "13px" }}>
            검색 조건
            <ChevronRight size={14} className="rotate-90" />
          </button>
        </div>

        {/* 버스 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-3">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => { setSelectedTrip(trip); setScreen("passengers"); }}
              className="w-full text-left bg-white rounded-2xl border border-gray-150 shadow-sm p-4 active:scale-[0.99] transition-all"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}
            >
              {/* 상단: 회사 + 상세보기 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="text-white rounded px-1.5 py-0.5 font-black"
                    style={{ fontSize: "11px", background: "#1A6FE8" }}
                  >
                    고
                  </div>
                  <span className="font-semibold text-gray-700" style={{ fontSize: "14px" }}>
                    {trip.company}
                  </span>
                </div>
                <span
                  className="border border-gray-300 text-gray-500 rounded-full px-3 py-1 font-medium"
                  style={{ fontSize: "12px" }}
                >
                  상세보기
                </span>
              </div>

              {/* 중단: 시간 + 가격 */}
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-gray-900" style={{ fontSize: "28px" }}>
                    {trip.departureTime}
                  </span>
                  <span className="text-gray-400" style={{ fontSize: "13px" }}>
                    {trip.duration}
                  </span>
                </div>
                <span className="font-black text-gray-900" style={{ fontSize: "24px" }}>
                  {trip.price.toLocaleString()}원
                </span>
              </div>

              {/* 하단: 등급 + 잔여석 */}
              <div className="flex items-center gap-2 mt-2">
                <GradeBadge grade={trip.grade} />
                <span className="font-bold" style={{ fontSize: "13px", color: "#FF6B35" }}>
                  {trip.seatsLeft}석 남음
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <p className="text-gray-400 flex-1" style={{ fontSize: "12px", lineHeight: "1.5" }}>
            소요 시간은 교통상황에 따라 달라질 수 있습니다.<br />
            요금정보는 상세보기를 선택하셔서 확인하실 수 있습니다.
          </p>
          <button
            onClick={() => setTravelDate(travelDate)}
            className="ml-3 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center active:scale-95 transition-all"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  // ── PASSENGERS ────────────────────────────────────────────
  if (screen === "passengers" && selectedTrip) {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("results")} className="text-gray-700 mr-3">
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>
            인원 선택
          </h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 p-5 space-y-4">
          {/* 선택 편 정보 */}
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-white rounded px-1.5 py-0.5 font-black" style={{ fontSize: "11px", background: "#1A6FE8" }}>고</div>
              <span className="font-semibold text-gray-700" style={{ fontSize: "14px" }}>{selectedTrip.company}</span>
              <GradeBadge grade={selectedTrip.grade} />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-black text-gray-900" style={{ fontSize: "28px" }}>{selectedTrip.departureTime}</span>
                <span className="text-gray-400" style={{ fontSize: "13px" }}>{selectedTrip.duration}</span>
              </div>
              <span className="font-black text-gray-900" style={{ fontSize: "20px" }}>
                {selectedTrip.price.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 인원 선택 */}
          {[
            { label: "어른", sub: "만 13세 이상", count: adults, set: setAdults },
            { label: "청소년", sub: "만 6세~12세 (50% 할인)", count: kids, set: setKids },
            { label: "경로", sub: "만 65세 이상 (50% 할인)", count: seniors, set: setSeniors },
          ].map(({ label, sub, count, set }) => (
            <div key={label} className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900" style={{ fontSize: "17px" }}>{label}</p>
                <p className="text-gray-400" style={{ fontSize: "13px" }}>{sub}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => set(Math.max(label === "어른" ? 1 : 0, count - 1))}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center active:scale-95 transition-all"
                  style={{ borderColor: "#1A6FE8" }}
                >
                  <Minus size={18} style={{ color: "#1A6FE8" }} strokeWidth={3} />
                </button>
                <span className="font-bold w-6 text-center text-gray-900" style={{ fontSize: "20px" }}>{count}</span>
                <button
                  onClick={() => set(count + 1)}
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: "#1A6FE8" }}
                >
                  <Plus size={18} className="text-white" strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}

          <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-gray-700" style={{ fontSize: "16px" }}>총 인원</span>
            <span className="font-bold text-gray-900" style={{ fontSize: "18px" }}>{totalPassengers}명</span>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-semibold" style={{ fontSize: "15px" }}>예상 결제 금액</span>
            <span className="font-black" style={{ fontSize: "22px", color: "#1A6FE8" }}>
              {totalPrice.toLocaleString()}원
            </span>
          </div>
          <button
            onClick={() => setScreen("payment")}
            disabled={totalPassengers === 0}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all disabled:opacity-40"
            style={{ background: "#1A6FE8", fontSize: "20px" }}
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  // ── PAYMENT ───────────────────────────────────────────────
  if (screen === "payment" && selectedTrip) {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("passengers")} className="text-gray-700 mr-3">
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>
            결제
          </h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 p-5 space-y-4">
          {/* 여정 요약 */}
          <div className="border border-gray-200 rounded-2xl p-5 space-y-3">
            <p className="font-bold text-gray-900 border-b border-gray-100 pb-3" style={{ fontSize: "16px" }}>
              예매 정보
            </p>
            {[
              { label: "노선", value: `${departure} → ${arrival}` },
              { label: "출발일", value: formatDisplay(travelDate) },
              { label: "출발시각", value: selectedTrip.departureTime },
              { label: "버스회사", value: selectedTrip.company },
              { label: "등급", value: selectedTrip.grade },
              { label: "소요시간", value: selectedTrip.duration },
              { label: "인원", value: `어른 ${adults}명${kids ? ` / 청소년 ${kids}명` : ""}${seniors ? ` / 경로 ${seniors}명` : ""}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400" style={{ fontSize: "14px" }}>{label}</span>
                <span className="font-semibold text-gray-800 text-right" style={{ fontSize: "14px", maxWidth: "60%" }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-100 pt-3 mt-1">
              <span className="font-bold text-gray-800" style={{ fontSize: "16px" }}>총 결제 금액</span>
              <span className="font-black" style={{ fontSize: "20px", color: "#1A6FE8" }}>
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="space-y-3">
            <button
              onClick={() => setScreen("complete")}
              className="w-full text-white rounded-2xl py-10 flex flex-col items-center gap-3 shadow-md active:scale-95 transition-all"
              style={{ background: "#1A6FE8" }}
            >
              <span style={{ fontSize: "52px" }}>💳</span>
              <span style={{ fontSize: "22px", fontWeight: "700" }}>카드 결제</span>
            </button>
            <button
              onClick={() => setScreen("complete")}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-10 flex flex-col items-center gap-3 shadow-md active:scale-95 transition-all"
            >
              <span style={{ fontSize: "52px" }}>💵</span>
              <span style={{ fontSize: "22px", fontWeight: "700" }}>현금 결제</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────
  if (screen === "complete" && selectedTrip) {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 text-center">
          <h1 className="font-bold text-gray-900" style={{ fontSize: "18px" }}>예매 완료</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-7">
          <div
            className="rounded-full w-24 h-24 flex items-center justify-center"
            style={{ background: "#EBF2FF" }}
          >
            <Check size={52} style={{ color: "#1A6FE8" }} strokeWidth={3} />
          </div>

          <div className="text-center">
            <p className="font-bold text-gray-900" style={{ fontSize: "24px" }}>예매가 완료되었습니다!</p>
            <p className="text-gray-400 mt-2" style={{ fontSize: "14px" }}>
              예매번호: <strong className="text-gray-700">{bookingNum}</strong>
            </p>
          </div>

          {/* 승차권 카드 */}
          <div className="w-full border-2 border-dashed rounded-2xl p-5 space-y-3" style={{ borderColor: "#1A6FE8" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">출발</p>
                <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>{departure}</p>
              </div>
              <ArrowLeft size={20} className="text-gray-300 rotate-180" />
              <div className="text-right">
                <p className="text-gray-400 text-xs">도착</p>
                <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>{arrival}</p>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
              {[
                { label: "출발일시", value: `${formatDisplay(travelDate)} ${selectedTrip.departureTime}` },
                { label: "버스", value: `${selectedTrip.company} (${selectedTrip.grade})` },
                { label: "인원", value: `${totalPassengers}명` },
                { label: "결제금액", value: `${totalPrice.toLocaleString()}원` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400" style={{ fontSize: "13px" }}>{label}</span>
                  <span className="font-semibold text-gray-800" style={{ fontSize: "13px" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => { setAdults(1); setKids(0); setSeniors(0); setSelectedTrip(null); setScreen("results"); }}
              className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all"
              style={{ background: "#1A6FE8", fontSize: "18px" }}
            >
              다른 편 조회
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-gray-600 rounded-2xl py-5 font-bold active:scale-95 transition-all"
              style={{ fontSize: "18px" }}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

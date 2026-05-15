import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Clock,
  CreditCard,
  MapPinned,
  Menu,
  Smartphone,
  Train,
  Users,
} from "lucide-react";

type TripForm = {
  departure: string;
  arrival: string;
  travelDate: string;
  passengers: number;
};

type TrainSchedule = {
  id: string;
  number: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
};

const stationOptions = ["전주", "서울", "용산", "광명", "수서", "영등포", "수원", "평택", "천안아산", "대전", "동대구", "부산", "목포", "강릉"];

const baseSchedules: TrainSchedule[] = [
  { id: "KTX-산천", number: "KTX-산천", departureTime: "06:25", arrivalTime: "08:13", duration: "1시간 48분", price: 34400 },
  { id: "KTX-504", number: "KTX 504", departureTime: "07:26", arrivalTime: "09:10", duration: "1시간 44분", price: 34400 },
  { id: "무궁화호-1572", number: "무궁화호-1572", departureTime: "08:17", arrivalTime: "11:58", duration: "3시간 41분", price: 17600 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "09:11", arrivalTime: "10:59", duration: "1시간 48분", price: 34400 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "10:02", arrivalTime: "11:36", duration: "1시간 34분", price: 34400 },
  { id: "ITX-새마을", number: "ITX-새마을", departureTime: "10:17", arrivalTime: "13:29", duration: "3시간 12분", price: 26200 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "11:38", arrivalTime: "13:26", duration: "1시간 48분", price: 34400 },
  { id: "ITX-마음", number: "ITX-마음", departureTime: "12:34", arrivalTime: "15:40", duration: "3시간 06분", price: 26200 },
  { id: "KTX-586", number: "KTX 586", departureTime: "12:54", arrivalTime: "15:18", duration: "2시간 24분", price: 32900 },
  { id: "KTX-510", number: "KTX-510", departureTime: "13:18", arrivalTime: "15:03", duration: "1시간 45분", price: 34400 },
  { id: "KTX-582", number: "KTX-582", departureTime: "13:27", arrivalTime: "15:52", duration: "2시간 25분", price: 32900 },
  { id: "KTX-512", number: "KTX-512", departureTime: "14:18", arrivalTime: "16:01", duration: "1시간 43분", price: 34400 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "14:57", arrivalTime: "17:22", duration: "2시간 25분", price: 32900 },
  { id: "무궁화호-1574", number: "무궁화호-1574", departureTime: "15:03", arrivalTime: "18:52", duration: "3시간 49분", price: 17600 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "15:21", arrivalTime: "17:03", duration: "1시간 42분", price: 34400 },
  { id: "ITX-새마을", number: "ITX-새마을", departureTime: "15:44", arrivalTime: "19:06", duration: "3시간 22분", price: 26200 },
  { id: "KTX-516", number: "KTX-516", departureTime: "16:17", arrivalTime: "18:01", duration: "1시간 44분", price: 34400 },
  { id: "ITX-마음", number: "ITX-마음", departureTime: "17:19", arrivalTime: "20:27", duration: "3시간 08분", price: 26200 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "17:56", arrivalTime: "19:36", duration: "1시간 40분", price: 34400 },
  { id: "KTX-520", number: "KTX-520", departureTime: "19:28", arrivalTime: "21:13", duration: "1시간 45분", price: 34400 },
  { id: "무궁화호-1576", number: "무궁화호-1576", departureTime: "19:57", arrivalTime: "23:37", duration: "3시간 40분", price: 17600 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "20:15", arrivalTime: "22:41", duration: "2시간 26분", price: 32900 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "20:46", arrivalTime: "22:34", duration: "1시간 48분", price: 34400 },
  { id: "무궁화호-1578", number: "무궁화호-1578", departureTime: "21:04", arrivalTime: "00:31", duration: "3시간 27분", price: 17600 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "21:43", arrivalTime: "23:26", duration: "1시간 43분", price: 34400 },
  { id: "KTX-산천", number: "KTX-산천", departureTime: "23:11", arrivalTime: "00:44", duration: "1시간 33분", price: 34400 },
];

/** 좌석 열: 좌측 창→복도 D,C / 통로 / 우측 복도→창 B,A (코레일톡과 동일 배치) */
const SEAT_COLS_LEFT = ["D", "C"] as const;
const SEAT_COLS_RIGHT = ["B", "A"] as const;
const SEAT_ROW_COUNT = 14;

type CarConfig = {
  car: number;
  totalSeats: number;
  tag: string | null;
};

const CAR_CONFIGS: CarConfig[] = [
  { car: 5, totalSeats: 56, tag: null },
  { car: 6, totalSeats: 56, tag: null },
  { car: 7, totalSeats: 56, tag: null },
  { car: 8, totalSeats: 56, tag: "유아동반석" },
  { car: 9, totalSeats: 56, tag: null },
  { car: 10, totalSeats: 56, tag: null },
  { car: 11, totalSeats: 56, tag: null },
  { car: 12, totalSeats: 56, tag: null },
];

type PaymentChannel = "card" | "simple" | null;

const stepMeta = [
  { step: 1, label: "여정 선택" },
  { step: 2, label: "열차 확인" },
  { step: 3, label: "좌석 선택" },
  { step: 4, label: "결제 진행" },
  { step: 5, label: "승차권 확인" },
] as const;

function getOccupiedSeatIds(car: number): Set<string> {
  const occupied = new Set<string>();
  for (let row = 1; row <= SEAT_ROW_COUNT; row++) {
    for (const col of [...SEAT_COLS_LEFT, ...SEAT_COLS_RIGHT]) {
      const n = (car * 13 + row * 3 + col.charCodeAt(0)) % 7;
      if (n === 0 || n === 2) occupied.add(`${row}${col}`);
    }
  }
  return occupied;
}

export default function KTXPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [form, setForm] = useState<TripForm>({
    departure: "전주",
    arrival: "용산",
    travelDate: today,
    passengers: 1,
  });
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [carIndex, setCarIndex] = useState(() =>
    CAR_CONFIGS.findIndex((c) => c.car === 8),
  );
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>(null);
  /** 결제 시나리오 단계 (카드·간편 각 3단계) */
  const [paymentStep, setPaymentStep] = useState(1);
  const [simplePayBrand, setSimplePayBrand] = useState<string | null>(null);
  const [paymentPin, setPaymentPin] = useState("");

  const currentCar = CAR_CONFIGS[carIndex] ?? CAR_CONFIGS[0];
  const occupiedSeatIds = useMemo(
    () => getOccupiedSeatIds(currentCar.car),
    [currentCar.car],
  );

  const seatPrice = selectedTrain ? selectedTrain.price : 0;
  const totalPrice = seatPrice * form.passengers;

  const filteredSchedules = baseSchedules.map((train) => ({
    ...train,
    price: form.departure === "전주" && form.arrival === "용산" ? train.price : Math.round(train.price * 0.8),
  }));

  const canSearch = form.departure !== form.arrival && !!form.travelDate && form.passengers >= 1;
  const canProceedToPayment = selectedSeats.length === form.passengers;

  const availableCountInCar =
    currentCar.totalSeats - occupiedSeatIds.size - selectedSeats.length;

  function handleTrainSearch() {
    if (!canSearch) {
      alert("출발역, 도착역, 가는 날, 인원을 확인해 주세요.");
      return;
    }
    setStep(2);
  }

  function toggleSeat(seatId: string) {
    if (occupiedSeatIds.has(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((item) => item !== seatId));
      return;
    }

    if (selectedSeats.length >= form.passengers) {
      alert(`좌석은 ${form.passengers}석까지만 선택할 수 있어요.`);
      return;
    }

    setSelectedSeats((prev) => [...prev, seatId]);
  }

  function goToCar(nextIndex: number) {
    const i = Math.max(0, Math.min(CAR_CONFIGS.length - 1, nextIndex));
    setCarIndex(i);
    setSelectedSeats([]);
  }

  function resetPaymentFlow() {
    setPaymentChannel(null);
    setPaymentStep(1);
    setSimplePayBrand(null);
    setPaymentPin("");
  }

  function completePurchase() {
    alert("결제가 완료되었습니다. 승차권이 발권되었습니다.");
    resetPaymentFlow();
    setStep(5);
  }

  function handleBackByStep() {
    if (step === 1) {
      navigate("/");
      return;
    }
    if (step === 2) {
      setStep(1);
      return;
    }
    if (step === 3) {
      setStep(2);
      setSelectedSeats([]);
      setCarIndex(CAR_CONFIGS.findIndex((c) => c.car === 8));
      return;
    }
    if (step === 4) {
      if (paymentChannel) {
        if (paymentStep > 1) {
          if (paymentChannel === "simple" && paymentStep === 2) {
            setSimplePayBrand(null);
          }
          setPaymentStep((s) => s - 1);
          return;
        }
        resetPaymentFlow();
        return;
      }
      setStep(3);
      resetPaymentFlow();
      return;
    }
    if (step === 5) {
      setStep(4);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-[linear-gradient(180deg,#dff2ff_0%,#f7fbff_100%)]">
      {/* Compact mobile header */}
      <div className="bg-[linear-gradient(135deg,#0b5cab_0%,#1784d8_58%,#44b3e8_100%)] px-3 pt-3 pb-2 flex-shrink-0 text-white">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleBackByStep}
            className="rounded-xl bg-white/15 p-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate" style={{ fontSize: "15px" }}>코레일톡 연습</p>
            <p className="text-white/75" style={{ fontSize: "11px" }}>
              STEP {step}/5 · {stepMeta[step - 1].label}
            </p>
          </div>
          <Train size={20} className="opacity-70 flex-shrink-0" />
        </div>
        <div className="flex gap-1">
          {stepMeta.map((item) => {
            const active = item.step === step;
            const done = item.step < step;
            return (
              <div
                key={item.step}
                className={`flex-1 rounded-md py-1 text-center transition-all ${
                  active ? "bg-white text-sky-800" : done ? "bg-sky-400/40 text-white" : "bg-white/10 text-white/50"
                }`}
                style={{ fontSize: "11px", fontWeight: "700" }}
              >
                {item.step}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-3 py-3 space-y-3">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-sky-100 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-sky-700 mb-2">
                  <MapPinned size={14} />
                  <label style={{ fontSize: "13px", fontWeight: "700" }}>출발역</label>
                </div>
                <select
                  value={form.departure}
                  onChange={(e) => setForm((prev) => ({ ...prev, departure: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-2 py-2 bg-slate-50"
                  style={{ fontSize: "14px" }}
                >
                  {stationOptions.map((station) => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white border border-sky-100 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-sky-700 mb-2">
                  <Train size={14} />
                  <label style={{ fontSize: "13px", fontWeight: "700" }}>도착역</label>
                </div>
                <select
                  value={form.arrival}
                  onChange={(e) => setForm((prev) => ({ ...prev, arrival: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-2 py-2 bg-slate-50"
                  style={{ fontSize: "14px" }}
                >
                  {stationOptions.map((station) => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-700 mb-2">
                  <CalendarDays size={14} />
                  <label style={{ fontSize: "13px", fontWeight: "700" }}>가는 날</label>
                </div>
                <input
                  type="date"
                  min={today}
                  value={form.travelDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, travelDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-2 py-2 bg-slate-50"
                  style={{ fontSize: "13px" }}
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-700 mb-2">
                  <Users size={14} />
                  <label style={{ fontSize: "13px", fontWeight: "700" }}>인원</label>
                </div>
                <select
                  value={form.passengers}
                  onChange={(e) => setForm((prev) => ({ ...prev, passengers: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-2 py-2 bg-slate-50"
                  style={{ fontSize: "14px" }}
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>{count}명</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-[linear-gradient(135deg,#08335f_0%,#115f9d_55%,#2ca2d7_100%)] p-4 text-white">
              <p style={{ fontSize: "14px", fontWeight: "700" }}>
                {form.departure}에서 {form.arrival}까지
              </p>
              <button
                onClick={handleTrainSearch}
                className="mt-3 w-full bg-white text-sky-800 rounded-xl px-4 py-3 shadow-lg active:scale-95 transition-all"
                style={{ fontSize: "16px", fontWeight: "800" }}
              >
                열차 조회
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
              <p className="text-slate-800" style={{ fontSize: "13px", fontWeight: "700" }}>
                {form.departure} → {form.arrival} / {form.travelDate} / {form.passengers}명
              </p>
            </div>

            <div className="space-y-2">
              {filteredSchedules.map((train) => (
                <button
                  key={train.id + train.departureTime}
                  onClick={() => {
                    setSelectedTrain(train);
                    setSelectedSeats([]);
                    setCarIndex(CAR_CONFIGS.findIndex((c) => c.car === 8));
                    setStep(3);
                  }}
                  className="w-full text-left bg-white border border-slate-200 rounded-2xl p-3 shadow-sm active:border-sky-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-sky-100 text-sky-800 px-2 py-1 text-center min-w-[56px]">
                        <p style={{ fontSize: "10px", fontWeight: "700" }}>열차</p>
                        <p style={{ fontSize: "13px", fontWeight: "800" }}>
                          {train.number.replace("KTX-", "").replace("KTX ", "")}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-900" style={{ fontSize: "14px", fontWeight: "800" }}>
                          {train.number}
                        </p>
                        <p className="text-slate-600" style={{ fontSize: "12px" }}>
                          {train.departureTime} → {train.arrivalTime}
                        </p>
                        <p className="text-slate-400" style={{ fontSize: "11px" }}>
                          {train.duration}
                        </p>
                      </div>
                    </div>
                    <p className="text-sky-800 flex-shrink-0" style={{ fontSize: "15px", fontWeight: "800" }}>
                      {train.price.toLocaleString()}원
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && selectedTrain && (
          <div className="space-y-2">
            <div className="rounded-t-2xl bg-[#123c69] text-white px-3 py-3 flex items-center justify-between">
              <p className="flex-1 text-center" style={{ fontSize: "14px", fontWeight: "700" }}>
                {currentCar.car}호차 좌석 선택
              </p>
              <div className="flex items-center gap-2">
                <Clock className="opacity-80" size={16} />
                <Menu className="opacity-80" size={16} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-b-2xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-100 space-y-2 bg-gradient-to-b from-white to-sky-50/50">
                <div className="relative">
                  <select
                    value={currentCar.car}
                    onChange={(e) => {
                      const car = Number(e.target.value);
                      const idx = CAR_CONFIGS.findIndex((c) => c.car === car);
                      if (idx >= 0) goToCar(idx);
                    }}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2"
                    style={{ fontSize: "14px", fontWeight: "600" }}
                  >
                    {CAR_CONFIGS.map((c) => (
                      <option key={c.car} value={c.car}>
                        {c.car}호차 ({c.totalSeats}석){c.tag ? ` · ${c.tag}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                </div>

                <div className="flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => goToCar(carIndex - 1)}
                    disabled={carIndex <= 0}
                    className="flex-1 rounded-xl border border-slate-200 py-2 disabled:opacity-40"
                    style={{ fontSize: "13px", fontWeight: "700" }}
                  >
                    {carIndex > 0 ? `${CAR_CONFIGS[carIndex - 1].car}호차` : "—"}
                  </button>
                  <div className="flex-[1.4] flex flex-col justify-center text-center">
                    <p className="text-slate-900" style={{ fontSize: "12px", fontWeight: "700" }}>
                      {selectedTrain.number}
                    </p>
                    <p className="text-slate-500" style={{ fontSize: "11px" }}>
                      잔여 {Math.max(0, availableCountInCar)}석 / {currentCar.totalSeats}석
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToCar(carIndex + 1)}
                    disabled={carIndex >= CAR_CONFIGS.length - 1}
                    className="flex-1 rounded-xl border border-slate-200 py-2 disabled:opacity-40"
                    style={{ fontSize: "13px", fontWeight: "700" }}
                  >
                    {carIndex < CAR_CONFIGS.length - 1 ? `${CAR_CONFIGS[carIndex + 1].car}호차` : "—"}
                  </button>
                </div>
              </div>

              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-x-3 gap-y-1 justify-center text-slate-600"
                style={{ fontSize: "11px" }}>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block size-2.5 rounded-full bg-gray-300" />선택 불가
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block size-2.5 rounded-full border-2 border-blue-600 bg-white" />선택 가능
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-blue-600">∨</span>순방향
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-blue-600">∧</span>역방향
                </span>
              </div>

              <div className="p-3 overflow-x-auto">
                <p className="text-center text-slate-600 mb-2" style={{ fontSize: "12px" }}>
                  {selectedSeats.length}/{form.passengers}석 선택
                </p>
                <div className="min-w-[300px] max-w-full mx-auto">
                  <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem_1fr_1fr] gap-y-1.5 gap-x-1 items-center mb-1 text-center text-slate-400"
                    style={{ fontSize: "11px", fontWeight: "600" }}>
                    <div /><div>창</div><div>내</div><div /><div>내</div><div>창</div>
                  </div>
                  {Array.from({ length: SEAT_ROW_COUNT }, (_, i) => i + 1).map((row) => (
                    <div key={row} className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem_1fr_1fr] gap-y-1.5 gap-x-1 items-center mb-1">
                      <div className="text-center text-slate-400 font-semibold" style={{ fontSize: "11px" }}>{row}</div>
                      {SEAT_COLS_LEFT.map((col) => {
                        const id = `${row}${col}`;
                        const occupied = occupiedSeatIds.has(id);
                        const selected = selectedSeats.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={occupied}
                            onClick={() => toggleSeat(id)}
                            className={`rounded-lg py-2 border-2 transition-all min-h-[36px] ${
                              occupied
                                ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed"
                                : selected
                                  ? "bg-sky-600 border-sky-700 text-white"
                                  : "bg-white border-sky-600 text-slate-900"
                            }`}
                            style={{ fontSize: "12px", fontWeight: "700" }}
                          >
                            {id}
                          </button>
                        );
                      })}
                      <div className="flex flex-col items-center justify-center text-sky-600 select-none" aria-hidden>
                        <span style={{ fontSize: "8px", lineHeight: 1 }}>▲</span>
                        <span style={{ fontSize: "8px", lineHeight: 1 }}>▲</span>
                      </div>
                      {SEAT_COLS_RIGHT.map((col) => {
                        const id = `${row}${col}`;
                        const occupied = occupiedSeatIds.has(id);
                        const selected = selectedSeats.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={occupied}
                            onClick={() => toggleSeat(id)}
                            className={`rounded-lg py-2 border-2 transition-all min-h-[36px] ${
                              occupied
                                ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed"
                                : selected
                                  ? "bg-sky-600 border-sky-700 text-white"
                                  : "bg-white border-sky-600 text-slate-900"
                            }`}
                            style={{ fontSize: "12px", fontWeight: "700" }}
                          >
                            {id}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {currentCar.tag === "유아동반석" && (
                <div className="mx-3 mb-3 rounded-xl bg-slate-100 px-3 py-2 text-slate-600" style={{ fontSize: "12px", lineHeight: 1.5 }}>
                  유아동반 고객을 배려하기 위한 객실입니다.
                </div>
              )}

              <div className="p-3 pt-0">
                <button
                  onClick={() => { resetPaymentFlow(); setStep(4); }}
                  disabled={!canProceedToPayment}
                  className="w-full bg-[#123c69] text-white rounded-xl py-3 shadow disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.99] transition-all"
                  style={{ fontSize: "15px", fontWeight: "700" }}
                >
                  결제창으로 이동
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && selectedTrain && (
          <div className="space-y-3">
            <div className="bg-white border border-sky-100 rounded-2xl p-4">
              <p className="text-slate-900" style={{ fontSize: "16px", fontWeight: "800" }}>결제 정보 확인</p>
              <div className="space-y-1 mt-3 text-slate-700" style={{ fontSize: "13px" }}>
                <p>노선: {form.departure} → {form.arrival}</p>
                <p>날짜: {form.travelDate}</p>
                <p>열차: {selectedTrain.number}</p>
                <p>좌석: {currentCar.car}호차 {selectedSeats.join(", ")}</p>
                <p>인원: {form.passengers}명</p>
                <p className="text-sky-800 font-bold" style={{ fontSize: "15px" }}>
                  총 결제금액: {totalPrice.toLocaleString()}원
                </p>
              </div>
            </div>

            {!paymentChannel && (
              <>
                <p className="text-slate-700 text-center" style={{ fontSize: "14px", fontWeight: "600" }}>
                  결제 수단을 선택해 주세요
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setPaymentChannel("card"); setPaymentStep(1); }}
                    className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm active:border-sky-300 transition-all text-left flex flex-col gap-2"
                  >
                    <CreditCard className="text-sky-700" size={28} strokeWidth={2} />
                    <span className="text-slate-900" style={{ fontSize: "15px", fontWeight: "800" }}>카드 결제</span>
                    <span className="text-slate-500" style={{ fontSize: "12px" }}>신용·체크카드</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentChannel("simple"); setPaymentStep(1); setSimplePayBrand(null); }}
                    className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm active:border-sky-300 transition-all text-left flex flex-col gap-2"
                  >
                    <Smartphone className="text-sky-700" size={28} strokeWidth={2} />
                    <span className="text-slate-900" style={{ fontSize: "15px", fontWeight: "800" }}>간편 결제</span>
                    <span className="text-slate-500" style={{ fontSize: "12px" }}>카카오페이·토스 등</span>
                  </button>
                </div>
              </>
            )}

            {paymentChannel === "card" && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 space-y-3">
                <p className="text-slate-900" style={{ fontSize: "15px", fontWeight: "800" }}>
                  카드 결제 ({paymentStep}/3)
                </p>
                {paymentStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-slate-700" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                      카드를 단말기에 삽입하거나 화면 안내대로 카드를 태그해 주세요.
                    </p>
                    <button type="button" onClick={() => setPaymentStep(2)}
                      className="w-full bg-sky-700 text-white rounded-xl py-3 transition-all"
                      style={{ fontSize: "14px", fontWeight: "700" }}>
                      카드 인식 완료
                    </button>
                  </div>
                )}
                {paymentStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-slate-700" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                      비밀번호 4자리를 입력해 주세요. 아무 숫자나 입력해도 됩니다.
                    </p>
                    <input type="password" inputMode="numeric" maxLength={4} value={paymentPin}
                      onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="비밀번호 4자리"
                      className="w-full rounded-xl border border-sky-200 bg-white px-3 py-3"
                      style={{ fontSize: "16px", fontWeight: "600" }} />
                    <button type="button" onClick={() => setPaymentStep(3)}
                      className="w-full bg-sky-700 text-white rounded-xl py-3 transition-all"
                      style={{ fontSize: "14px", fontWeight: "700" }}>
                      입력 완료
                    </button>
                  </div>
                )}
                {paymentStep === 3 && (
                  <div className="space-y-3">
                    <p className="text-slate-700" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                      결제 승인 중입니다… 잠시만 기다려 주세요.
                    </p>
                    <button type="button" onClick={completePurchase}
                      className="w-full bg-green-700 text-white rounded-xl py-3 transition-all"
                      style={{ fontSize: "14px", fontWeight: "700" }}>
                      승인 확인
                    </button>
                  </div>
                )}
              </div>
            )}

            {paymentChannel === "simple" && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 space-y-3">
                <p className="text-slate-900" style={{ fontSize: "15px", fontWeight: "800" }}>
                  간편 결제 ({paymentStep}/3)
                </p>
                {paymentStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-slate-700" style={{ fontSize: "13px" }}>사용할 간편결제를 선택해 주세요.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["카카오페이", "토스페이", "네이버페이"] as const).map((name) => (
                        <button key={name} type="button" onClick={() => setSimplePayBrand(name)}
                          className={`rounded-xl border py-2 transition-all ${
                            simplePayBrand === name ? "border-sky-600 bg-white shadow" : "border-slate-200 bg-white"
                          }`}
                          style={{ fontSize: "12px", fontWeight: "700" }}>
                          {name}
                        </button>
                      ))}
                    </div>
                    <button type="button" disabled={!simplePayBrand} onClick={() => setPaymentStep(2)}
                      className="w-full bg-sky-700 text-white rounded-xl py-3 disabled:bg-slate-300 transition-all"
                      style={{ fontSize: "14px", fontWeight: "700" }}>
                      다음
                    </button>
                  </div>
                )}
                {paymentStep === 2 && simplePayBrand && (
                  <div className="space-y-3">
                    <p className="text-slate-700" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                      <strong>{simplePayBrand}</strong> 앱에서 비밀번호를 입력해 주세요.
                    </p>
                    <input type="password" inputMode="numeric" maxLength={6} value={paymentPin}
                      onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="간편결제 비밀번호"
                      className="w-full rounded-xl border border-sky-200 bg-white px-3 py-3"
                      style={{ fontSize: "16px", fontWeight: "600" }} />
                    <button type="button" onClick={() => setPaymentStep(3)}
                      className="w-full bg-sky-700 text-white rounded-xl py-3 transition-all"
                      style={{ fontSize: "14px", fontWeight: "700" }}>
                      앱에서 승인 완료
                    </button>
                  </div>
                )}
                {paymentStep === 3 && simplePayBrand && (
                  <div className="space-y-3">
                    <p className="text-slate-700" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                      {simplePayBrand}로 결제를 처리하는 중입니다…
                    </p>
                    <button type="button" onClick={completePurchase}
                      className="w-full bg-green-700 text-white rounded-xl py-3 transition-all"
                      style={{ fontSize: "14px", fontWeight: "700" }}>
                      승인 확인
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 5 && selectedTrain && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-emerald-800" style={{ fontSize: "17px", fontWeight: "800" }}>예매 완료</p>
              <p className="text-slate-600 mt-1" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                결제가 완료되었어요. 아래에서 발권된 승차권을 확인해 주세요.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-sky-100 shadow-sm overflow-hidden">
              <div className="bg-[linear-gradient(135deg,#0b5cab_0%,#1784d8_58%,#44b3e8_100%)] px-4 py-3 text-white">
                <p style={{ fontSize: "13px", fontWeight: "700" }}>모바일 승차권</p>
                <p className="mt-0.5" style={{ fontSize: "20px", fontWeight: "800" }}>{selectedTrain.number}</p>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500" style={{ fontSize: "12px", fontWeight: "700" }}>출발</p>
                    <p className="mt-1 text-slate-900" style={{ fontSize: "18px", fontWeight: "800" }}>{form.departure}</p>
                    <p className="text-slate-500" style={{ fontSize: "13px" }}>{selectedTrain.departureTime}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500" style={{ fontSize: "12px", fontWeight: "700" }}>도착</p>
                    <p className="mt-1 text-slate-900" style={{ fontSize: "18px", fontWeight: "800" }}>{form.arrival}</p>
                    <p className="text-slate-500" style={{ fontSize: "13px" }}>{selectedTrain.arrivalTime}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-sky-200 p-3 space-y-1" style={{ fontSize: "13px" }}>
                  <p><strong>탑승일</strong> {form.travelDate}</p>
                  <p><strong>소요시간</strong> {selectedTrain.duration}</p>
                  <p><strong>좌석</strong> {currentCar.car}호차 {selectedSeats.join(", ")}</p>
                  <p><strong>인원</strong> {form.passengers}명</p>
                  <p><strong>결제금액</strong> {totalPrice.toLocaleString()}원</p>
                  <p><strong>승차권 번호</strong> KR-{selectedTrain.departureTime.replace(":", "")}-{currentCar.car}{selectedSeats[0] ?? "A1"}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full rounded-xl bg-[#123c69] py-3 text-white transition-all"
                  style={{ fontSize: "15px", fontWeight: "700" }}
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

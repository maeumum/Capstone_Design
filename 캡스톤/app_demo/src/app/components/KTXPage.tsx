import { useMemo, useState, useEffect } from "react";
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
  Check,
} from "lucide-react";

// ═══════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════
type TripForm = { departure: string; arrival: string; travelDate: string; passengers: number };
type TrainSchedule = { id: string; number: string; departureTime: string; arrivalTime: string; duration: string; price: number };
type PaymentChannel = "card" | "simple" | null;
type CardPhase = "swipe" | "notice";
type EasyPhase = "select" | "processing";

const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#F3EEFF";

const stationOptions = ["전주","서울","용산","광명","수서","영등포","수원","평택","천안아산","대전","동대구","부산","목포","강릉"];

const baseSchedules: TrainSchedule[] = [
  { id:"KTX-산천-1",    number:"KTX-산천",      departureTime:"06:25", arrivalTime:"08:13", duration:"1시간 48분", price:34400 },
  { id:"KTX-504",       number:"KTX 504",        departureTime:"07:26", arrivalTime:"09:10", duration:"1시간 44분", price:34400 },
  { id:"무궁화-1572",   number:"무궁화호-1572",  departureTime:"08:17", arrivalTime:"11:58", duration:"3시간 41분", price:17600 },
  { id:"KTX-산천-2",    number:"KTX-산천",       departureTime:"09:11", arrivalTime:"10:59", duration:"1시간 48분", price:34400 },
  { id:"KTX-산천-3",    number:"KTX-산천",       departureTime:"10:02", arrivalTime:"11:36", duration:"1시간 34분", price:34400 },
  { id:"ITX-새마을-1",  number:"ITX-새마을",     departureTime:"10:17", arrivalTime:"13:29", duration:"3시간 12분", price:26200 },
  { id:"KTX-산천-4",    number:"KTX-산천",       departureTime:"11:38", arrivalTime:"13:26", duration:"1시간 48분", price:34400 },
  { id:"ITX-마음-1",    number:"ITX-마음",       departureTime:"12:34", arrivalTime:"15:40", duration:"3시간 06분", price:26200 },
  { id:"KTX-586",       number:"KTX 586",        departureTime:"12:54", arrivalTime:"15:18", duration:"2시간 24분", price:32900 },
  { id:"KTX-510",       number:"KTX-510",        departureTime:"13:18", arrivalTime:"15:03", duration:"1시간 45분", price:34400 },
  { id:"KTX-582",       number:"KTX-582",        departureTime:"13:27", arrivalTime:"15:52", duration:"2시간 25분", price:32900 },
  { id:"KTX-512",       number:"KTX-512",        departureTime:"14:18", arrivalTime:"16:01", duration:"1시간 43분", price:34400 },
  { id:"KTX-산천-5",    number:"KTX-산천",       departureTime:"14:57", arrivalTime:"17:22", duration:"2시간 25분", price:32900 },
  { id:"무궁화-1574",   number:"무궁화호-1574",  departureTime:"15:03", arrivalTime:"18:52", duration:"3시간 49분", price:17600 },
  { id:"KTX-산천-6",    number:"KTX-산천",       departureTime:"15:21", arrivalTime:"17:03", duration:"1시간 42분", price:34400 },
  { id:"ITX-새마을-2",  number:"ITX-새마을",     departureTime:"15:44", arrivalTime:"19:06", duration:"3시간 22분", price:26200 },
  { id:"KTX-516",       number:"KTX-516",        departureTime:"16:17", arrivalTime:"18:01", duration:"1시간 44분", price:34400 },
  { id:"ITX-마음-2",    number:"ITX-마음",       departureTime:"17:19", arrivalTime:"20:27", duration:"3시간 08분", price:26200 },
  { id:"KTX-산천-7",    number:"KTX-산천",       departureTime:"17:56", arrivalTime:"19:36", duration:"1시간 40분", price:34400 },
  { id:"KTX-520",       number:"KTX-520",        departureTime:"19:28", arrivalTime:"21:13", duration:"1시간 45분", price:34400 },
  { id:"무궁화-1576",   number:"무궁화호-1576",  departureTime:"19:57", arrivalTime:"23:37", duration:"3시간 40분", price:17600 },
  { id:"KTX-산천-8",    number:"KTX-산천",       departureTime:"20:15", arrivalTime:"22:41", duration:"2시간 26분", price:32900 },
  { id:"KTX-산천-9",    number:"KTX-산천",       departureTime:"20:46", arrivalTime:"22:34", duration:"1시간 48분", price:34400 },
  { id:"KTX-산천-10",   number:"KTX-산천",       departureTime:"21:43", arrivalTime:"23:26", duration:"1시간 43분", price:34400 },
  { id:"KTX-산천-11",   number:"KTX-산천",       departureTime:"23:11", arrivalTime:"00:44", duration:"1시간 33분", price:34400 },
];

const SEAT_COLS_LEFT  = ["D", "C"] as const;
const SEAT_COLS_RIGHT = ["B", "A"] as const;
const SEAT_ROW_COUNT  = 14;

type CarConfig = { car: number; totalSeats: number; tag: string | null };
const CAR_CONFIGS: CarConfig[] = [
  { car:5,  totalSeats:56, tag:null },
  { car:6,  totalSeats:56, tag:null },
  { car:7,  totalSeats:56, tag:null },
  { car:8,  totalSeats:56, tag:"유아동반석" },
  { car:9,  totalSeats:56, tag:null },
  { car:10, totalSeats:56, tag:null },
  { car:11, totalSeats:56, tag:null },
  { car:12, totalSeats:56, tag:null },
];

const stepMeta = [
  { step:1, label:"여정 선택" },
  { step:2, label:"열차 확인" },
  { step:3, label:"좌석 선택" },
  { step:4, label:"결제 진행" },
  { step:5, label:"승차권 확인" },
] as const;

const EASY_PAY_OPTIONS = [
  { id:"toss",  label:"토스페이",   color:"#0064FF", textColor:"#fff" },
  { id:"kakao", label:"카카오페이", color:"#FAE100", textColor:"#1A1A1A" },
  { id:"naver", label:"네이버페이", color:"#03C75A", textColor:"#fff" },
];

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shiftTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  let total = ((h * 60 + m + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2,"0")}:${String(total % 60).padStart(2,"0")}`;
}

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

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function KTXPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [step, setStep]                     = useState<1|2|3|4|5>(1);
  const [form, setForm]                     = useState<TripForm>({ departure:"전주", arrival:"용산", travelDate:today, passengers:1 });
  const [selectedTrain, setSelectedTrain]   = useState<TrainSchedule|null>(null);
  const [selectedSeats, setSelectedSeats]   = useState<string[]>([]);
  const [carIndex, setCarIndex]             = useState(() => CAR_CONFIGS.findIndex(c => c.car === 8));
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>(null);
  const [cardPhase, setCardPhase]           = useState<CardPhase>("swipe");
  const [easyPhase, setEasyPhase]           = useState<EasyPhase>("select");
  const [easyBrand, setEasyBrand]           = useState<typeof EASY_PAY_OPTIONS[number]|null>(null);

  const currentCar        = CAR_CONFIGS[carIndex] ?? CAR_CONFIGS[0];
  const occupiedSeatIds   = useMemo(() => getOccupiedSeatIds(currentCar.car), [currentCar.car]);
  const seatPrice         = selectedTrain ? selectedTrain.price : 0;
  const totalPrice        = seatPrice * form.passengers;
  const canProceedToPayment = selectedSeats.length === form.passengers;
  const availableCountInCar = currentCar.totalSeats - occupiedSeatIds.size - selectedSeats.length;

  const filteredSchedules = useMemo(() => {
    const dateSeed = form.travelDate.split("-").reduce((acc, p) => acc * 100 + Number(p), 0);
    const rand = seededRand(dateSeed);
    return baseSchedules.map(train => {
      const offset = Math.round((rand() - 0.5) * 10);
      return {
        ...train,
        departureTime: shiftTime(train.departureTime, offset),
        arrivalTime: shiftTime(train.arrivalTime, offset),
        price: form.departure === "전주" && form.arrival === "용산" ? train.price : Math.round(train.price * 0.8),
      };
    });
  }, [form.travelDate, form.departure, form.arrival]);

  // ── 카드 결제 자동 진행 ───────────────────────────
  useEffect(() => {
    if (step !== 4 || paymentChannel !== "card") return;
    setCardPhase("swipe");
    const t1 = setTimeout(() => setCardPhase("notice"), 1600);
    const t2 = setTimeout(() => completePurchase(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentChannel]);

  // ── 간편결제 자동 진행 ────────────────────────────
  useEffect(() => {
    if (step !== 4 || paymentChannel !== "simple" || easyPhase !== "processing") return;
    const t = setTimeout(() => completePurchase(), 2600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentChannel, easyPhase]);

  // ── Functions ────────────────────────────────────
  function toggleSeat(seatId: string) {
    if (occupiedSeatIds.has(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
      return;
    }
    if (selectedSeats.length >= form.passengers) {
      alert(`좌석은 ${form.passengers}석까지만 선택할 수 있어요.`);
      return;
    }
    setSelectedSeats(prev => [...prev, seatId]);
  }

  function goToCar(nextIndex: number) {
    const i = Math.max(0, Math.min(CAR_CONFIGS.length - 1, nextIndex));
    setCarIndex(i);
    setSelectedSeats([]);
  }

  function completePurchase() {
    setStep(5);
    setPaymentChannel(null);
    setCardPhase("swipe");
    setEasyPhase("select");
    setEasyBrand(null);
  }

  function handleBackByStep() {
    if (step === 1) { navigate("/"); return; }
    if (step === 2) { setStep(1); return; }
    if (step === 3) { setStep(2); setSelectedSeats([]); setCarIndex(CAR_CONFIGS.findIndex(c => c.car === 8)); return; }
    if (step === 4) {
      if (paymentChannel === "simple" && easyPhase === "processing") { setEasyPhase("select"); return; }
      setPaymentChannel(null); setCardPhase("swipe"); setEasyPhase("select"); setEasyBrand(null);
      if (!paymentChannel) setStep(3);
      return;
    }
    if (step === 5) { navigate("/"); }
  }

  // ═══════════════════════════════════════════════════
  // RENDER
  // h-svh + overflow:hidden → 내부 영역만 스크롤
  // ═══════════════════════════════════════════════════
  return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden",
      background:"linear-gradient(180deg,#dff2ff 0%,#f7fbff 100%)" }}>

      {/* ── 헤더 (고정) ── */}
      <div style={{ background:"linear-gradient(135deg,#0b5cab 0%,#1784d8 58%,#44b3e8 100%)",
        padding:"12px 12px 8px", flexShrink:0, color:"white" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <button onClick={handleBackByStep}
            style={{ borderRadius:10, background:"rgba(255,255,255,0.15)", padding:8, border:"none", cursor:"pointer", color:"white" }}>
            <ArrowLeft size={18}/>
          </button>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:"700", fontSize:"15px", margin:0 }}>코레일톡 연습</p>
            <p style={{ fontSize:"11px", opacity:.75, margin:0 }}>STEP {step}/5 · {stepMeta[step-1].label}</p>
          </div>
          <Train size={20} style={{ opacity:.7 }}/>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {stepMeta.map(item => {
            const active = item.step === step;
            const done   = item.step < step;
            return (
              <div key={item.step} style={{
                flex:1, borderRadius:6, padding:"4px 0", textAlign:"center",
                fontSize:"11px", fontWeight:"700",
                background: active ? "white" : done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                color: active ? "#1565C0" : "white",
              }}>
                {item.step}
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          STEP 3: 좌석 선택 — 별도 flex-column 레이아웃
          (좌석 맵 내부 스크롤 + 버튼 항상 하단 고정)
          ════════════════════════════════════════════ */}
      {step === 3 && selectedTrain && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* 호차 헤더 */}
          <div style={{ background:"#123c69", color:"white", padding:"12px 16px",
            display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <p style={{ fontWeight:"700", fontSize:"14px", margin:0, flex:1, textAlign:"center" }}>
              {currentCar.car}호차 좌석 선택
            </p>
            <div style={{ display:"flex", gap:8, opacity:.8 }}>
              <Clock size={16}/><Menu size={16}/>
            </div>
          </div>

          {/* 호차 선택 컨트롤 */}
          <div style={{ background:"white", borderBottom:"1px solid #e8e8e8", padding:"10px 12px", flexShrink:0 }}>
            <div style={{ position:"relative", marginBottom:8 }}>
              <select
                value={currentCar.car}
                onChange={e => { const idx = CAR_CONFIGS.findIndex(c => c.car === Number(e.target.value)); if (idx >= 0) goToCar(idx); }}
                style={{ width:"100%", border:"1.5px solid #e0e0e0", borderRadius:10, padding:"8px 32px 8px 12px",
                  fontSize:"14px", fontWeight:"600", appearance:"none", background:"white", cursor:"pointer" }}
              >
                {CAR_CONFIGS.map(c => (
                  <option key={c.car} value={c.car}>{c.car}호차 ({c.totalSeats}석){c.tag ? ` · ${c.tag}` : ""}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"#888", pointerEvents:"none" }}/>
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"stretch" }}>
              <button onClick={() => goToCar(carIndex-1)} disabled={carIndex <= 0}
                style={{ flex:1, border:"1.5px solid #e0e0e0", borderRadius:10, padding:"8px 0",
                  fontSize:"13px", fontWeight:"700", background:"white", cursor:"pointer", opacity:carIndex<=0?.4:1 }}>
                {carIndex > 0 ? `${CAR_CONFIGS[carIndex-1].car}호차` : "—"}
              </button>
              <div style={{ flex:1.5, textAlign:"center", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                <p style={{ fontWeight:"700", fontSize:"12px", color:"#111", margin:0 }}>{selectedTrain.number}</p>
                <p style={{ fontSize:"11px", color:"#888", margin:0 }}>잔여 {Math.max(0,availableCountInCar)}석 / {currentCar.totalSeats}석</p>
              </div>
              <button onClick={() => goToCar(carIndex+1)} disabled={carIndex >= CAR_CONFIGS.length-1}
                style={{ flex:1, border:"1.5px solid #e0e0e0", borderRadius:10, padding:"8px 0",
                  fontSize:"13px", fontWeight:"700", background:"white", cursor:"pointer", opacity:carIndex>=CAR_CONFIGS.length-1?.4:1 }}>
                {carIndex < CAR_CONFIGS.length-1 ? `${CAR_CONFIGS[carIndex+1].car}호차` : "—"}
              </button>
            </div>
          </div>

          {/* 범례 */}
          <div style={{ background:"#fafafa", borderBottom:"1px solid #ececec", padding:"6px 12px",
            display:"flex", gap:12, justifyContent:"center", flexShrink:0, flexWrap:"wrap" }}>
            {[
              { color:"#ccc", border:"none", label:"선택 불가" },
              { color:"white", border:"2px solid #1565C0", label:"선택 가능" },
              { color:"#1565C0", border:"none", label:"내가 선택" },
            ].map(({ color, border, label }) => (
              <span key={label} style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:"11px", color:"#666" }}>
                <span style={{ width:10, height:10, borderRadius:"50%", background:color, border:border??undefined, display:"inline-block" }}/>
                {label}
              </span>
            ))}
          </div>

          {/* ── 좌석 맵 (내부 스크롤) ── */}
          <div style={{ flex:1, overflowY:"auto", padding:"10px 12px" }}>
            <p style={{ textAlign:"center", fontSize:"12px", color:"#666", marginBottom:8 }}>
              {selectedSeats.length}/{form.passengers}석 선택
            </p>

            {/* 열 헤더 */}
            <div style={{ display:"grid", gridTemplateColumns:"1.5rem 1fr 1fr 1.5rem 1fr 1fr",
              gap:"0 4px", textAlign:"center", marginBottom:4, fontSize:"11px", color:"#aaa", fontWeight:"600" }}>
              <div/><div>창</div><div>내</div><div/><div>내</div><div>창</div>
            </div>

            {/* 좌석 행 */}
            {Array.from({ length:SEAT_ROW_COUNT }, (_, i) => i+1).map(row => (
              <div key={row} style={{ display:"grid", gridTemplateColumns:"1.5rem 1fr 1fr 1.5rem 1fr 1fr",
                gap:"0 4px", marginBottom:6, alignItems:"center" }}>
                <div style={{ textAlign:"center", fontSize:"11px", color:"#aaa", fontWeight:"600" }}>{row}</div>

                {SEAT_COLS_LEFT.map(col => {
                  const id = `${row}${col}`;
                  const occupied = occupiedSeatIds.has(id);
                  const selected = selectedSeats.includes(id);
                  return (
                    <button key={id} type="button" disabled={occupied} onClick={() => toggleSeat(id)}
                      style={{
                        borderRadius:8, padding:"6px 0", minHeight:36,
                        border: occupied ? "none" : selected ? "2px solid #0d47a1" : "2px solid #1565C0",
                        background: occupied ? "#ddd" : selected ? "#1565C0" : "white",
                        color: occupied ? "#aaa" : selected ? "white" : "#111",
                        fontSize:"12px", fontWeight:"700", cursor: occupied?"not-allowed":"pointer",
                      }}>
                      {id}
                    </button>
                  );
                })}

                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#1565C0" }}>
                  <span style={{ fontSize:8, lineHeight:1 }}>▲</span>
                  <span style={{ fontSize:8, lineHeight:1 }}>▲</span>
                </div>

                {SEAT_COLS_RIGHT.map(col => {
                  const id = `${row}${col}`;
                  const occupied = occupiedSeatIds.has(id);
                  const selected = selectedSeats.includes(id);
                  return (
                    <button key={id} type="button" disabled={occupied} onClick={() => toggleSeat(id)}
                      style={{
                        borderRadius:8, padding:"6px 0", minHeight:36,
                        border: occupied ? "none" : selected ? "2px solid #0d47a1" : "2px solid #1565C0",
                        background: occupied ? "#ddd" : selected ? "#1565C0" : "white",
                        color: occupied ? "#aaa" : selected ? "white" : "#111",
                        fontSize:"12px", fontWeight:"700", cursor: occupied?"not-allowed":"pointer",
                      }}>
                      {id}
                    </button>
                  );
                })}
              </div>
            ))}

            {currentCar.tag === "유아동반석" && (
              <div style={{ margin:"8px 0", borderRadius:10, background:"#f0f0f0", padding:"8px 12px",
                fontSize:"12px", color:"#666", lineHeight:1.5 }}>
                유아동반 고객을 배려하기 위한 객실입니다.
              </div>
            )}
          </div>

          {/* ── 선택 완료 버튼 (항상 하단 고정) ── */}
          <div style={{ padding:"12px 16px 20px", background:"white", borderTop:"1px solid #ececec", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontSize:"13px", color:"#666" }}>
                {form.passengers}명 선택 {selectedSeats.length > 0 && `(${selectedSeats.join(", ")})`}
              </span>
              <span style={{ fontWeight:"800", fontSize:"17px", color:"#123c69" }}>
                {totalPrice.toLocaleString()}원
              </span>
            </div>
            <button
              onClick={() => setStep(4)}
              disabled={!canProceedToPayment}
              style={{
                width:"100%", borderRadius:14, padding:"14px 0",
                fontWeight:"700", fontSize:"16px", border:"none", cursor:"pointer",
                background: canProceedToPayment ? "#123c69" : "#ddd",
                color: canProceedToPayment ? "white" : "#aaa",
              }}>
              선택 완료
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          STEP 4: 결제 — BusPage 스타일
          ════════════════════════════════════════════ */}
      {step === 4 && selectedTrain && (
        <>
          {/* 카드 결제 처리 화면 */}
          {paymentChannel === "card" && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:32, padding:"0 32px", background:"white" }}>
              {cardPhase === "swipe" ? (
                <>
                  <div style={{ fontSize:96, animation:"cardBounce .8s ease-in-out infinite alternate" }}>💳</div>
                  <p style={{ fontSize:18, fontWeight:"600", color:"#555", textAlign:"center" }}>카드를 인식하는 중입니다…</p>
                </>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, textAlign:"center" }}>
                  <div style={{ width:88, height:88, borderRadius:"50%", background:PURPLE_LIGHT,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <CreditCard size={44} style={{ color:PURPLE }}/>
                  </div>
                  <div>
                    <p style={{ fontWeight:"700", fontSize:20, color:"#111", marginBottom:8 }}>연습용 키오스크입니다.</p>
                    <p style={{ fontSize:15, color:"#888" }}>실제 결제가 되지 않습니다.</p>
                  </div>
                </div>
              )}
              <style>{`@keyframes cardBounce{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-18px) rotate(6deg)}}`}</style>
            </div>
          )}

          {/* 간편결제 — 브랜드 선택 */}
          {paymentChannel === "simple" && easyPhase === "select" && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"20px 16px", gap:16, overflowY:"auto" }}>
              {/* 요약 카드 */}
              <div style={{ background:"white", borderRadius:16, padding:16,
                border:"1px solid #e8e8e8", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                <p style={{ fontWeight:"700", fontSize:16, color:"#111", marginBottom:12, paddingBottom:10,
                  borderBottom:"1px solid #f0f0f0" }}>결제 정보</p>
                {[
                  { label:"노선",    value:`${form.departure} → ${form.arrival}` },
                  { label:"날짜",    value:form.travelDate },
                  { label:"열차",    value:selectedTrain.number },
                  { label:"좌석",    value:`${currentCar.car}호차 ${selectedSeats.join(", ")}` },
                  { label:"인원",    value:`${form.passengers}명` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:13, color:"#aaa" }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:"600", color:"#333", textAlign:"right", maxWidth:"60%" }}>{value}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #f0f0f0",
                  paddingTop:10, marginTop:4 }}>
                  <span style={{ fontWeight:"700", fontSize:15, color:"#111" }}>총 결제 금액</span>
                  <span style={{ fontWeight:"900", fontSize:20, color:PURPLE }}>{totalPrice.toLocaleString()}원</span>
                </div>
              </div>

              <p style={{ textAlign:"center", fontSize:14, color:"#555", fontWeight:"600" }}>
                사용하실 간편결제를 선택해주세요
              </p>

              {EASY_PAY_OPTIONS.map(opt => (
                <button key={opt.id}
                  onClick={() => { setEasyBrand(opt); setEasyPhase("processing"); }}
                  style={{
                    width:"100%", borderRadius:16, padding:"24px 0",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background:opt.color, border:"none", cursor:"pointer",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
                  }}>
                  <span style={{ fontWeight:"700", fontSize:22, color:opt.textColor }}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 간편결제 — 처리 중 + 면책 문구 */}
          {paymentChannel === "simple" && easyPhase === "processing" && easyBrand && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", gap:32, padding:"0 32px", background:"white" }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontWeight:"700", fontSize:22, color:"#111", marginBottom:8 }}>{easyBrand.label}</p>
                <p style={{ fontWeight:"700", fontSize:20, color:"#111", marginBottom:8 }}>연습용 키오스크입니다.</p>
                <p style={{ fontSize:15, color:"#888" }}>실제 결제가 되지 않습니다.</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:10, height:10, borderRadius:"50%", background:easyBrand.color,
                    animation:`dp 1s ${i*.2}s ease-in-out infinite`,
                  }}/>
                ))}
              </div>
              <style>{`@keyframes dp{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
            </div>
          )}

          {/* 결제 수단 선택 (paymentChannel === null) */}
          {!paymentChannel && (
            <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
              {/* 요약 카드 */}
              <div style={{ background:"white", borderRadius:16, padding:16, marginBottom:16,
                border:"1px solid #e8e8e8", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                <p style={{ fontWeight:"700", fontSize:16, color:"#111", marginBottom:12, paddingBottom:10,
                  borderBottom:"1px solid #f0f0f0" }}>결제 정보 확인</p>
                {[
                  { label:"노선",    value:`${form.departure} → ${form.arrival}` },
                  { label:"날짜",    value:form.travelDate },
                  { label:"열차",    value:selectedTrain.number },
                  { label:"좌석",    value:`${currentCar.car}호차 ${selectedSeats.join(", ")}` },
                  { label:"인원",    value:`${form.passengers}명` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:13, color:"#aaa" }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:"600", color:"#333", textAlign:"right", maxWidth:"60%" }}>{value}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #f0f0f0",
                  paddingTop:10, marginTop:4 }}>
                  <span style={{ fontWeight:"700", fontSize:15, color:"#111" }}>총 결제 금액</span>
                  <span style={{ fontWeight:"900", fontSize:20, color:"#1565C0" }}>{totalPrice.toLocaleString()}원</span>
                </div>
              </div>

              <p style={{ textAlign:"center", fontSize:14, color:"#555", fontWeight:"600", marginBottom:12 }}>
                결제 방법을 선택하세요
              </p>

              {/* 카드 결제 */}
              <button
                onClick={() => setPaymentChannel("card")}
                style={{ width:"100%", borderRadius:16, padding:"32px 0",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:12,
                  background:"#123c69", border:"none", cursor:"pointer",
                  boxShadow:"0 4px 12px rgba(18,60,105,0.3)" }}>
                <CreditCard size={44} style={{ color:"white" }}/>
                <span style={{ color:"white", fontWeight:"700", fontSize:20 }}>카드 결제</span>
              </button>

              {/* 간편 결제 */}
              <button
                onClick={() => { setPaymentChannel("simple"); setEasyPhase("select"); setEasyBrand(null); }}
                style={{ width:"100%", borderRadius:16, padding:"32px 0",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:12,
                  background:PURPLE_LIGHT, border:`2px solid ${PURPLE}`, cursor:"pointer",
                  boxShadow:"0 2px 8px rgba(124,58,237,0.15)" }}>
                <Smartphone size={44} style={{ color:PURPLE }}/>
                <span style={{ color:PURPLE, fontWeight:"700", fontSize:20 }}>간편 결제</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════
          STEP 1, 2, 5 — 일반 스크롤 레이아웃
          ════════════════════════════════════════════ */}
      {(step === 1 || step === 2 || step === 5) && (
        <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>

          {/* STEP 1 — 여정 입력 */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {/* 출발역 */}
                <div style={{ background:"white", border:"1px solid #e0eeff", borderRadius:16, padding:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, color:"#1565C0" }}>
                    <MapPinned size={14}/><label style={{ fontSize:13, fontWeight:"700" }}>출발역</label>
                  </div>
                  <select value={form.departure} onChange={e => setForm(p => ({ ...p, departure:e.target.value }))}
                    style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"6px 8px",
                      fontSize:14, background:"#fafafa" }}>
                    {stationOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {/* 도착역 */}
                <div style={{ background:"white", border:"1px solid #e0eeff", borderRadius:16, padding:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, color:"#1565C0" }}>
                    <Train size={14}/><label style={{ fontSize:13, fontWeight:"700" }}>도착역</label>
                  </div>
                  <select value={form.arrival} onChange={e => setForm(p => ({ ...p, arrival:e.target.value }))}
                    style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"6px 8px",
                      fontSize:14, background:"#fafafa" }}>
                    {stationOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {/* 날짜 */}
                <div style={{ background:"white", border:"1px solid #e8e8e8", borderRadius:16, padding:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, color:"#555" }}>
                    <CalendarDays size={14}/><label style={{ fontSize:13, fontWeight:"700" }}>가는 날</label>
                  </div>
                  <input type="date" min={today} value={form.travelDate}
                    onChange={e => setForm(p => ({ ...p, travelDate:e.target.value }))}
                    style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"6px 8px", fontSize:13 }}/>
                </div>
                {/* 인원 */}
                <div style={{ background:"white", border:"1px solid #e8e8e8", borderRadius:16, padding:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, color:"#555" }}>
                    <Users size={14}/><label style={{ fontSize:13, fontWeight:"700" }}>인원</label>
                  </div>
                  <select value={form.passengers} onChange={e => setForm(p => ({ ...p, passengers:Number(e.target.value) }))}
                    style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"6px 8px", fontSize:14 }}>
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n}명</option>)}
                  </select>
                </div>
              </div>

              <div style={{ borderRadius:16, padding:16,
                background:"linear-gradient(135deg,#08335f 0%,#115f9d 55%,#2ca2d7 100%)", color:"white" }}>
                <p style={{ fontWeight:"700", fontSize:14, margin:"0 0 12px" }}>
                  {form.departure}에서 {form.arrival}까지
                </p>
                <button
                  onClick={() => {
                    if (form.departure === form.arrival || !form.travelDate || form.passengers < 1) {
                      alert("출발역, 도착역, 가는 날, 인원을 확인해 주세요.");
                      return;
                    }
                    setStep(2);
                  }}
                  style={{ width:"100%", background:"white", color:"#1565C0", borderRadius:12,
                    padding:"12px 0", fontSize:16, fontWeight:"800", border:"none", cursor:"pointer" }}>
                  열차 조회
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — 열차 선택 */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ background:"#e8f4ff", border:"1px solid #c0deff", borderRadius:12, padding:10 }}>
                <p style={{ fontSize:13, fontWeight:"700", color:"#1a1a1a", margin:0 }}>
                  {form.departure} → {form.arrival} / {form.travelDate} / {form.passengers}명
                </p>
              </div>
              {filteredSchedules.map(train => (
                <button key={train.id}
                  onClick={() => { setSelectedTrain(train); setSelectedSeats([]); setCarIndex(CAR_CONFIGS.findIndex(c=>c.car===8)); setStep(3); }}
                  style={{ width:"100%", textAlign:"left", background:"white", border:"1px solid #e0e0e0",
                    borderRadius:16, padding:12, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ background:"#e3f0ff", borderRadius:10, padding:"6px 8px", textAlign:"center", minWidth:56 }}>
                        <p style={{ fontSize:10, fontWeight:"700", color:"#1565C0", margin:0 }}>열차</p>
                        <p style={{ fontSize:13, fontWeight:"800", color:"#1565C0", margin:0 }}>
                          {train.number.replace("KTX-","").replace("KTX ","")}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontWeight:"800", fontSize:14, color:"#111", margin:0 }}>{train.number}</p>
                        <p style={{ fontSize:12, color:"#666", margin:0 }}>{train.departureTime} → {train.arrivalTime}</p>
                        <p style={{ fontSize:11, color:"#aaa", margin:0 }}>{train.duration}</p>
                      </div>
                    </div>
                    <p style={{ fontWeight:"800", fontSize:15, color:"#1565C0", flexShrink:0 }}>
                      {train.price.toLocaleString()}원
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 5 — 예매 완료 */}
          {step === 5 && selectedTrain && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ background:"#ecfdf5", border:"1px solid #a7f3d0", borderRadius:16, padding:16 }}>
                <p style={{ fontSize:17, fontWeight:"800", color:"#065f46", margin:"0 0 4px" }}>✅ 예매 완료</p>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.5, margin:0 }}>
                  결제가 완료되었어요. 아래에서 발권된 승차권을 확인해 주세요.
                </p>
              </div>

              <div style={{ background:"white", borderRadius:16, border:"1px solid #e0eeff",
                boxShadow:"0 2px 8px rgba(0,0,0,0.08)", overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(135deg,#0b5cab 0%,#1784d8 58%,#44b3e8 100%)",
                  padding:"12px 16px", color:"white" }}>
                  <p style={{ fontSize:13, fontWeight:"700", margin:0 }}>모바일 승차권</p>
                  <p style={{ fontSize:20, fontWeight:"800", margin:"2px 0 0" }}>{selectedTrain.number}</p>
                </div>

                <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"출발", station:form.departure, time:selectedTrain.departureTime },
                      { label:"도착", station:form.arrival,   time:selectedTrain.arrivalTime },
                    ].map(({ label, station, time }) => (
                      <div key={label} style={{ background:"#f8f8f8", borderRadius:12, padding:12 }}>
                        <p style={{ fontSize:12, fontWeight:"700", color:"#aaa", margin:"0 0 4px" }}>{label}</p>
                        <p style={{ fontSize:18, fontWeight:"800", color:"#111", margin:"0 0 2px" }}>{station}</p>
                        <p style={{ fontSize:13, color:"#888", margin:0 }}>{time}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ border:"1.5px dashed #c0deff", borderRadius:12, padding:12,
                    display:"flex", flexDirection:"column", gap:6, fontSize:13 }}>
                    {[
                      { k:"탑승일",     v:form.travelDate },
                      { k:"소요시간",   v:selectedTrain.duration },
                      { k:"좌석",       v:`${currentCar.car}호차 ${selectedSeats.join(", ")}` },
                      { k:"인원",       v:`${form.passengers}명` },
                      { k:"결제금액",   v:`${totalPrice.toLocaleString()}원` },
                      { k:"승차권번호", v:`KR-${selectedTrain.departureTime.replace(":","")}-${currentCar.car}${selectedSeats[0]??"A1"}` },
                    ].map(({ k, v }) => (
                      <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                        <strong style={{ color:"#555" }}>{k}</strong>
                        <span style={{ color:"#333", textAlign:"right", maxWidth:"65%" }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    background:"#fff9e0", border:"1px solid #fcd34d", borderRadius:10, padding:"10px 12px" }}>
                    <span style={{ fontSize:12, color:"#92400e", fontWeight:"600" }}>
                      연습용 키오스크입니다. 실제 발권이 되지 않습니다.
                    </span>
                  </div>

                  <button onClick={() => navigate("/")}
                    style={{ width:"100%", borderRadius:12, padding:"14px 0", background:"#123c69",
                      color:"white", fontWeight:"700", fontSize:15, border:"none", cursor:"pointer" }}>
                    홈으로 돌아가기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

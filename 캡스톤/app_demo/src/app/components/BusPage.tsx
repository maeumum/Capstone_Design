import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Check,
  RefreshCw, Star, Info, CreditCard, Smartphone, X as XIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
type Screen =
  | "dep_search" | "arr_search"
  | "date_select"
  | "results"       // 출발편 or 귀가편 배차 조회
  | "seat_select"   // 출발편 or 귀가편 좌석 선택
  | "booking_summary"
  | "payment" | "card_processing" | "easy_select" | "easy_processing"
  | "complete";

type BusType = "고속" | "고시" | "시외";
type Grade   = "일반" | "우등" | "프리미엄";
type PassengerType = "일반" | "초등생" | "보훈";
interface Terminal { name: string; type: BusType; region: string; }
interface BusTrip {
  id: string; company: string; departureTime: string; duration: string;
  originalPrice: number; price: number; discount: number;
  seatsLeft: number; grade: Grade;
}
interface SelectedSeat { seatNum: number; type: PassengerType; }

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const PURPLE = "#7B2FE8";
const PURPLE_LIGHT = "#F3EEFF";
const BADGE_BG: Record<BusType, string> = { 고속:"#1A3DA8", 고시:"#1A6094", 시외:"#2B7A45" };
const GRADE_COLOR: Record<Grade, string> = { 일반:"#888", 우등:PURPLE, 프리미엄:"#D6336C" };
const TERMINALS: Terminal[] = [
  { name:"서울경부",        type:"고속", region:"서울" },
  { name:"센트럴시티(서울)", type:"고속", region:"서울" },
  { name:"동서울",          type:"고시", region:"서울" },
  { name:"서울남부",        type:"시외", region:"서울" },
  { name:"인천",            type:"고시", region:"인천/경기" },
  { name:"수원",            type:"고시", region:"인천/경기" },
  { name:"성남종합",        type:"고시", region:"인천/경기" },
  { name:"대전복합",        type:"고시", region:"대전/충남" },
  { name:"천안",            type:"시외", region:"대전/충남" },
  { name:"광주(유·스퀘어)", type:"고시", region:"광주/전남" },
  { name:"전주고속터미널",  type:"고속", region:"전북" },
  { name:"군산",            type:"시외", region:"전북" },
  { name:"부산",            type:"고속", region:"부산/경남" },
  { name:"창원종합",        type:"고시", region:"부산/경남" },
  { name:"동대구",          type:"고시", region:"대구/경북" },
  { name:"포항",            type:"시외", region:"대구/경북" },
];
const REGIONS   = ["전체","서울","인천/경기","대전/충남","광주/전남","전북","부산/경남","대구/경북"];
const COMPANIES = ["동양고속","금호고속","천일고속","삼화고속"];
const BASE_TIMES = [
  "05:00","05:20","05:40","06:00","06:30","07:00","07:30","08:05",
  "08:40","09:20","10:00","10:45","11:30","12:10","13:00","14:00",
  "15:00","16:00","17:00","18:00","19:00","20:00","21:00","21:30",
];
const TIME_CHIPS     = ["전체","06시","09시","12시","15시","18시","21시"];
const DAYS_KO        = ["일","월","화","수","목","금","토"];
const TOTAL_SEATS    = 28;
const PASSENGER_TYPES: PassengerType[] = ["일반","초등생","보훈"];
const EASY_PAY_OPTIONS = [
  { id:"toss",  label:"토스페이",   color:"#0064FF", textColor:"#fff" },
  { id:"kakao", label:"카카오페이", color:"#FAE100", textColor:"#1A1A1A" },
  { id:"naver", label:"네이버페이", color:"#03C75A", textColor:"#fff" },
];

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function formatDisplay(iso:string){
  const [y,m,d]=iso.split("-").map(Number);
  const day=DAYS_KO[new Date(y,m-1,d).getDay()];
  return `${y}.${String(m).padStart(2,"0")}.${String(d).padStart(2,"0")} (${day})`;
}
function formatShort(iso:string){
  const [y,m,d]=iso.split("-").map(Number);
  const day=DAYS_KO[new Date(y,m-1,d).getDay()];
  return `${y}.${String(m).padStart(2,"0")}.${String(d).padStart(2,"0")}(${day})`;
}
function formatChip(iso:string){
  // "2026.05.19(화)" 형식
  const [y,m,d]=iso.split("-").map(Number);
  const day=DAYS_KO[new Date(y,m-1,d).getDay()];
  return `${y}.${String(m).padStart(2,"0")}.${String(d).padStart(2,"0")}(${day})`;
}
function hash(s:string){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
function buildTrips(dep:string,arr:string,date:string,tf:string):BusTrip[]{
  const h=hash(`${dep}|${arr}|${date}`);
  const grades:Grade[]=["일반","우등","프리미엄"];
  const base:Record<Grade,number>={일반:17000,우등:22000,프리미엄:28600};
  return BASE_TIMES
    .filter(t=>tf==="전체"||parseInt(t)>=parseInt(tf))
    .map((time,i)=>{
      const grade=grades[((h>>>i)+i)%3];
      const company=COMPANIES[((h>>>(i+2))+i*3)%COMPANIES.length];
      const seatsLeft=4+((h+i*7)%22);
      const hasDiscount=grade==="프리미엄"&&((h>>>(i+3))&1)===1;
      const orig=base[grade];
      return{id:`trip-${dep}-${arr}-${date}-${i}`,company,departureTime:time,duration:"2시간 35분",
        originalPrice:orig,price:hasDiscount?Math.round(orig*0.95/100)*100:orig,
        discount:hasDiscount?5:0,seatsLeft,grade};
    });
}
function buildOccupied(tripId:string):boolean[]{
  const h=hash(tripId);
  return Array.from({length:TOTAL_SEATS},(_,i)=>((h>>>(i%20))&1)===1);
}
function buildSeatRows():(number|null)[][]{
  const rows:(number|null)[][]=[];
  for(let s=1;s<=24;s+=3)rows.push([s,s+1,s+2]);
  rows.push([25,26,27,28]);
  return rows;
}

// ═══════════════════════════════════════════════════
// PURE COMPONENTS
// ═══════════════════════════════════════════════════
function TypeBadge({type,small}:{type:BusType;small?:boolean}){
  return <span className="inline-block rounded font-bold text-white"
    style={{background:BADGE_BG[type],fontSize:small?"10px":"11px",padding:small?"1px 5px":"2px 7px"}}>{type}</span>;
}

function MonthCalendar({year,month,selectedDate,minDate,onSelect,onNext,onPrev,canGoPrev}:{
  year:number;month:number;selectedDate:string;minDate:string;
  onSelect:(d:string)=>void;onNext:()=>void;onPrev:()=>void;canGoPrev:boolean;
}){
  const daysInMonth=new Date(year,month+1,0).getDate();
  const firstDow=new Date(year,month,1).getDay();
  const cells:(number|null)[]=[...Array(firstDow).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  return(
    <div className="px-4 pb-2">
      <div className="flex items-center py-3">
        <button onClick={onPrev} disabled={!canGoPrev}
          style={{opacity:canGoPrev?1:.25,background:"none",border:"none",cursor:canGoPrev?"pointer":"default",padding:4}}>
          <ChevronLeft size={20} className="text-gray-700"/>
        </button>
        <span className="flex-1 text-center font-bold text-gray-900" style={{fontSize:"18px"}}>
          {year}. {String(month+1).padStart(2,"0")}
        </span>
        <button onClick={onNext} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
          <ChevronRight size={20} className="text-gray-700"/>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_KO.map((d,i)=>(
          <div key={d} className="text-center py-1"
            style={{fontSize:"13px",fontWeight:"600",color:i===0?"#EF4444":i===6?"#3B82F6":"#999"}}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d,i)=>{
          if(d===null)return <div key={`e-${i}`}/>;
          const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const past=ds<minDate,sel=ds===selectedDate;
          const dow=(firstDow+d-1)%7;
          return(
            <button key={d} onClick={()=>!past&&onSelect(ds)} disabled={past}
              className="flex items-center justify-center py-0.5">
              <span className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{background:sel?PURPLE:"transparent",
                  color:sel?"#fff":past?"#ccc":dow===0?"#EF4444":dow===6?"#3B82F6":"#222",
                  fontWeight:sel?"700":"400",fontSize:"15px"}}>{d}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardProcessingScreen({onDone}:{onDone:()=>void}){
  const [phase,setPhase]=useState<"swipe"|"notice">("swipe");
  useEffect(()=>{const t1=setTimeout(()=>setPhase("notice"),1600);const t2=setTimeout(()=>onDone(),3200);return()=>{clearTimeout(t1);clearTimeout(t2);};},[onDone]);
  return(
    <div className="min-h-svh bg-white flex flex-col items-center justify-center gap-8 px-8">
      {phase==="swipe"?(<>
        <div style={{animation:"cardBounce .8s ease-in-out infinite alternate",fontSize:"96px"}}>💳</div>
        <p className="text-gray-500 font-semibold text-center" style={{fontSize:"18px"}}>카드를 인식하는 중입니다…</p>
      </>):(
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-full w-24 h-24 flex items-center justify-center" style={{background:PURPLE_LIGHT}}>
            <CreditCard size={48} style={{color:PURPLE}}/>
          </div>
          <p className="font-bold text-gray-800" style={{fontSize:"20px"}}>연습용 키오스크입니다.</p>
          <p className="text-gray-500" style={{fontSize:"15px"}}>실제 결제가 되지 않습니다.</p>
        </div>
      )}
      <style>{`@keyframes cardBounce{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-18px) rotate(6deg)}}`}</style>
    </div>
  );
}

function EasyProcessingScreen({provider,onDone}:{provider:typeof EASY_PAY_OPTIONS[number];onDone:()=>void}){
  useEffect(()=>{const t=setTimeout(()=>onDone(),2400);return()=>clearTimeout(t);},[onDone]);
  return(
    <div className="min-h-svh bg-white flex flex-col items-center justify-center gap-8 px-8">
      <div className="text-center space-y-2">
        <p className="font-bold text-gray-800" style={{fontSize:"22px"}}>{provider.label}</p>
        <p className="font-bold text-gray-800" style={{fontSize:"20px"}}>연습용 키오스크입니다.</p>
        <p className="text-gray-500" style={{fontSize:"15px"}}>실제 결제가 되지 않습니다.</p>
      </div>
      <div className="flex gap-2">
        {[0,1,2].map(i=>(<div key={i} className="w-2.5 h-2.5 rounded-full"
          style={{background:provider.color,animation:`dp 1s ${i*.2}s ease-in-out infinite`}}/>))}
      </div>
      <style>{`@keyframes dp{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function BusPage(){
  const navigate=useNavigate();
  const today=new Date().toISOString().split("T")[0];
  const now=new Date();
  const todayYear=now.getFullYear();
  const todayMonth=now.getMonth();

  // ── 화면 ─────────────────────────────────────────
  const [screen,setScreen]=useState<Screen>("dep_search");
  const [departure,setDeparture]=useState("");
  const [arrival,setArrival]=useState("");
  const [selectedEasyPay,setSelectedEasyPay]=useState<typeof EASY_PAY_OPTIONS[number]|null>(null);
  const [bookingNum]=useState(()=>Math.floor(Math.random()*900000+100000));

  // ── 왕복 / 편도 ───────────────────────────────────
  const [isRoundTrip,setIsRoundTrip]=useState(false);
  const [bookingPhase,setBookingPhase]=useState<"outbound"|"return">("outbound");
  // 날짜
  const [travelDate,setTravelDate]=useState(today);   // 가는 날
  const [returnDate,setReturnDate]=useState(today);   // 오는 날
  const [calendarTarget,setCalendarTarget]=useState<"outbound"|"return">("outbound"); // 달력이 편집 중인 날
  const [calYear,setCalYear]=useState(todayYear);
  const [calMonth,setCalMonth]=useState(todayMonth);
  // 시간 필터
  const [timeFilter,setTimeFilter]=useState("전체");       // 출발편 필터
  const [returnTimeFilter,setReturnTimeFilter]=useState("전체"); // 귀가편 필터

  // ── 출발편 ────────────────────────────────────────
  const [selectedTrip,setSelectedTrip]=useState<BusTrip|null>(null);
  const [selectedSeats,setSelectedSeats]=useState<SelectedSeat[]>([]);
  const [focusedSeatNum,setFocusedSeatNum]=useState<number|null>(null);
  const [activeType,setActiveType]=useState<PassengerType>("일반");

  // ── 귀가편 ────────────────────────────────────────
  const [returnTrip,setReturnTrip]=useState<BusTrip|null>(null);
  const [returnSeats,setReturnSeats]=useState<SelectedSeat[]>([]);
  const [returnFocused,setReturnFocused]=useState<number|null>(null);
  const [returnActiveType,setReturnActiveType]=useState<PassengerType>("일반");

  // ── Terminal Search ───────────────────────────────
  const [region,setRegion]=useState("전체");
  const [busTypeFilter,setBusTypeFilter]=useState<"전체"|BusType>("전체");

  // ── Derived (phase-aware) ─────────────────────────
  const isReturn=bookingPhase==="return";

  const depTerminal=useMemo(()=>TERMINALS.find(t=>t.name===departure),[departure]);
  const arrTerminal=useMemo(()=>TERMINALS.find(t=>t.name===arrival),[arrival]);

  // results 화면에서 쓸 변수들 (phase-aware)
  const resultDep   = isReturn ? arrival    : departure;
  const resultArr   = isReturn ? departure  : arrival;
  const resultDate  = isReturn ? returnDate : travelDate;
  const resultFilter= isReturn ? returnTimeFilter : timeFilter;
  const resultDepTerm= isReturn ? arrTerminal : depTerminal;
  const resultArrTerm= isReturn ? depTerminal : arrTerminal;

  const trips=useMemo(()=>buildTrips(resultDep,resultArr,resultDate,resultFilter),
    [resultDep,resultArr,resultDate,resultFilter]);

  // seat_select 에서 쓸 변수들
  const activeTrip    = isReturn ? returnTrip    : selectedTrip;
  const activeSeats   = isReturn ? returnSeats   : selectedSeats;
  const activeFocused = isReturn ? returnFocused : focusedSeatNum;
  const activePType   = isReturn ? returnActiveType : activeType;

  const seatOccupied=useMemo(()=>activeTrip?buildOccupied(activeTrip.id):Array(TOTAL_SEATS).fill(false),[activeTrip]);
  const seatRows=useMemo(()=>buildSeatRows(),[]);
  const occupiedCount=seatOccupied.filter(Boolean).length;
  const remainingSeats=TOTAL_SEATS-occupiedCount;

  const payDeadline=`${formatShort(today)} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  // 요금 계산
  function unitPricesFor(trip:BusTrip|null):Record<PassengerType,number>{
    return trip?{일반:trip.price,초등생:Math.floor(trip.price*.5),보훈:Math.floor(trip.price*.5)}:{일반:0,초등생:0,보훈:0};
  }
  const outboundUnitPrices=useMemo(()=>unitPricesFor(selectedTrip),[selectedTrip]);
  const returnUnitPrices  =useMemo(()=>unitPricesFor(returnTrip),[returnTrip]);
  const outboundTotal=selectedSeats.reduce((s,x)=>s+outboundUnitPrices[x.type],0);
  const returnTotal  =returnSeats.reduce((s,x)=>s+returnUnitPrices[x.type],0);
  const grandTotal   =outboundTotal+(isRoundTrip?returnTotal:0);

  // 현재 phase 총액 (seat_select 하단 표시용)
  const activeTotal=activeSeats.reduce((s,x)=>s+(isReturn?returnUnitPrices[x.type]:outboundUnitPrices[x.type]),0);

  function seatBreakdownFor(seats:SelectedSeat[]){
    const counts:Partial<Record<PassengerType,number>>={};
    for(const s of seats)counts[s.type]=(counts[s.type]??0)+1;
    return PASSENGER_TYPES.filter(pt=>counts[pt]).map(pt=>`${pt} ${counts[pt]}`).join(" / ");
  }

  // ── Calendar helpers ───────────────────────────────
  function advanceMonth(){if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1);}
  function retreatMonth(){
    if(calYear===todayYear&&calMonth===todayMonth)return;
    if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1);
  }
  const canGoPrevMonth=!(calYear===todayYear&&calMonth===todayMonth);

  function handleCalendarSelect(ds:string){
    if(calendarTarget==="outbound"){
      setTravelDate(ds);
      if(returnDate<ds)setReturnDate(ds);
    }else{
      setReturnDate(ds);
    }
  }

  // ── Seat logic (phase-aware) ───────────────────────
  function handleSeatTap(sn:number){
    if(seatOccupied[sn-1])return;
    const setSeats=isReturn?setReturnSeats:setSelectedSeats;
    const setFocus=isReturn?setReturnFocused:setFocusedSeatNum;
    const seats=activeSeats;
    const existing=seats.find(s=>s.seatNum===sn);
    if(existing){
      if(activeFocused===sn){setSeats(prev=>prev.filter(s=>s.seatNum!==sn));setFocus(null);}
      else setFocus(sn);
    }else{
      setSeats(prev=>[...prev,{seatNum:sn,type:activePType}]);
      setFocus(sn);
    }
  }
  function handleTypeTap(type:PassengerType){
    if(isReturn){
      setReturnActiveType(type);
      if(returnFocused!==null)setReturnSeats(prev=>prev.map(s=>s.seatNum===returnFocused?{...s,type}:s));
    }else{
      setActiveType(type);
      if(focusedSeatNum!==null)setSelectedSeats(prev=>prev.map(s=>s.seatNum===focusedSeatNum?{...s,type}:s));
    }
  }

  function handleSeatDone(){
    if(isRoundTrip&&!isReturn){
      // 출발편 완료 → 귀가편 배차 조회로
      setBookingPhase("return");
      setReturnSeats([]);setReturnFocused(null);setReturnActiveType("일반");
      setScreen("results");
    }else{
      setScreen("booking_summary");
    }
  }

  function shiftResultDate(delta:number){
    const cur=isReturn?returnDate:travelDate;
    const d=new Date(cur);d.setDate(d.getDate()+delta);
    const minD=isReturn?travelDate:today;
    if(d>=new Date(minD)){
      const ns=d.toISOString().split("T")[0];
      if(isReturn)setReturnDate(ns);else setTravelDate(ns);
    }
  }

  function swapTerminals(){const tmp=departure;setDeparture(arrival);setArrival(tmp);}

  function resetAll(){
    setSelectedTrip(null);setSelectedSeats([]);setFocusedSeatNum(null);setActiveType("일반");
    setReturnTrip(null);setReturnSeats([]);setReturnFocused(null);setReturnActiveType("일반");
    setBookingPhase("outbound");setSelectedEasyPay(null);setScreen("results");
  }

  function filteredTerminals(excludeName:string){
    return TERMINALS.filter(t=>{
      if(t.name===excludeName)return false;
      if(region!=="전체"&&t.region!==region)return false;
      if(busTypeFilter!=="전체"&&t.type!==busTypeFilter)return false;
      return true;
    });
  }

  // ── Route Bar ─────────────────────────────────────
  function RouteBar({canSwap,showStar}:{canSwap?:boolean;showStar?:boolean}){
    return(
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">출발</p>
          <p className={`font-bold leading-tight ${departure?"text-gray-900":"text-gray-400"}`} style={{fontSize:"17px"}}>{departure||"출발지선택"}</p>
          {depTerminal&&<div className="mt-1"><TypeBadge type={depTerminal.type} small/></div>}
        </div>
        <button onClick={canSwap&&departure&&arrival?swapTerminals:undefined}
          className="mx-3 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0"
          style={{color:canSwap?"#555":"#ccc"}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M3 7l3-3M3 7l3 3M17 13H3M17 13l-3-3M17 13l-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-xs text-gray-400 mb-0.5">도착</p>
          <p className={`font-bold leading-tight ${arrival?"text-gray-900":"text-gray-400"}`} style={{fontSize:"17px"}}>{arrival||"도착지선택"}</p>
          {arrTerminal&&<div className="mt-1 flex justify-end"><TypeBadge type={arrTerminal.type} small/></div>}
        </div>
        {showStar&&<button className="ml-3 flex-shrink-0"><Star size={20} className="text-gray-300"/></button>}
      </div>
    );
  }

  // ── Terminal Search ────────────────────────────────
  function renderTerminalSearch(mode:"dep"|"arr"){
    const list=filteredTerminals(mode==="dep"?arrival:departure);
    return(
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={()=>mode==="dep"?navigate("/"):setScreen("dep_search")} className="text-gray-700 mr-3"><ArrowLeft size={24}/></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{fontSize:"18px"}}>{mode==="dep"?"출발지 검색":"도착지 검색"}</h1>
          <div style={{width:24}}/>
        </div>
        <RouteBar canSwap={!!(departure&&arrival)}/>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 flex-shrink-0">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-gray-400" style={{fontSize:"14px"}}>터미널, 지역명 검색/최근 검색/즐겨찾기</span>
          </div>
        </div>
        <div className="flex items-center gap-6 px-4 py-2 border-b border-gray-100 bg-gray-50">
          {(["전체","고속","시외"] as const).map(bt=>{
            const active=busTypeFilter===bt;
            return(
              <button key={bt} onClick={()=>setBusTypeFilter(bt as "전체"|BusType)} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{borderColor:active?PURPLE:"#bbb",background:active?PURPLE:"white"}}>
                  {active&&<span className="w-2 h-2 rounded-full bg-white block"/>}
                </span>
                <span className="font-medium text-gray-700" style={{fontSize:"14px"}}>{bt}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-[90px] flex-shrink-0 bg-gray-50 border-r border-gray-100 overflow-y-auto">
            {REGIONS.map(r=>(
              <button key={r} onClick={()=>setRegion(r)} className="w-full text-left px-3 py-3.5 border-b border-gray-100"
                style={{fontSize:"13px",fontWeight:region===r?"700":"500",color:region===r?PURPLE:"#555",
                  borderLeft:`3px solid ${region===r?PURPLE:"transparent"}`,background:region===r?"white":"transparent"}}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
              <span className="text-xs text-gray-400 font-semibold">TOP {list.length}</span>
            </div>
            {list.map(terminal=>(
              <button key={terminal.name}
                onClick={()=>{
                  if(mode==="dep"){setDeparture(terminal.name);setRegion("전체");setBusTypeFilter("전체");setScreen("arr_search");}
                  else{setArrival(terminal.name);setRegion("전체");setBusTypeFilter("전체");setScreen("date_select");}
                }}
                className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50 text-left">
                <div className="flex items-center gap-3"><TypeBadge type={terminal.type}/><span className="font-medium text-gray-800" style={{fontSize:"15px"}}>{terminal.name}</span></div>
                <Info size={16} className="text-gray-300 flex-shrink-0"/>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // SCREEN ROUTING
  // ═══════════════════════════════════════════════════════

  if(screen==="dep_search")return renderTerminalSearch("dep");
  if(screen==="arr_search")return renderTerminalSearch("arr");

  // ── 일정 선택 ────────────────────────────────────────
  if(screen==="date_select"){
    const activeDate=calendarTarget==="outbound"?travelDate:returnDate;
    const activeCalFilter=calendarTarget==="outbound"?timeFilter:returnTimeFilter;
    const calMinDate=calendarTarget==="outbound"?today:travelDate;
    const [y,m,d]=travelDate.split("-").map(Number);
    const travelDay=DAYS_KO[new Date(y,m-1,d).getDay()];

    return(
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={()=>setScreen("arr_search")} className="text-gray-700 mr-3"><ArrowLeft size={24}/></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{fontSize:"18px"}}>일정 선택</h1>
          <div style={{width:24}}/>
        </div>
        <RouteBar canSwap showStar/>

        {/* 왕복 토글 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-800" style={{fontSize:"15px"}}>
            {isRoundTrip?"오는 날 선택":"가는 날 선택"}
          </span>
          <button
            onClick={()=>{
              setIsRoundTrip(r=>{
                if(!r){setCalendarTarget("outbound");setReturnDate(travelDate);}
                return!r;
              });
            }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{borderColor:isRoundTrip?PURPLE:"#bbb",background:isRoundTrip?PURPLE:"white"}}>
              {isRoundTrip&&<Check size={11} strokeWidth={3} className="text-white"/>}
            </div>
            <span className="font-medium text-gray-700" style={{fontSize:"14px"}}>왕복</span>
          </button>
        </div>

        {/* 날짜 탭 (왕복일 때 가는날/오는날 두 탭) */}
        {isRoundTrip?(
          <div className="flex border-b border-gray-100">
            {(["outbound","return"] as const).map(target=>{
              const dateStr=target==="outbound"?travelDate:returnDate;
              const label=target==="outbound"?"가는 날":"오는 날";
              const isActive=calendarTarget===target;
              return(
                <button key={target} onClick={()=>setCalendarTarget(target)}
                  className="flex-1 py-3 flex flex-col items-center gap-0.5"
                  style={{borderBottom:isActive?`2px solid ${PURPLE}`:"2px solid transparent"}}>
                  <span className="font-bold" style={{fontSize:"15px",color:isActive?PURPLE:"#888"}}>
                    {formatChip(dateStr)}
                  </span>
                  <span style={{fontSize:"12px",color:isActive?PURPLE:"#aaa"}}>{label}</span>
                </button>
              );
            })}
          </div>
        ):(
          <div className="text-center py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900" style={{fontSize:"18px"}}>
              {`${y}.${String(m).padStart(2,"0")}.${String(d).padStart(2,"0")}(${travelDay})`}
            </p>
            <p className="text-sm mt-0.5" style={{color:PURPLE}}>가는 날</p>
            <div className="mt-1 mx-auto rounded-full h-0.5 w-16" style={{background:PURPLE}}/>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <MonthCalendar
            year={calYear} month={calMonth}
            selectedDate={activeDate} minDate={calMinDate}
            onSelect={handleCalendarSelect}
            onNext={advanceMonth} onPrev={retreatMonth} canGoPrev={canGoPrevMonth}
          />
          {/* 시간 필터 */}
          <div className="px-4 pb-4">
            <p className="text-sm font-semibold text-gray-500 mb-3">출발 시간대</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TIME_CHIPS.map(chip=>{
                const active=activeCalFilter===chip;
                return(
                  <button key={chip}
                    onClick={()=>calendarTarget==="outbound"?setTimeFilter(chip):setReturnTimeFilter(chip)}
                    className="flex-shrink-0 rounded-full px-4 py-2 font-semibold border"
                    style={{fontSize:"14px",background:active?PURPLE:"white",color:active?"#fff":"#555",borderColor:active?PURPLE:"#ddd"}}>
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={()=>{setBookingPhase("outbound");setScreen("results");}}
            className="w-full rounded-2xl py-4 font-bold text-white"
            style={{background:"#111",fontSize:"18px"}}>
            {isRoundTrip?"왕복 조회":"편도 조회"}
          </button>
        </div>
      </div>
    );
  }

  // ── 배차 조회 (출발편 or 귀가편) ───────────────────────
  if(screen==="results"){
    const headerTitle=isReturn?"귀가편 배차 조회":"배차 조회";
    return(
      <div style={{height:"100svh",display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>
        {/* 헤더 */}
        <div style={{display:"flex",alignItems:"center",padding:"16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <button onClick={()=>{
            if(isReturn){setBookingPhase("outbound");setScreen("seat_select");}
            else setScreen("date_select");
          }} style={{color:"#333",marginRight:12,background:"none",border:"none",cursor:"pointer"}}><ArrowLeft size={24}/></button>
          <h1 style={{flex:1,textAlign:"center",fontWeight:"700",fontSize:"18px",color:"#111"}}>{headerTitle}</h1>
          <Star size={20} style={{color:"#ddd"}}/>
        </div>

        {/* 왕복 진행 표시 */}
        {isRoundTrip&&(
          <div style={{display:"flex",alignItems:"center",padding:"8px 16px",background:isReturn?"#F3EEFF":"#f8f8f8",borderBottom:"1px solid #f0f0f0",flexShrink:0,gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:!isReturn?PURPLE:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {!isReturn?<Check size={11} color="white" strokeWidth={3}/>:<span style={{fontSize:10,color:"#999",fontWeight:"700"}}>1</span>}
              </div>
              <span style={{fontSize:12,fontWeight:isReturn?"400":"700",color:isReturn?"#aaa":PURPLE}}>출발편</span>
            </div>
            <div style={{flex:1,height:1,background:"#ddd"}}/>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:isReturn?PURPLE:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:10,color:isReturn?"white":"#999",fontWeight:"700"}}>2</span>
              </div>
              <span style={{fontSize:12,fontWeight:isReturn?"700":"400",color:isReturn?PURPLE:"#aaa"}}>귀가편</span>
            </div>
          </div>
        )}

        {/* 노선 */}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <div>
            <p style={{fontSize:"11px",color:"#aaa",marginBottom:2}}>출발</p>
            <p style={{fontWeight:"700",fontSize:"16px",color:"#111"}}>{resultDep}</p>
            {resultDepTerm&&<div style={{marginTop:3}}><TypeBadge type={resultDepTerm.type} small/></div>}
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:"11px",color:"#aaa",marginBottom:2}}>도착</p>
            <p style={{fontWeight:"700",fontSize:"16px",color:"#111"}}>{resultArr}</p>
            {resultArrTerm&&<div style={{marginTop:3,display:"flex",justifyContent:"flex-end"}}><TypeBadge type={resultArrTerm.type} small/></div>}
          </div>
        </div>

        {/* 날짜 네비 */}
        <div style={{display:"flex",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <button onClick={()=>shiftResultDate(-1)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><ChevronLeft size={22} style={{color:"#555"}}/></button>
          <span style={{flex:1,textAlign:"center",fontWeight:"700",fontSize:"15px",color:"#111"}}>{formatShort(resultDate)}</span>
          <button onClick={()=>shiftResultDate(1)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><ChevronRight size={22} style={{color:"#555"}}/></button>
        </div>

        {/* 배차 목록 */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 16px 80px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {trips.map(trip=>(
              <button key={trip.id}
                onClick={()=>{
                  if(isReturn){setReturnTrip(trip);setReturnSeats([]);setReturnFocused(null);setReturnActiveType("일반");}
                  else{setSelectedTrip(trip);setSelectedSeats([]);setFocusedSeatNum(null);setActiveType("일반");}
                  setScreen("seat_select");
                }}
                style={{width:"100%",textAlign:"left",background:"white",border:"1px solid #e8e8e8",borderRadius:16,padding:16,cursor:"pointer",boxShadow:"0 1px 8px rgba(0,0,0,0.07)"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <TypeBadge type={resultDepTerm?.type??"고속"}/>
                      <span style={{fontSize:"13px",color:"#666",fontWeight:"500"}}>{trip.company}</span>
                    </div>
                    <p style={{fontWeight:"900",fontSize:"30px",lineHeight:1.1,color:"#111",margin:"0 0 2px"}}>{trip.departureTime}</p>
                    {trip.discount>0&&<p style={{fontSize:"13px",color:"#aaa",textDecoration:"line-through",margin:"0 0 1px"}}>{trip.originalPrice.toLocaleString()}원</p>}
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <p style={{fontWeight:"700",fontSize:"20px",color:"#111",margin:0}}>{trip.price.toLocaleString()}원</p>
                      {trip.discount>0&&<span style={{fontSize:"13px",color:"#E53E3E",fontWeight:"700"}}>↓{trip.discount}%</span>}
                    </div>
                    <p style={{fontSize:"12px",color:"#aaa",marginTop:2}}>{trip.duration} 예상</p>
                  </div>
                  <div style={{textAlign:"right",marginLeft:16,flexShrink:0}}>
                    <p style={{fontWeight:"900",fontSize:"28px",lineHeight:1,color:"#111",margin:"0 0 2px"}}>
                      {trip.seatsLeft}<span style={{fontWeight:"700",fontSize:"14px",color:"#888"}}>석</span>
                    </p>
                    <span style={{fontWeight:"700",fontSize:"13px",color:GRADE_COLOR[trip.grade]}}>{trip.grade}</span>
                    <br/><Info size={16} style={{color:"#ddd",marginTop:4}}/>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #f0f0f0",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <p style={{fontSize:"11px",color:"#aaa",lineHeight:1.5,flex:1}}>
            소요 시간은 교통상황에 따라 달라질 수 있습니다.<br/>
            요금정보는 ⓘ를 선택하셔서 확인하실 수 있습니다.
          </p>
          <button style={{marginLeft:12,width:36,height:36,borderRadius:"50%",border:"1px solid #e0e0e0",background:"white",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            <RefreshCw size={15} style={{color:"#888"}}/>
          </button>
        </div>
      </div>
    );
  }

  // ── 좌석 선택 (phase-aware) ────────────────────────────
  if(screen==="seat_select"&&activeTrip){
    const SEAT_H=62;
    const SeatBox=({sn}:{sn:number|null})=>{
      if(sn===null)return <div style={{height:SEAT_H}}/>;
      const occ=seatOccupied[sn-1];
      const selEntry=activeSeats.find(s=>s.seatNum===sn);
      const sel=!!selEntry;
      const focused=activeFocused===sn;
      return(
        <button onClick={()=>handleSeatTap(sn)} disabled={occ}
          style={{display:"block",width:"100%",height:SEAT_H,boxSizing:"border-box",
            border:sel?`2px solid ${focused?"#5B21B6":PURPLE}`:occ?"1.5px solid #e0e0e0":"1.5px solid #c8c8c8",
            borderRadius:10,background:occ?"#f5f5f5":sel?(focused?"#EDE9FF":PURPLE_LIGHT):"white",
            cursor:occ?"default":"pointer",position:"relative",padding:0}}>
          {sel&&<Check size={10} strokeWidth={3} style={{color:focused?"#5B21B6":PURPLE,position:"absolute",top:4,right:5}}/>}
          <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            {occ?<XIcon size={14} strokeWidth={2} style={{color:"#ccc"}}/>
              :sel?(<><span style={{fontSize:16,fontWeight:700,color:focused?"#5B21B6":PURPLE,lineHeight:1.1}}>{sn}</span>
                <span style={{fontSize:9,fontWeight:700,color:focused?"#5B21B6":PURPLE}}>{selEntry?.type}</span></>)
              :<span style={{fontSize:16,fontWeight:500,color:"#333"}}>{sn}</span>}
          </span>
        </button>
      );
    };

    return(
      <div style={{height:"100svh",display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",padding:"16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <button onClick={()=>setScreen("results")} style={{background:"none",border:"none",cursor:"pointer",marginRight:12,color:"#333",padding:0}}><ArrowLeft size={24}/></button>
          <h1 style={{flex:1,textAlign:"center",fontWeight:"700",fontSize:"18px",color:"#111",margin:0}}>
            {isReturn?"귀가편 좌석 선택":"매수 및 좌석 선택"}
          </h1>
          <div style={{width:24}}/>
        </div>

        {/* 왕복 진행 표시 */}
        {isRoundTrip&&(
          <div style={{display:"flex",alignItems:"center",padding:"8px 16px",background:isReturn?"#F3EEFF":"#f8f8f8",borderBottom:"1px solid #f0f0f0",flexShrink:0,gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:!isReturn?PURPLE:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {!isReturn?<Check size={11} color="white" strokeWidth={3}/>:<span style={{fontSize:10,color:"#999",fontWeight:"700"}}>1</span>}
              </div>
              <span style={{fontSize:12,fontWeight:isReturn?"400":"700",color:isReturn?"#aaa":PURPLE}}>출발편</span>
            </div>
            <div style={{flex:1,height:1,background:"#ddd"}}/>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:isReturn?PURPLE:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:10,color:isReturn?"white":"#999",fontWeight:"700"}}>2</span>
              </div>
              <span style={{fontSize:12,fontWeight:isReturn?"700":"400",color:isReturn?PURPLE:"#aaa"}}>귀가편</span>
            </div>
          </div>
        )}

        <div style={{padding:"10px 16px",background:"#fafafa",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <p style={{fontWeight:"600",fontSize:"14px",color:"#222",margin:0}}>
            {isReturn?`${arrival} → ${departure}`:`${departure} → ${arrival}`}
          </p>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            <span style={{fontSize:"13px",color:"#888"}}>전체 <strong style={{color:"#333"}}>{TOTAL_SEATS}</strong>석</span>
            <span style={{color:"#ddd"}}>|</span>
            <span style={{fontSize:"13px",color:"#888"}}>잔여 <strong style={{color:"#333"}}>{remainingSeats}</strong>석</span>
          </div>
        </div>

        <div style={{display:"flex",gap:8,padding:"10px 16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          {PASSENGER_TYPES.map(pt=>(
            <button key={pt} onClick={()=>handleTypeTap(pt)}
              style={{borderRadius:20,padding:"6px 16px",fontWeight:"600",fontSize:"13px",cursor:"pointer",
                border:`1.5px solid ${activePType===pt?PURPLE:"#ddd"}`,
                color:activePType===pt?PURPLE:"#666",background:activePType===pt?PURPLE_LIGHT:"white"}}>
              {pt}
            </button>
          ))}
          {activeFocused!==null&&(
            <span style={{marginLeft:"auto",fontSize:"11px",color:"#888",alignSelf:"center"}}>{activeFocused}번 선택 중</span>
          )}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"10px 16px 8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:"12px",color:"#bbb"}}>운전석</span>
            <span style={{fontSize:"12px",color:"#bbb"}}>출입구 ↓</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {seatRows.map((row,ri)=>{
              const isLast=row.length===4;
              if(isLast)return(
                <div key={ri} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0 8px",marginTop:2}}>
                  {row.map(sn=><SeatBox key={sn} sn={sn}/>)}
                </div>
              );
              const [a,b,c]=row;
              return(
                <div key={ri} style={{display:"grid",gridTemplateColumns:"1fr 1fr 0.65fr 1fr",gap:"0 8px",alignItems:"center"}}>
                  <SeatBox sn={a}/><SeatBox sn={b}/>
                  <div style={{height:SEAT_H}}/><SeatBox sn={c}/>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{borderTop:"1px solid #f0f0f0",background:"white",padding:"12px 16px 20px",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:4}}>
            <div>
              <p style={{fontWeight:"700",fontSize:"15px",color:"#111",margin:0}}>총 결제금액({activeSeats.length}장)</p>
              {seatBreakdownFor(activeSeats)&&<p style={{fontSize:"12px",color:"#aaa",marginTop:2}}>{seatBreakdownFor(activeSeats)}</p>}
            </div>
            <p style={{fontWeight:"900",fontSize:"22px",color:"#111",margin:0}}>{activeTotal.toLocaleString()}원</p>
          </div>
          <button onClick={handleSeatDone} disabled={activeSeats.length===0}
            style={{width:"100%",borderRadius:16,padding:"14px 0",fontWeight:"700",fontSize:"18px",
              background:activeSeats.length>0?"#111":"#E5E5E5",color:activeSeats.length>0?"white":"#aaa",
              border:"none",cursor:activeSeats.length>0?"pointer":"default",marginTop:8}}>
            {isRoundTrip&&!isReturn?"귀가편 선택하기":"선택완료"}
          </button>
        </div>
      </div>
    );
  }

  // ── 승차권 예약 ────────────────────────────────────────
  if(screen==="booking_summary"&&selectedTrip){
    const outNums=selectedSeats.map(s=>String(s.seatNum).padStart(2,"0")+"번").join(", ");
    const retNums=returnSeats.map(s=>String(s.seatNum).padStart(2,"0")+"번").join(", ");

    // 여정 카드 컴포넌트
    const JourneyCard=({
      label,dep,arr,depTerm,date,trip,seats,unitPrices,
    }:{
      label:string;dep:string;arr:string;depTerm:Terminal|undefined;
      date:string;trip:BusTrip;seats:SelectedSeat[];unitPrices:Record<PassengerType,number>;
    })=>{
      const sNums=seats.map(s=>String(s.seatNum).padStart(2,"0")+"번").join(", ");
      const subTotal=seats.reduce((s,x)=>s+unitPrices[x.type],0);
      return(
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{background:PURPLE}}>
              <Check size={14} className="text-white" strokeWidth={3}/>
            </div>
            <span className="font-bold text-gray-900" style={{fontSize:"16px"}}>{label}</span>
          </div>
          <div className="border border-gray-200 rounded-2xl p-4 space-y-3" style={{boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
            <div>
              <p className="font-bold text-gray-900" style={{fontSize:"16px"}}>{formatDisplay(date)} {trip.departureTime}</p>
              <div className="flex items-center gap-2 mt-1">
                <TypeBadge type={depTerm?.type??"고속"}/>
                <span className="text-gray-600 font-medium" style={{fontSize:"13px"}}>{trip.company}</span>
                <span className="text-gray-300">|</span>
                <span className="font-semibold" style={{fontSize:"13px",color:GRADE_COLOR[trip.grade]}}>{trip.grade}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{borderColor:PURPLE}}/>
                <span className="text-gray-400 mr-1" style={{fontSize:"13px"}}>출발</span>
                <span className="font-bold text-gray-900" style={{fontSize:"14px"}}>{dep}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{background:"#F97316"}}/>
                <span className="text-gray-400 mr-1" style={{fontSize:"13px"}}>도착</span>
                <span className="font-bold text-gray-900" style={{fontSize:"14px"}}>{arr}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              {seats.length>0&&(
                <div className="flex justify-between items-center">
                  <span className="text-gray-500" style={{fontSize:"13px"}}>🪑 좌석</span>
                  <span className="font-bold text-gray-800" style={{fontSize:"13px"}}>{sNums}</span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <span className="text-gray-500" style={{fontSize:"13px"}}>🪙 운임 {seats.length}장</span>
                <div className="text-right">
                  <span className="font-bold" style={{fontSize:"15px",color:PURPLE}}>{subTotal.toLocaleString()}원</span>
                  {PASSENGER_TYPES.filter(pt=>seats.some(s=>s.type===pt)).map(pt=>{
                    const cnt=seats.filter(s=>s.type===pt).length;
                    return(<p key={pt} className="text-gray-400" style={{fontSize:"12px"}}>└ {pt} {cnt}명 {(unitPrices[pt]*cnt).toLocaleString()}원</p>);
                  })}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-2">
              <p className="font-semibold" style={{fontSize:"13px",color:PURPLE}}>결제기한 {payDeadline}</p>
            </div>
          </div>
        </div>
      );
    };

    return(
      // h-svh + overflow:hidden → 내용은 내부 스크롤, 결제 바는 항상 하단 고정
      <div style={{height:"100svh",display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>

        {/* 헤더 — 고정 */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <button onClick={()=>{
            if(isRoundTrip){setBookingPhase("return");setScreen("seat_select");}
            else setScreen("seat_select");
          }} style={{background:"none",border:"none",cursor:"pointer",color:"#333",padding:0}}>
            <XIcon size={24}/>
          </button>
          <h1 style={{fontWeight:"700",fontSize:"18px",color:"#111",margin:0}}>승차권 예약</h1>
          <div style={{width:24}}/>
        </div>

        {/* 내용 — 내부 스크롤 */}
        <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:20}}>

          {/* 여정 1: 출발편 */}
          <JourneyCard
            label="여정 1"
            dep={departure} arr={arrival} depTerm={depTerminal}
            date={travelDate} trip={selectedTrip}
            seats={selectedSeats} unitPrices={outboundUnitPrices}
          />

          {/* 여정 2: 귀가편 (왕복일 때만) */}
          {isRoundTrip&&returnTrip&&(
            <JourneyCard
              label="여정 2"
              dep={arrival} arr={departure} depTerm={arrTerminal}
              date={returnDate} trip={returnTrip}
              seats={returnSeats} unitPrices={returnUnitPrices}
            />
          )}

          {/* 예약 안내 */}
          <div style={{display:"flex",gap:8,background:"#fafafa",borderRadius:12,padding:16}}>
            <Info size={15} style={{color:"#aaa",flexShrink:0,marginTop:1}}/>
            <div>
              <p style={{fontWeight:"600",color:"#555",fontSize:"13px",marginBottom:4}}>승차권 예약 안내</p>
              <p style={{fontSize:"12px",color:"#888",lineHeight:1.6,margin:0}}>
                결제기한내에 결제해야 승차권 구매가 완료됩니다.<br/>
                앱을 종료하거나, 출발 5분(시외 10분)전 여정은 취소됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 결제 바 — 항상 하단 고정 */}
        <div style={{borderTop:"1px solid #f0f0f0",padding:"14px 16px 20px",flexShrink:0,background:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:"13px",color:"#888"}}>
              총 결제금액 ({isRoundTrip?"2개 여정":"1개 여정"}, {selectedSeats.length+(isRoundTrip?returnSeats.length:0)}장)
            </span>
            <span style={{fontWeight:"900",fontSize:"22px",color:"#111"}}>{grandTotal.toLocaleString()}원</span>
          </div>
          <button onClick={()=>setScreen("payment")}
            style={{width:"100%",borderRadius:16,padding:"16px 0",fontWeight:"700",fontSize:"18px",
              background:"#111",color:"white",border:"none",cursor:"pointer"}}>
            결제하기
          </button>
        </div>
      </div>
    );
  }

  // ── 결제 수단 선택 ─────────────────────────────────────
  if(screen==="payment"&&selectedTrip){
    const outNums=selectedSeats.map(s=>String(s.seatNum).padStart(2,"0")+"번").join(", ");
    const retNums=returnSeats.map(s=>String(s.seatNum).padStart(2,"0")+"번").join(", ");
    return(
      <div style={{height:"100svh",display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",padding:"16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <button onClick={()=>setScreen("booking_summary")} style={{color:"#333",marginRight:12,background:"none",border:"none",cursor:"pointer"}}><ArrowLeft size={24}/></button>
          <h1 style={{flex:1,textAlign:"center",fontWeight:"700",fontSize:"18px",color:"#111",margin:0}}>결제 수단 선택</h1>
          <div style={{width:24}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
          <div style={{border:"1px solid #e8e8e8",borderRadius:16,padding:20,marginBottom:16}}>
            <p style={{fontWeight:"700",color:"#111",fontSize:"16px",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #f0f0f0"}}>예매 정보</p>
            {[
              {label:"노선",     value:`${departure} → ${arrival}`},
              {label:"출발일",   value:formatDisplay(travelDate)},
              {label:"출발편",   value:`${selectedTrip.company} (${selectedTrip.grade}) ${selectedTrip.departureTime} | ${outNums}`},
              ...(isRoundTrip&&returnTrip?[
                {label:"귀가일",   value:formatDisplay(returnDate)},
                {label:"귀가편",   value:`${returnTrip.company} (${returnTrip.grade}) ${returnTrip.departureTime} | ${retNums}`},
              ]:[]),
            ].map(({label,value})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:"14px",color:"#aaa"}}>{label}</span>
                <span style={{fontWeight:"600",color:"#333",fontSize:"13px",textAlign:"right",maxWidth:"60%"}}>{value}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #f0f0f0",paddingTop:12,marginTop:4}}>
              <span style={{fontWeight:"700",fontSize:"16px",color:"#111"}}>총 결제 금액</span>
              <span style={{fontWeight:"900",fontSize:"20px",color:PURPLE}}>{grandTotal.toLocaleString()}원</span>
            </div>
          </div>

          <p style={{fontWeight:"700",fontSize:"15px",color:"#333",marginBottom:12}}>결제 방법을 선택하세요</p>

          <button onClick={()=>setScreen("card_processing")}
            style={{width:"100%",borderRadius:16,padding:"32px 0",display:"flex",flexDirection:"column",
              alignItems:"center",gap:12,marginBottom:12,background:"#111",border:"none",cursor:"pointer",
              boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
            <CreditCard size={44} style={{color:"white"}}/>
            <span style={{color:"white",fontWeight:"700",fontSize:"20px"}}>카드 결제</span>
          </button>

          <button onClick={()=>setScreen("easy_select")}
            style={{width:"100%",borderRadius:16,padding:"32px 0",display:"flex",flexDirection:"column",
              alignItems:"center",gap:12,background:PURPLE_LIGHT,border:`2px solid ${PURPLE}`,cursor:"pointer",
              boxShadow:`0 2px 8px rgba(123,47,232,0.15)`}}>
            <Smartphone size={44} style={{color:PURPLE}}/>
            <span style={{color:PURPLE,fontWeight:"700",fontSize:"20px"}}>간편 결제</span>
          </button>
        </div>
      </div>
    );
  }

  if(screen==="card_processing")return <CardProcessingScreen onDone={()=>setScreen("complete")}/>;

  if(screen==="easy_select"){
    return(
      <div style={{height:"100svh",display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",padding:"16px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <button onClick={()=>setScreen("payment")} style={{color:"#333",marginRight:12,background:"none",border:"none",cursor:"pointer"}}><ArrowLeft size={24}/></button>
          <h1 style={{flex:1,textAlign:"center",fontWeight:"700",fontSize:"18px",color:"#111",margin:0}}>간편 결제 선택</h1>
          <div style={{width:24}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column",gap:16}}>
          <p style={{textAlign:"center",fontSize:"15px",color:"#888",margin:0}}>사용하실 간편결제를 선택해주세요</p>
          {EASY_PAY_OPTIONS.map(opt=>(
            <button key={opt.id} onClick={()=>{setSelectedEasyPay(opt);setScreen("easy_processing");}}
              style={{width:"100%",borderRadius:16,padding:"28px 0",display:"flex",alignItems:"center",
                justifyContent:"center",background:opt.color,border:"none",cursor:"pointer",
                boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>
              <span style={{fontWeight:"700",fontSize:"22px",color:opt.textColor}}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if(screen==="easy_processing"&&selectedEasyPay)
    return <EasyProcessingScreen provider={selectedEasyPay} onDone={()=>setScreen("complete")}/>;

  // ── 예매 완료 ──────────────────────────────────────────
  if(screen==="complete"&&selectedTrip){
    const outNums=selectedSeats.map(s=>String(s.seatNum).padStart(2,"0")+"번").join(", ");
    const retNums=returnSeats.map(s=>String(s.seatNum).padStart(2,"0")+"번").join(", ");
    return(
      // h-svh + overflow:hidden → 티켓 내용 내부 스크롤, 버튼은 항상 하단 고정
      <div style={{height:"100svh",display:"flex",flexDirection:"column",background:"white",overflow:"hidden"}}>

        {/* 헤더 — 고정 */}
        <div style={{padding:"16px",borderBottom:"1px solid #f0f0f0",textAlign:"center",flexShrink:0}}>
          <h1 style={{fontWeight:"700",fontSize:"18px",color:"#111",margin:0}}>예매 완료</h1>
        </div>

        {/* 내용 — 내부 스크롤 */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
          <div style={{width:88,height:88,borderRadius:"50%",background:PURPLE_LIGHT,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Check size={48} style={{color:PURPLE}} strokeWidth={3}/>
          </div>
          <div style={{textAlign:"center"}}>
            <p style={{fontWeight:"700",fontSize:"24px",color:"#111",margin:"0 0 6px"}}>예매가 완료되었습니다!</p>
            <p style={{fontSize:"14px",color:"#aaa",margin:0}}>예매번호: <strong style={{color:"#555"}}>{bookingNum}</strong></p>
          </div>

          {/* 출발편 티켓 */}
          <div style={{width:"100%",border:`2px dashed ${PURPLE}`,borderRadius:16,padding:20}}>
            <p style={{fontWeight:"700",fontSize:"13px",color:PURPLE,margin:"0 0 12px"}}>출발편</p>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <p style={{fontSize:"11px",color:"#aaa",margin:"0 0 2px"}}>출발</p>
                <p style={{fontWeight:"700",fontSize:"15px",color:"#111",margin:0}}>{departure}</p>
              </div>
              <div style={{width:28,height:28,borderRadius:"50%",border:"1px solid #e0e0e0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:"11px",color:"#aaa",margin:"0 0 2px"}}>도착</p>
                <p style={{fontWeight:"700",fontSize:"15px",color:"#111",margin:0}}>{arrival}</p>
              </div>
            </div>
            <div style={{borderTop:"1px dashed #e0e0e0",paddingTop:12,display:"flex",flexDirection:"column",gap:6}}>
              {[
                {l:"출발일시",v:`${formatDisplay(travelDate)} ${selectedTrip.departureTime}`},
                {l:"버스",    v:`${selectedTrip.company} (${selectedTrip.grade})`},
                {l:"좌석",   v:outNums||"-"},
                {l:"승객",   v:seatBreakdownFor(selectedSeats)||"-"},
                {l:"운임",   v:`${outboundTotal.toLocaleString()}원`},
              ].map(({l,v})=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:"12px",color:"#aaa"}}>{l}</span>
                  <span style={{fontWeight:"600",fontSize:"12px",color:"#333",textAlign:"right",maxWidth:"65%"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 귀가편 티켓 (왕복) */}
          {isRoundTrip&&returnTrip&&(
            <div style={{width:"100%",border:"2px dashed #F97316",borderRadius:16,padding:20}}>
              <p style={{fontWeight:"700",fontSize:"13px",color:"#F97316",margin:"0 0 12px"}}>귀가편</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <p style={{fontSize:"11px",color:"#aaa",margin:"0 0 2px"}}>출발</p>
                  <p style={{fontWeight:"700",fontSize:"15px",color:"#111",margin:0}}>{arrival}</p>
                </div>
                <div style={{width:28,height:28,borderRadius:"50%",border:"1px solid #e0e0e0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:"11px",color:"#aaa",margin:"0 0 2px"}}>도착</p>
                  <p style={{fontWeight:"700",fontSize:"15px",color:"#111",margin:0}}>{departure}</p>
                </div>
              </div>
              <div style={{borderTop:"1px dashed #e0e0e0",paddingTop:12,display:"flex",flexDirection:"column",gap:6}}>
                {[
                  {l:"출발일시",v:`${formatDisplay(returnDate)} ${returnTrip.departureTime}`},
                  {l:"버스",    v:`${returnTrip.company} (${returnTrip.grade})`},
                  {l:"좌석",   v:retNums||"-"},
                  {l:"승객",   v:seatBreakdownFor(returnSeats)||"-"},
                  {l:"운임",   v:`${returnTotal.toLocaleString()}원`},
                ].map(({l,v})=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:"12px",color:"#aaa"}}>{l}</span>
                    <span style={{fontWeight:"600",fontSize:"12px",color:"#333",textAlign:"right",maxWidth:"65%"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 결제 정보 */}
          <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10,paddingBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:"600",fontSize:"15px",color:"#555"}}>결제수단</span>
              <span style={{fontSize:"14px",color:"#333"}}>{selectedEasyPay?selectedEasyPay.label:"카드 결제"}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:"700",fontSize:"15px",color:"#333"}}>총 결제금액</span>
              <span style={{fontWeight:"900",fontSize:"22px",color:PURPLE}}>{grandTotal.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 버튼 — 항상 하단 고정 */}
        <div style={{padding:"12px 16px 20px",borderTop:"1px solid #f0f0f0",flexShrink:0,background:"white",display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={resetAll}
            style={{width:"100%",borderRadius:16,padding:"16px 0",fontWeight:"700",fontSize:"18px",
              background:"#111",color:"white",border:"none",cursor:"pointer"}}>
            다른 편 조회
          </button>
          <button onClick={()=>navigate("/")}
            style={{width:"100%",borderRadius:16,padding:"16px 0",fontWeight:"700",fontSize:"18px",
              background:"#f0f0f0",color:"#555",border:"none",cursor:"pointer"}}>
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return null;
}

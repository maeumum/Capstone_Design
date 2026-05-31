import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Home, Check } from "lucide-react";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
type Screen =
  | "main"
  | "input"          // 번호 입력 (접수·수납 공용)
  | "rec_clinic"     // 진료실 선택
  | "rec_done"       // 접수 완료 (접수증)
  | "pay_start"      // 수납 시작 (바코드 or 수동)
  | "pay_barcode"    // 바코드 스캔 애니메이션
  | "pay_info"       // 결제 정보 확인
  | "pay_card"       // 카드 결제 모달
  | "pay_print"      // 처방전 출력 중
  | "pay_done";      // 완료

type InputMode = "phone" | "id";
type InputContext = "reception" | "payment";

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const SKY       = "#0EA5E9";
const SKY_DARK  = "#0284C7";
const SKY_DARKER = "#0369A1";
const SKY_LIGHT = "#E0F2FE";
const SKY_MID   = "#BAE6FD";
const GREEN     = "#22C55E";

const CLINICS = [
  { id: "1", name: "1진료실", doctor: "김나* 원장" },
  { id: "2", name: "2진료실", doctor: "이영* 원장" },
  { id: "3", name: "3진료실", doctor: "박지* 원장" },
];

const PAYMENT_AMOUNT = 7000;

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function formatPhone(d: string): string {
  if (d.length === 0) return "";
  if (d.length <= 3)  return d;
  if (d.length <= 7)  return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
}

function formatID(d: string): string {
  if (d.length === 0) return "";
  if (d.length <= 6)  return d;                              // 앞 6자리: 그대로 표시
  return `${d.slice(0,6)}-${d.slice(6,7)}●●●●●●`;           // 7자리: XXXXXX-Y●●●●●●
}

function formatKorDate(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
}

function formatDateTime(d: Date): string {
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  const hh = String(d.getHours()).padStart(2,"0");
  const mi = String(d.getMinutes()).padStart(2,"0");
  return `${yy}.${mm}.${dd}  ${hh}:${mi}`;
}

// ═══════════════════════════════════════════════════
// BARCODE SVG
// ═══════════════════════════════════════════════════
function BarcodeDisplay({ code }: { code: string }) {
  const pattern = [3,1,2,1,1,3,2,1,1,2,1,3,1,2,2,1,3,1,1,2,3,1,1,2,1,2,3,1,2,1,1,2,3,1,2,1,1,3,2,1,2,1,1];
  let x = 0;
  const totalW = pattern.reduce((s,w)=>s+w*2.4,0);
  const bars = pattern.map((w,i)=>{
    const bw = w * 2.4;
    const el = i%2===0
      ? <rect key={i} x={x} y={0} width={bw} height={38} fill="#111"/>
      : null;
    x += bw;
    return el;
  }).filter(Boolean);

  return (
    <div>
      <svg viewBox={`0 0 ${totalW} 38`} preserveAspectRatio="none"
        style={{ width:"100%", height:42, display:"block" }}>
        {bars}
      </svg>
      <p style={{ textAlign:"center", fontSize:10, color:"#666", fontFamily:"monospace",
        letterSpacing:1.5, marginTop:4 }}>
        {code}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// HOSPITAL HEADER
// ═══════════════════════════════════════════════════
function HospitalHeader({ onHome, onAppHome }: { onHome: () => void; onAppHome: () => void }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${SKY_DARKER} 0%, ${SKY} 100%)`,
      padding: "12px 16px", display:"flex", alignItems:"center",
      flexShrink:0, color:"white", gap:12,
    }}>
      <button onClick={onHome} style={{
        background:"rgba(255,255,255,0.18)", border:"none", borderRadius:12,
        padding:"9px 14px", color:"white", cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
      }}>
        <Home size={18}/>
        <span style={{ fontSize:11, fontWeight:700 }}>처음으로</span>
      </button>

      <h1 style={{ flex:1, textAlign:"center", fontWeight:900, fontSize:22, margin:0, letterSpacing:.5 }}>
        JB대학병원
      </h1>

      {/* 앱 메인 메뉴로 이동 */}
      <button onClick={onAppHome} style={{
        background:"rgba(255,255,255,0.18)", border:"none", borderRadius:12,
        padding:"9px 14px", color:"white", cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ fontSize:11, fontWeight:700 }}>홈으로</span>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// NUMBER PAD
// ═══════════════════════════════════════════════════
function NumberPad({ onDigit, onDelete }: { onDigit:(d:string)=>void; onDelete:()=>void }) {
  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:7 }}>
      {keys.map((k, i) => {
        if (k === "") return <div key={i}/>;
        const isDel = k === "⌫";
        return (
          <button key={i} onClick={()=> isDel ? onDelete() : onDigit(k)}
            style={{
              padding:"15px 0", fontSize:22, fontWeight:700, borderRadius:12,
              border:`1.5px solid ${isDel ? "#e0e0e0" : SKY_MID}`,
              background: isDel ? "#f5f5f5" : "white",
              color: isDel ? "#888" : "#1a1a1a",
              cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,0.07)",
              transition:"all .1s",
            }}>
            {isDel ? "←" : k}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function HospitalPage() {
  const navigate = useNavigate();
  const now = new Date();

  // ── Core state ─────────────────────────────────
  const [screen, setScreen]           = useState<Screen>("main");
  const [inputMode, setInputMode]     = useState<InputMode>("phone");
  const [inputContext, setInputContext] = useState<InputContext>("reception");
  const [digits, setDigits]           = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState("");

  // 대기자 수 (최초 랜덤, 고정)
  const [waitCount] = useState(() => Math.floor(Math.random() * 9) + 1);

  // ── Animation state ────────────────────────────
  const [scanSec, setScanSec]   = useState(5);
  const [dotCount, setDotCount] = useState(0);
  const [cardPhase, setCardPhase] = useState<"insert"|"processing"|"done">("insert");

  // Barcode string (for receipt)
  const receiptCode = `2026${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}${String(waitCount+1).padStart(3,"0")}`;

  // ── Derived ────────────────────────────────────
  const maxLen   = inputMode === "phone" ? 11 : 7;
  const isValid  = digits.length === maxLen;
  const canComplete = isValid && (inputContext === "payment" || privacyAgreed);

  const displayValue = () => {
    if (digits.length === 0) return inputMode === "phone" ? "010-●●●●-●●●●" : "●●●●●●-●";
    return inputMode === "phone" ? formatPhone(digits) : formatID(digits);
  };

  // ── Helpers ────────────────────────────────────
  function goHome() {
    setScreen("main"); setDigits(""); setPrivacyAgreed(false);
    setSelectedClinic(""); setInputMode("phone"); setScanSec(5);
    setCardPhase("insert"); setDotCount(0);
  }

  function openInput(ctx: InputContext) {
    setInputContext(ctx); setDigits("010"); setPrivacyAgreed(false);
    setInputMode("phone"); setScreen("input");
  }

  function addDigit(d: string) {
    setDigits(prev => prev.length < maxLen ? prev + d : prev);
  }
  function delDigit() {
    const minLen = inputMode === "phone" ? 3 : 0; // 전화번호는 010 유지
    setDigits(prev => prev.length > minLen ? prev.slice(0,-1) : prev);
  }

  function handleInputComplete() {
    setDigits("");
    if (inputContext === "reception") setScreen("rec_clinic");
    else setScreen("pay_info");
  }

  // ── Timers ─────────────────────────────────────
  // Barcode scan countdown
  useEffect(() => {
    if (screen !== "pay_barcode") return;
    setScanSec(5);
    const iv = setInterval(() => setScanSec(p => { if(p<=1){clearInterval(iv);setScreen("pay_info");return 5;} return p-1; }), 1000);
    return () => clearInterval(iv);
  }, [screen]);

  // Card payment phases
  useEffect(() => {
    if (screen !== "pay_card") return;
    setCardPhase("insert");
    const t1 = setTimeout(() => setCardPhase("processing"), 1500);
    const t2 = setTimeout(() => setCardPhase("done"), 3200);
    const t3 = setTimeout(() => setScreen("pay_print"), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [screen]);

  // Prescription printing dots
  useEffect(() => {
    if (screen !== "pay_print") return;
    setDotCount(0);
    const iv = setInterval(() => setDotCount(d => (d+1)%4), 500);
    const t  = setTimeout(() => setScreen("pay_done"), 5000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [screen]);

  // Auto-return from done
  useEffect(() => {
    if (screen !== "pay_done") return;
    const t = setTimeout(() => goHome(), 5000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // ══════════════════════════════════════════════════
  // SCREENS
  // ══════════════════════════════════════════════════

  // ── 메인 ──────────────────────────────────────────
  if (screen === "main") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden",
      background:`linear-gradient(180deg, ${SKY_LIGHT} 0%, #f0f9ff 100%)` }}>

      {/* 헤더 */}
      <div style={{ background:`linear-gradient(135deg, ${SKY_DARKER} 0%, ${SKY} 100%)`,
        padding:"20px 16px", textAlign:"center", flexShrink:0, color:"white" }}>
        <p style={{ fontSize:15, opacity:.85, margin:"0 0 6px" }}>환영합니다</p>
        <h1 style={{ fontWeight:900, fontSize:30, margin:0, letterSpacing:1 }}>JB대학병원</h1>
      </div>

      {/* 대기자 수 */}
      <div style={{ background:"white", margin:"16px 16px 0", borderRadius:18,
        padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 2px 8px rgba(14,165,233,0.15)", border:`1px solid ${SKY_MID}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:12, height:12, borderRadius:"50%", background:GREEN,
            boxShadow:`0 0 8px ${GREEN}` }}/>
          <span style={{ fontSize:18, fontWeight:700, color:"#334155" }}>현재 대기자 수</span>
        </div>
        <span style={{ fontSize:28, fontWeight:900, color:SKY_DARK }}>
          {waitCount}명
        </span>
      </div>

      {/* 안내 문구 */}
      <p style={{ textAlign:"center", fontSize:17, color:"#475569", marginTop:18, marginBottom:10, fontWeight:600 }}>
        원하시는 서비스를 선택해주세요.
      </p>

      {/* 메인 버튼 2개 */}
      <div style={{ display:"flex", flexDirection:"column", gap:14, padding:"4px 20px 28px" }}>
        {/* 접수하기 */}
        <button onClick={()=>openInput("reception")}
          style={{ borderRadius:20, border:"none", cursor:"pointer",
            background:`linear-gradient(135deg, ${SKY_DARK} 0%, ${SKY} 100%)`,
            color:"white", display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:10, padding:"28px 0",
            boxShadow:`0 6px 20px rgba(2,132,199,0.4)` }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>
            📋
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontWeight:900, fontSize:26, margin:0 }}>접수하기</p>
            <p style={{ fontSize:15, opacity:.85, margin:"4px 0 0" }}>진료 접수를 합니다</p>
          </div>
        </button>

        {/* 수납하기 */}
        <button onClick={()=>setScreen("pay_start")}
          style={{ borderRadius:20, cursor:"pointer",
            background:"white", border:`2.5px solid ${SKY}`,
            color:SKY_DARK, display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:10, padding:"28px 0",
            boxShadow:"0 4px 12px rgba(14,165,233,0.15)" }}>
          <div style={{ width:56, height:56, borderRadius:14, background:SKY_LIGHT,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>
            💳
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontWeight:900, fontSize:26, margin:0 }}>수납하기</p>
            <p style={{ fontSize:15, color:"#64748B", margin:"4px 0 0" }}>진료비를 납부합니다</p>
          </div>
        </button>

        {/* 앱 메인 메뉴로 이동 */}
        <button onClick={()=>navigate("/")}
          style={{ borderRadius:14, padding:"14px 0", border:"none", cursor:"pointer",
            background:"rgba(14,165,233,0.1)", color:SKY_DARKER,
            fontWeight:700, fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          홈으로 (메인 메뉴)
        </button>
      </div>
    </div>
  );

  // ── 번호 입력 (접수/수납 공용) ─────────────────────
  if (screen === "input") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden", background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>

      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {/* 타이틀 */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <p style={{ fontSize:24, fontWeight:900, color:"#0F172A", margin:"0 0 6px" }}>
            {inputContext === "reception" ? "진료 접수" : "본인 확인"}
          </p>
          <p style={{ fontSize:16, color:"#64748B", margin:0 }}>
            번호를 입력해주세요.
          </p>
        </div>

        {/* 방법 선택 탭 */}
        <div style={{ display:"flex", gap:8, marginBottom:14,
          background:"white", borderRadius:16, padding:5,
          boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
          {(["phone","id"] as InputMode[]).map(m => (
            <button key={m} onClick={()=>{ setInputMode(m); setDigits(m==="phone" ? "010" : ""); }}
              style={{ flex:1, padding:"12px 0", borderRadius:12, border:"none", cursor:"pointer",
                fontWeight:800, fontSize:16, transition:"all .15s",
                background: inputMode === m ? SKY : "transparent",
                color: inputMode === m ? "white" : "#64748B",
                boxShadow: inputMode === m ? `0 2px 8px rgba(14,165,233,0.35)` : "none",
              }}>
              {m === "phone" ? "휴대폰번호" : "주민등록번호"}
            </button>
          ))}
        </div>

        {/* 입력 표시 */}
        <div style={{ background:"white", borderRadius:16, padding:"18px 20px", marginBottom:14,
          border:`2.5px solid ${digits.length>0 ? SKY : (inputMode==="id" ? SKY_MID : "#e2e8f0")}`,
          boxShadow:"0 1px 6px rgba(0,0,0,0.07)", minHeight:64,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{
            fontSize:22, fontWeight:700, letterSpacing:2,
            color: digits.length>0 ? "#0F172A" : "#94A3B8",
          }}>
            {digits.length === 0
              ? (inputMode === "id" ? "●●●●●●-●●●●●●●" : "010-●●●●-●●●●")
              : (inputMode === "phone" ? formatPhone(digits) : formatID(digits))
            }
          </span>
          {digits.length > 0 && (
            <span style={{ fontSize:13, color:"#94A3B8", flexShrink:0, marginLeft:8 }}>
              {digits.length}/{maxLen}
            </span>
          )}
        </div>

        {/* 숫자 키패드 */}
        <NumberPad onDigit={addDigit} onDelete={delDigit}/>

        {/* 개인정보 수집 동의 (접수 전용) */}
        {inputContext === "reception" && (
          <button onClick={()=>setPrivacyAgreed(p=>!p)}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:12,
              background:"white", border:`2px solid ${privacyAgreed ? SKY : "#e2e8f0"}`,
              borderRadius:16, padding:"16px 18px", cursor:"pointer", marginTop:12,
              boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ width:26, height:26, borderRadius:7, flexShrink:0,
              border:`2px solid ${privacyAgreed ? SKY : "#CBD5E1"}`,
              background: privacyAgreed ? SKY : "white",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              {privacyAgreed && <Check size={16} strokeWidth={3} color="white"/>}
            </div>
            <span style={{ fontSize:16, fontWeight:700,
              color: privacyAgreed ? SKY_DARK : "#64748B" }}>
              개인정보 수집·이용 동의 <span style={{ color:"#EF4444" }}>(필수)</span>
            </span>
          </button>
        )}

        {/* 입력완료 버튼 */}
        <button onClick={handleInputComplete} disabled={!canComplete}
          style={{ width:"100%", borderRadius:16, padding:"18px 0", marginTop:14,
            fontWeight:900, fontSize:19, border:"none",
            background: canComplete ? `linear-gradient(135deg, ${SKY_DARK}, ${SKY})` : "#E2E8F0",
            color: canComplete ? "white" : "#94A3B8",
            cursor: canComplete ? "pointer" : "default",
            boxShadow: canComplete ? `0 4px 12px rgba(14,165,233,0.4)` : "none",
          }}>
          입력완료
        </button>
      </div>
    </div>
  );

  // ── 진료실 선택 ────────────────────────────────────
  if (screen === "rec_clinic") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden", background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 16px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <p style={{ fontSize:24, fontWeight:900, color:"#0F172A", margin:"0 0 8px" }}>진료실 선택</p>
          <p style={{ fontSize:17, color:"#64748B", margin:0 }}>접수할 진료실을 선택해주세요.</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {CLINICS.map(clinic => (
            <button key={clinic.id} onClick={()=>setSelectedClinic(clinic.id)}
              style={{ background:"white", border:`2.5px solid ${selectedClinic===clinic.id ? SKY : "#E2E8F0"}`,
                borderRadius:18, padding:"22px 20px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:16, textAlign:"left",
                boxShadow: selectedClinic===clinic.id ? `0 4px 12px rgba(14,165,233,0.25)` : "0 1px 4px rgba(0,0,0,0.07)",
                transition:"all .15s" }}>
              <div style={{ width:52, height:52, borderRadius:14, flexShrink:0,
                background: selectedClinic===clinic.id ? SKY : SKY_LIGHT,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
                🏥
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:900, fontSize:20,
                  color: selectedClinic===clinic.id ? SKY_DARK : "#1E293B", margin:"0 0 4px" }}>
                  {clinic.name}
                </p>
                <p style={{ fontSize:16, color:"#64748B", margin:0 }}>{clinic.doctor}</p>
              </div>
              <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0,
                border:`2.5px solid ${selectedClinic===clinic.id ? SKY : "#CBD5E1"}`,
                background: selectedClinic===clinic.id ? SKY : "white",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {selectedClinic===clinic.id && <div style={{ width:10, height:10, borderRadius:"50%", background:"white" }}/>}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* 다음 버튼 */}
      <div style={{ padding:"14px 16px 24px", background:"white", borderTop:"1px solid #E2E8F0", flexShrink:0 }}>
        <button onClick={()=>setScreen("rec_done")} disabled={!selectedClinic}
          style={{ width:"100%", borderRadius:16, padding:"16px 0", fontWeight:800, fontSize:17,
            border:"none", cursor: selectedClinic ? "pointer" : "default",
            background: selectedClinic ? `linear-gradient(135deg, ${SKY_DARK}, ${SKY})` : "#E2E8F0",
            color: selectedClinic ? "white" : "#94A3B8",
            boxShadow: selectedClinic ? `0 4px 12px rgba(14,165,233,0.4)` : "none" }}>
          접수하기
        </button>
      </div>
    </div>
  );

  // ── 접수 완료 (접수증) ────────────────────────────
  if (screen === "rec_done") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden", background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {/* 완료 메시지 */}
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:`${GREEN}22`,
            border:`3px solid ${GREEN}`, display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 10px" }}>
            <Check size={26} color={GREEN} strokeWidth={3}/>
          </div>
          <p style={{ fontWeight:900, fontSize:20, color:"#0F172A", margin:"0 0 4px" }}>진료접수 완료</p>
          <p style={{ fontSize:16, color:"#64748B", margin:0 }}>
            "{CLINICS.find(c=>c.id===selectedClinic)?.name}" 접수되었습니다.
          </p>
        </div>

        {/* 접수증 카드 */}
        <div style={{ background:"white", borderRadius:20, overflow:"hidden",
          boxShadow:"0 4px 16px rgba(0,0,0,0.1)", border:"1px solid #E2E8F0" }}>
          {/* 헤더 */}
          <div style={{ background:`linear-gradient(135deg, ${SKY_DARKER}, ${SKY})`,
            padding:"14px 20px", color:"white", textAlign:"center" }}>
            <p style={{ fontSize:15, opacity:.85, margin:"0 0 2px" }}>JB대학병원</p>
            <p style={{ fontWeight:900, fontSize:24, margin:0, letterSpacing:2 }}>접수증</p>
          </div>

          <div style={{ padding:"20px" }}>
            {/* 대기번호 강조 */}
            <div style={{ textAlign:"center", marginBottom:18 }}>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 4px", letterSpacing:1 }}>대기번호</p>
              <p style={{ fontWeight:900, fontSize:48, color:SKY_DARK, margin:0, lineHeight:1 }}>
                {String(waitCount+1).padStart(3,"0")}
                <span style={{ fontSize:20 }}>번</span>
              </p>
            </div>

            {/* 구분선 (점선) */}
            <div style={{ borderTop:"1.5px dashed #E2E8F0", marginBottom:16 }}/>

            {/* 정보 행 */}
            {[
              { label:"병원명",   value:"JB대학병원" },
              { label:"접수일시", value:formatDateTime(now) },
              { label:"진료실",   value:CLINICS.find(c=>c.id===selectedClinic)?.name ?? "-" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between",
                marginBottom:12, fontSize:15 }}>
                <span style={{ color:"#94A3B8", fontWeight:600 }}>{label}</span>
                <span style={{ color:"#334155", fontWeight:800 }}>{value}</span>
              </div>
            ))}

            {/* 구분선 (점선) */}
            <div style={{ borderTop:"1.5px dashed #E2E8F0", margin:"14px 0" }}/>

            {/* 바코드 */}
            <BarcodeDisplay code={receiptCode}/>

            {/* 구분선 (점선) */}
            <div style={{ borderTop:"1.5px dashed #E2E8F0", margin:"14px 0" }}/>

            {/* 안내 문구 */}
            <div style={{ background:SKY_LIGHT, borderRadius:12, padding:"14px 16px",
              border:`1px solid ${SKY_MID}` }}>
              <p style={{ fontSize:16, color:SKY_DARKER, textAlign:"center", lineHeight:1.7, margin:0, fontWeight:700 }}>
                "접수증"을 받아주세요.<br/>
                진료 순서가 되면 안내해드립니다.<br/>
                대기실에서 기다려주세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div style={{ padding:"14px 16px 24px", background:"white", borderTop:"1px solid #E2E8F0", flexShrink:0 }}>
        <button onClick={goHome}
          style={{ width:"100%", borderRadius:16, padding:"16px 0", fontWeight:800, fontSize:17,
            border:"none", cursor:"pointer",
            background:`linear-gradient(135deg, ${SKY_DARK}, ${SKY})`, color:"white",
            boxShadow:`0 4px 12px rgba(14,165,233,0.4)` }}>
          확인
        </button>
      </div>
    </div>
  );

  // ── 수납 시작 ──────────────────────────────────────
  if (screen === "pay_start") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden", background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>
      <div style={{ flex:1, overflowY:"auto", padding:"24px 16px" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <p style={{ fontSize:24, fontWeight:900, color:"#0F172A", margin:"0 0 8px" }}>수납</p>
          <p style={{ fontSize:17, color:"#64748B", margin:0, lineHeight:1.7 }}>
            접수증 바코드를 찍거나<br/>
            번호를 입력해주세요.
          </p>
        </div>

        {/* 바코드 찍기 */}
        <button onClick={()=>setScreen("pay_barcode")}
          style={{ width:"100%", marginBottom:14, borderRadius:20, border:"none", cursor:"pointer",
            background:`linear-gradient(135deg, ${SKY_DARK}, ${SKY})`, color:"white",
            padding:"32px 0", display:"flex", flexDirection:"column",
            alignItems:"center", gap:12,
            boxShadow:`0 6px 20px rgba(2,132,199,0.4)` }}>
          <div style={{ width:64, height:64, borderRadius:16,
            background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:32 }}>
            📱
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontWeight:900, fontSize:22, margin:"0 0 4px" }}>바코드 찍기</p>
            <p style={{ fontSize:13, opacity:.8, margin:0 }}>접수증 바코드를 스캔합니다</p>
          </div>
        </button>

        {/* 번호 입력 */}
        <button onClick={()=>openInput("payment")}
          style={{ width:"100%", borderRadius:20, cursor:"pointer",
            background:"white", border:`2.5px solid ${SKY}`,
            padding:"28px 0", display:"flex", flexDirection:"column",
            alignItems:"center", gap:12,
            boxShadow:"0 4px 12px rgba(14,165,233,0.15)" }}>
          <div style={{ width:64, height:64, borderRadius:16, background:SKY_LIGHT,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>
            🔢
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontWeight:900, fontSize:22, color:SKY_DARK, margin:"0 0 4px" }}>번호 입력하기</p>
            <p style={{ fontSize:13, color:"#64748B", margin:0 }}>휴대폰번호 / 주민등록번호</p>
          </div>
        </button>
      </div>
    </div>
  );

  // ── 바코드 스캔 ────────────────────────────────────
  if (screen === "pay_barcode") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden", background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"24px" }}>
        <p style={{ fontSize:17, fontWeight:700, color:"#1E293B", marginBottom:6 }}>바코드 스캔 중</p>
        <p style={{ fontSize:13, color:"#64748B", marginBottom:24 }}>
          접수증 바코드를 스캐너에 가져다 대세요.
        </p>

        {/* 스캐너 뷰파인더 */}
        <div style={{ width:260, height:160, borderRadius:16, border:`3px solid ${SKY}`,
          position:"relative", overflow:"hidden", background:"rgba(255,255,255,0.6)",
          boxShadow:`0 0 0 8px ${SKY_MID}` }}>
          {/* 코너 마커 */}
          {[
            { top:0, left:0, borderWidth:"4px 0 0 4px" },
            { top:0, right:0, borderWidth:"4px 4px 0 0" },
            { bottom:0, left:0, borderWidth:"0 0 4px 4px" },
            { bottom:0, right:0, borderWidth:"0 4px 4px 0" },
          ].map((s, i) => (
            <div key={i} style={{ position:"absolute", width:20, height:20,
              border:`solid ${SKY_DARK}`, ...s }}/>
          ))}

          {/* 스캔 라인 */}
          <div style={{ position:"absolute", left:0, right:0, height:3,
            background:`linear-gradient(90deg, transparent, ${SKY}, transparent)`,
            animation:"scanLine 1.5s ease-in-out infinite" }}/>

          {/* 바코드 일러스트 */}
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", opacity:.25 }}>
            <BarcodeDisplay code="SCAN HERE"/>
          </div>
        </div>

        {/* 카운트다운 */}
        <div style={{ marginTop:24, width:70, height:70, borderRadius:"50%",
          background:"white", border:`4px solid ${SKY}`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          boxShadow:`0 4px 12px rgba(14,165,233,0.25)` }}>
          <span style={{ fontSize:28, fontWeight:900, color:SKY_DARK, lineHeight:1 }}>{scanSec}</span>
          <span style={{ fontSize:10, color:"#94A3B8" }}>초</span>
        </div>
        <p style={{ fontSize:12, color:"#94A3B8", marginTop:10 }}>
          {scanSec}초 후 자동으로 진행됩니다.
        </p>
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 0%; }
          50%  { top: calc(100% - 3px); }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );

  // ── 결제 정보 확인 ─────────────────────────────────
  if (screen === "pay_info") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden", background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>

      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <p style={{ fontSize:22, fontWeight:900, color:"#0F172A", margin:"0 0 6px" }}>
            결제 정보를 확인해주세요.
          </p>
          <p style={{ fontSize:16, color:"#64748B", margin:0 }}>
            내용을 확인 후 결제를 진행해주세요.
          </p>
        </div>

        {/* 결제 정보 카드 */}
        <div style={{ background:"white", borderRadius:18, overflow:"hidden",
          boxShadow:"0 2px 12px rgba(0,0,0,0.09)", marginBottom:16 }}>
          {/* 카드 헤더 */}
          <div style={{ background:SKY_LIGHT, padding:"14px 22px", borderBottom:`1px solid ${SKY_MID}` }}>
            <p style={{ fontSize:16, fontWeight:800, color:SKY_DARK, margin:0 }}>진료 내역</p>
          </div>
          {/* 정보 행 */}
          <div style={{ padding:"16px 22px" }}>
            {[
              { label:"진료일자",  value:formatKorDate(now) },
              { label:"결제금액",  value:`${PAYMENT_AMOUNT.toLocaleString()}원`, highlight:true },
              { label:"처방전",    value:"출력" },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"14px 0",
                borderBottom:"1px solid #F1F5F9" }}>
                <span style={{ fontSize:17, color:"#64748B", fontWeight:700 }}>{label}</span>
                <span style={{ fontSize: highlight ? 22 : 17,
                  fontWeight: highlight ? 900 : 700,
                  color: highlight ? SKY_DARK : "#334155" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 카드 결제 버튼 */}
        <button onClick={()=>setScreen("pay_card")}
          style={{ width:"100%", borderRadius:20, padding:"28px 0", border:`2.5px dashed ${SKY}`,
            background:"white", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:10,
            boxShadow:"0 2px 8px rgba(14,165,233,0.12)" }}>
          <div style={{ width:56, height:56, borderRadius:14, background:SKY_LIGHT,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>
            💳
          </div>
          <p style={{ fontWeight:900, fontSize:22, color:SKY_DARK, margin:0 }}>카드 결제</p>
          <p style={{ fontSize:13, color:"#64748B", margin:0 }}>
            {PAYMENT_AMOUNT.toLocaleString()}원
          </p>
        </button>
      </div>
    </div>
  );

  // ── 카드 결제 모달 ────────────────────────────────
  if (screen === "pay_card") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden",
      background:"rgba(0,0,0,0.55)" }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>

      {/* 배경 클릭 방지 */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"white", borderRadius:24, overflow:"hidden",
          width:"100%", maxWidth:380,
          boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
          {/* 모달 헤더 */}
          <div style={{ background:SKY_LIGHT, padding:"14px 20px", borderBottom:`1px solid ${SKY_MID}` }}>
            <p style={{ textAlign:"center", fontWeight:900, fontSize:20, color:SKY_DARKER, margin:0 }}>
              카드 결제
            </p>
          </div>

          <div style={{ padding:"24px 24px 28px" }}>
            <p style={{ fontSize:17, color:"#334155", textAlign:"center", lineHeight:1.7, marginBottom:20 }}>
              카드를 넣어주세요.<br/>
              결제가 완료될 때까지 카드를 빼지 마세요.
            </p>

            {/* 카드 삽입 애니메이션 */}
            <div style={{ position:"relative", height:100, marginBottom:20, display:"flex",
              alignItems:"center", justifyContent:"center" }}>
              {/* 카드 리더기 슬롯 */}
              <div style={{ width:100, height:14, background:"#E2E8F0", borderRadius:3,
                border:"2px solid #CBD5E1", position:"absolute", bottom:10 }}>
                <div style={{ position:"absolute", inset:2, background:"#334155", borderRadius:1 }}/>
              </div>
              {/* 카드 */}
              <div style={{
                width:72, height:46, borderRadius:6,
                background:`linear-gradient(135deg, ${SKY_DARKER}, ${SKY})`,
                border:"1px solid rgba(255,255,255,0.3)",
                boxShadow:"0 4px 12px rgba(2,132,199,0.4)",
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"absolute",
                animation: cardPhase === "insert" ? "cardInsert 0.8s ease-in-out forwards" :
                            cardPhase === "processing" ? "cardPulse 0.6s ease-in-out infinite" : "none",
              }}>
                <div style={{ width:28, height:20, borderRadius:3,
                  background:"rgba(255,255,255,0.3)", border:"1px solid rgba(255,255,255,0.5)" }}/>
              </div>
            </div>

            {/* 결제금액 */}
            <div style={{ background:SKY_LIGHT, borderRadius:14, padding:"14px 20px",
              textAlign:"center", marginBottom:14, border:`1px solid ${SKY_MID}` }}>
              <p style={{ fontSize:14, color:"#64748B", margin:"0 0 4px" }}>결제금액</p>
              <p style={{ fontSize:28, fontWeight:900, color:SKY_DARK, margin:0 }}>
                {PAYMENT_AMOUNT.toLocaleString()}원
              </p>
            </div>

            {/* 처리 중 상태 */}
            <div style={{ textAlign:"center", marginBottom:12 }}>
              {cardPhase === "insert" && (
                <p style={{ fontSize:15, color:"#64748B", margin:0 }}>카드를 삽입해주세요…</p>
              )}
              {cardPhase === "processing" && (
                <p style={{ fontSize:15, color:SKY_DARK, fontWeight:700, margin:0 }}>결제 처리 중입니다…</p>
              )}
              {cardPhase === "done" && (
                <p style={{ fontSize:16, color:GREEN, fontWeight:900, margin:0 }}>✓ 결제 완료!</p>
              )}
            </div>

            {/* 연습용 안내 */}
            <div style={{ background:"#FFF9C4", border:"1px solid #FDE68A", borderRadius:10,
              padding:"10px 14px", marginBottom:10, textAlign:"center" }}>
              <p style={{ fontSize:14, fontWeight:700, color:"#92400E", margin:0 }}>
                연습용 키오스크입니다.<br/>실제 결제가 되지 않습니다.
              </p>
            </div>

            <p style={{ fontSize:13, color:"#94A3B8", textAlign:"center", margin:0 }}>
              5만원 이하는 무서명으로 진행됩니다.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardInsert {
          0%   { transform: translateY(-40px); opacity:0; }
          60%  { transform: translateY(8px); opacity:1; }
          100% { transform: translateY(0px); opacity:1; }
        }
        @keyframes cardPulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );

  // ── 처방전 출력 중 ─────────────────────────────────
  if (screen === "pay_print") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden",
      background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:24 }}>
        {/* 프린터 아이콘 */}
        <div style={{ fontSize:72, marginBottom:20,
          animation:"printerBounce .9s ease-in-out infinite alternate" }}>
          🖨️
        </div>
        {/* 처방전 미리보기 */}
        <div style={{ background:"white", borderRadius:10, padding:"12px 20px", marginBottom:20,
          boxShadow:"0 2px 8px rgba(0,0,0,0.1)", width:200, border:"1px solid #E2E8F0",
          animation:"paperSlide .9s ease-in-out infinite alternate" }}>
          <p style={{ fontSize:12, fontWeight:700, textAlign:"center", margin:"0 0 6px", color:"#334155" }}>
            처 방 전
          </p>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height:3, background:`#E2E8F0`, borderRadius:2,
              marginBottom:5, width:`${[80,60,90,70,85,55][i]}%` }}/>
          ))}
        </div>
        <p style={{ fontSize:18, fontWeight:800, color:SKY_DARKER, margin:"0 0 8px" }}>
          처방전 출력중입니다{"."?.repeat(dotCount)}{" ".repeat(3-dotCount)}
        </p>
        <p style={{ fontSize:13, color:"#64748B", margin:0 }}>잠시만 기다려주세요.</p>
      </div>
      <style>{`
        @keyframes printerBounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-8px); }
        }
        @keyframes paperSlide {
          from { transform: translateY(0) rotate(-1deg); }
          to   { transform: translateY(-6px) rotate(1deg); }
        }
      `}</style>
    </div>
  );

  // ── 완료 ───────────────────────────────────────────
  if (screen === "pay_done") return (
    <div style={{ height:"100svh", display:"flex", flexDirection:"column", overflow:"hidden",
      background:SKY_LIGHT }}>
      <HospitalHeader onHome={goHome} onAppHome={()=>navigate("/")}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:32 }}>
        <div style={{ width:88, height:88, borderRadius:"50%",
          background:`${GREEN}22`, border:`4px solid ${GREEN}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:20, boxShadow:`0 0 20px ${GREEN}44` }}>
          <Check size={44} color={GREEN} strokeWidth={3}/>
        </div>
        <p style={{ fontWeight:900, fontSize:28, color:"#0F172A", margin:"0 0 8px" }}>
          결제가 완료되었습니다!
        </p>
        <p style={{ fontSize:18, fontWeight:800, color:SKY_DARK, margin:"0 0 24px" }}>
          처방전을 챙겨가세요!
        </p>

        {/* 처방전 일러스트 */}
        <div style={{ background:"white", borderRadius:14, padding:"16px 24px",
          boxShadow:"0 4px 16px rgba(0,0,0,0.1)", width:220,
          border:"1px solid #E2E8F0", marginBottom:28, transform:"rotate(-2deg)" }}>
          <p style={{ fontSize:13, fontWeight:800, textAlign:"center",
            margin:"0 0 10px", color:"#334155", letterSpacing:3 }}>처 방 전</p>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ height:3, background:"#F1F5F9", borderRadius:2,
              marginBottom:6, width:`${[75,55,90,65,80,50,70][i]}%` }}/>
          ))}
          <p style={{ fontSize:10, color:"#94A3B8", textAlign:"right", margin:"10px 0 0" }}>
            JB대학병원
          </p>
        </div>

        <div style={{ background:SKY_LIGHT, borderRadius:14, padding:"14px 22px",
          border:`1px solid ${SKY_MID}`, textAlign:"center" }}>
          <p style={{ fontSize:16, color:SKY_DARKER, fontWeight:800, margin:"0 0 6px" }}>
            처방전을 잊지 마세요!
          </p>
          <p style={{ fontSize:15, color:"#64748B", margin:0 }}>
            잠시 후 자동으로 처음 화면으로 이동합니다.
          </p>
        </div>
      </div>
    </div>
  );

  return null;
}

import { useNavigate } from "react-router";
import { useState } from "react";
import { Check, Plus, Minus, Search } from "lucide-react";
import "./PublicPage.css";

type Step =
  | "main"
  | "sub-doc"
  | "resident-id"
  | "resident-auth"
  | "fingerprint-scan"
  | "recipient-select"
  | "notice"
  | "auth-select"
  | "auth-scan"
  | "auth-pin"
  | "options"
  | "fee-exemption"
  | "quantity"
  | "payment"
  | "complete"
  | "cert-type"
  | "taxpayer-type"
  | "tax-item"
  | "tax-period"
  | "id-visibility"
  | "addr-visibility"
  | "use-purpose"
  | "submission-dest"
  | "tax-quantity"
  | "land-sigungu"
  | "land-jibun"
  | "land-year"
  | "land-history"
  | "land-owner-id"
  | "land-quantity"
  | "family-notice"
  | "family-notice-2";

interface CategoryItem {
  id: string;
  name: string;
  fee: string;
  subDocs?: SubDoc[];
}

interface SubDoc {
  id: string;
  name: string;
  fee: number;
  feeNote?: string;
  hasIdOption?: boolean;
  hasAddressOption?: boolean;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "resident", name: "주민등록", fee: "무료",
    subDocs: [
      { id: "res-copy", name: "주민등록표(초본)", fee: 0, hasIdOption: true, hasAddressOption: true },
      { id: "res-abstract", name: "주민등록표(등본)", fee: 0, hasIdOption: true, hasAddressOption: true },
    ],
  },
  {
    id: "land", name: "지적, 토지, 건축", fee: "수수료: 다음화면",
    subDocs: [
      { id: "land-reg",    name: "토지(임야)대장",     fee: 500,  feeNote: "20장 초과시 1장당추가100원" },
      { id: "land-use",    name: "토지이용계획확인서",  fee: 1000 },
      { id: "land-rights", name: "대지권등록부",        fee: 500,  feeNote: "20장 초과시 1장당추가100원" },
      { id: "land-price",  name: "개별공시지가확인서",  fee: 800 },
      { id: "bldg-reg",    name: "건축물대장",          fee: 500 },
    ],
  },
  { id: "vehicle", name: "차량", fee: "수수료: 다음화면" },
  {
    id: "health-welfare", name: "건강보험", fee: "무료",
    subDocs: [
      { id: "hw-region-long",      name: "지역가입자\n건강장기요양보험료 납부확인서",          fee: 0 },
      { id: "hw-qualify",          name: "건강보험 자격확인서",                                 fee: 0 },
      { id: "hw-region-long-year", name: "지역가입자 건강장기요양보험료\n납부확인서(연말정산용)", fee: 0 },
      { id: "hw-region-pension",   name: "지역가입자\n국민연금보험료 납부확인서",               fee: 0 },
      { id: "hw-work-long",        name: "직장가입자\n건강장기요양보험료 납부확인서",           fee: 0 },
      { id: "hw-work-pension",     name: "직장가입자\n국민연금보험료 납부확인서",               fee: 0 },
      { id: "hw-cert",             name: "건강보험 자격득실확인서",                              fee: 0 },
    ],
  },
  { id: "farmland", name: "농지대장, 농업경영체", fee: "수수료: 다음화면" },
  {
    id: "family-reg", name: "가족관계등록부", fee: "500원",
    subDocs: [
      { id: "family",          name: "가족관계증명서",     fee: 500 },
      { id: "family-closed",   name: "폐쇄 가족관계증명서", fee: 500 },
      { id: "basic",           name: "기본증명서",          fee: 500 },
      { id: "basic-closed",    name: "폐쇄 기본증명",       fee: 500 },
      { id: "marriage",        name: "혼인관계증명",        fee: 500 },
      { id: "marriage-closed", name: "폐쇄 혼인관계증명서", fee: 500 },
    ],
  },
  {
    id: "old-reg", name: "제적부", fee: "등본500원\n초본300원",
    subDocs: [
      { id: "old-copy", name: "제적등본", fee: 500 },
      { id: "old-abstract", name: "제적초본", fee: 300 },
    ],
  },
  { id: "military", name: "병적증명서", fee: "무료" },
  { id: "local-tax", name: "지방세", fee: "수수료: 다음화면" },
  { id: "fishing", name: "어선원부", fee: "600원" },
  { id: "education", name: "교육제증명\n대학교(원) 제외", fee: "무료" },
  {
    id: "national-tax", name: "국세증명", fee: "무료",
    subDocs: [
      { id: "nt-income", name: "소득금액증명", fee: 0 },
      { id: "nt-closure", name: "폐업사실증명", fee: 0 },
      { id: "nt-earnedtax", name: "근로(자녀) 장려금\n수급사실증명", fee: 0 },
      { id: "nt-taxpaid", name: "납세증명서\n(국세완납증명)", fee: 0 },
      { id: "nt-payment", name: "납부내역증명", fee: 0 },
      { id: "nt-bizunit", name: "사업자단위과세적용\n종된사업장증명", fee: 0 },
      { id: "nt-income-confirm", name: "소득확인증명서\n(개인종합자산관리계좌 가입용)", fee: 0 },
      { id: "nt-vat-exempt", name: "부가가치세 면세사업자\n수입금액증명", fee: 0 },
      { id: "nt-model-taxpayer", name: "모범납세자증명", fee: 0 },
      { id: "nt-vat-standard", name: "부가가치세\n과세표준증명", fee: 0 },
      { id: "nt-pension", name: "연금보험료 등\n소득·세액공제확인서", fee: 0 },
      { id: "nt-bizreg", name: "사업자등록증명", fee: 0 },
      { id: "nt-suspension", name: "휴업사실증명", fee: 0 },
    ],
  },
  { id: "employment", name: "고용, 산재보험\n(근로복지공단)", fee: "무료" },
  { id: "passport", name: "여권", fee: "무료" },
  { id: "pension", name: "국민연금", fee: "무료" },
  { id: "traffic", name: "교통(경찰청)", fee: "무료" },
];

const AUTH_OPTIONS = [
  { id: "idcard", label: "주민등록증", emoji: "🪪", desc: "스캐너에 카드를 올려놓으세요" },
  { id: "license", label: "운전면허증", emoji: "🚗", desc: "스캐너에 카드를 올려놓으세요" },
  { id: "certificate", label: "공인(금융)인증서", emoji: "🔐", desc: "인증서 비밀번호를 입력하세요" },
  { id: "health-card", label: "건강보험증", emoji: "🏥", desc: "스캐너에 카드를 올려놓으세요" },
];

function SkyHeader({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="relative px-4 py-4 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 45%, #a8e8d0 80%, #6dbf72 100%)",
      }}
    >
      {/* Clouds */}
      <div className="absolute top-1 left-6 w-16 h-5 bg-white rounded-full opacity-80" />
      <div className="absolute top-3 left-10 w-12 h-4 bg-white rounded-full opacity-70" />
      <div className="absolute top-2 right-16 w-20 h-6 bg-white rounded-full opacity-75" />
      <div className="absolute top-0 right-20 w-12 h-4 bg-white rounded-full opacity-65" />

      {/* Version */}
      <span
        className="absolute top-2 right-2 text-yellow-700"
        style={{ fontSize: "11px", fontWeight: "600" }}
      >
        Ver 2024.8.28.1
      </span>

      {/* Content */}
      <div className="relative flex items-start gap-3 mt-1 pr-16">
        <span style={{ fontSize: "28px", lineHeight: 1 }}>📢</span>
        <div>
          <p className="text-gray-900" style={{ fontSize: "19px", fontWeight: "700", lineHeight: 1.3 }}>
            발급을 원하시는{" "}
            <span className="text-blue-700 underline underline-offset-2">증명서</span>를 선택하십시오.
          </p>
          <p className="text-gray-700 mt-1" style={{ fontSize: "13px" }}>
            개인정보 보호법에 의거하여 현재 카메라가 작동 중입니다.
          </p>
        </div>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="absolute bottom-2 right-2 bg-gray-700 text-white rounded-lg px-3 py-1 active:scale-95 transition-all"
          style={{ fontSize: "13px" }}
        >
          ← 이전
        </button>
      )}
    </div>
  );
}

function GreenBar({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div
      className="px-3 py-3"
      style={{ background: "linear-gradient(180deg, #5ab55a 0%, #3d9e3d 60%, #2d7d2d 100%)" }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Left gray buttons */}
        <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-2 active:scale-95 transition-all" style={{ fontSize: "13px", fontWeight: "600" }}>
          설치장소<br />안내
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-2 active:scale-95 transition-all" style={{ fontSize: "13px", fontWeight: "600" }}>
          서비스<br />시간
        </button>

        {/* Search */}
        <button className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg px-4 py-2 active:scale-95 transition-all flex-1" style={{ fontSize: "14px", fontWeight: "700" }}>
          <Search size={16} />
          증명서 검색
        </button>

        {/* Zoom */}
        <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg px-3 py-2 active:scale-95 transition-all text-center" style={{ fontSize: "12px", fontWeight: "700" }}>
          화면확대<br />(저시력 고객용)
        </button>

        {/* Fee info */}
        <button className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-2 active:scale-95 transition-all text-center" style={{ fontSize: "12px", fontWeight: "700" }}>
          발급<br />수수료
        </button>

        {/* Coin return */}
        <button className="bg-green-400 hover:bg-green-300 text-green-900 rounded-full w-12 h-12 flex flex-col items-center justify-center active:scale-95 transition-all" style={{ fontSize: "11px", fontWeight: "700", lineHeight: 1.2 }}>
          동전<br />반환
        </button>
      </div>

      <p className="text-yellow-300 text-center mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
        안녕하세요. 무인민원발급기입니다.
      </p>
    </div>
  );
}

function GovNumpad({ value, maxLen, onChange }: { value: string; maxLen: number; onChange: (v: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => {
            if (key === "clear") { onChange(""); return; }
            if (key === "del") { onChange(value.slice(0, -1)); return; }
            if (value.length < maxLen) onChange(value + key);
          }}
          className={`rounded-xl py-5 font-bold shadow active:scale-95 transition-all
            ${key === "clear" ? "bg-red-500 hover:bg-red-600 text-white" :
              key === "del" ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900" :
              "bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-200"}`}
          style={{ fontSize: "24px" }}
        >
          {key === "clear" ? "취소" : key === "del" ? "←" : key}
        </button>
      ))}
    </div>
  );
}

function PubPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#2c2f33",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      <div style={{
        width: "1280px",
        height: "800px",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      }}>
        {children}
      </div>
    </div>
  );
}

export default function PublicPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("main");
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<SubDoc | null>(null);
  const [authMethod, setAuthMethod] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showId, setShowId] = useState(true);
  const [includeAddr, setIncludeAddr] = useState(false);
  const [pin, setPin] = useState("");
  const [residentId, setResidentId] = useState("");
  const [recipientSelected, setRecipientSelected] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [optionIncludes, setOptionIncludes] = useState<Record<string, string>>({});
  const [selectedFeeOption, setSelectedFeeOption] = useState<"exempt" | "not-exempt" | null>(null);
  const [taxPage, setTaxPage] = useState(0);
  const [selectedTaxItem, setSelectedTaxItem] = useState<string | null>(null);
  const [taxPeriodFrom, setTaxPeriodFrom] = useState({ year: 2026, month: 1 });
  const [taxPeriodTo, setTaxPeriodTo] = useState({ year: 2026, month: 5 });
  const [editingPeriod, setEditingPeriod] = useState<"from" | "to" | null>(null);
  const [idVisible, setIdVisible] = useState<"public" | "private" | null>(null);
  const [addrVisible, setAddrVisible] = useState<"public" | "private" | null>(null);
  const [usePurpose, setUsePurpose] = useState<string | null>(null);
  const [submissionDest, setSubmissionDest] = useState<string | null>(null);
  const [taxQty, setTaxQty] = useState(1);
  const [landConsonant, setLandConsonant] = useState("ㅈ");
  const [landSigungu, setLandSigungu] = useState("");
  const [landJibun, setLandJibun] = useState("");
  const [landJibunType, setLandJibunType] = useState<"일반" | "폐쇄" | "산">("일반");
  const [landYear, setLandYear] = useState(2021);
  const [landHistory, setLandHistory] = useState<"포함" | "미포함" | null>(null);
  const [landOwnerIdOpt, setLandOwnerIdOpt] = useState<"입력" | "미입력" | null>(null);
  const [landQty, setLandQty] = useState(1);

  const reset = () => {
    setStep("main");
    setSelectedCategory(null);
    setSelectedDoc(null);
    setAuthMethod(null);
    setQuantity(1);
    setResidentId("");
    setRecipientSelected(false);
    setShowId(true);
    setIncludeAddr(false);
    setPin("");
    setPurpose("");
    setOptionIncludes({});
    setSelectedFeeOption(null);
    setTaxPage(0);
    setSelectedTaxItem(null);
    setTaxPeriodFrom({ year: 2026, month: 1 });
    setTaxPeriodTo({ year: 2026, month: 5 });
    setEditingPeriod(null);
    setIdVisible(null);
    setAddrVisible(null);
    setUsePurpose(null);
    setSubmissionDest(null);
    setTaxQty(1);
    setLandConsonant("ㅈ");
    setLandSigungu("");
    setLandJibun("");
    setLandJibunType("일반");
    setLandYear(2021);
    setLandHistory(null);
    setLandOwnerIdOpt(null);
    setLandQty(1);
  };

  const handleCategoryTap = (cat: CategoryItem) => {
    setSelectedCategory(cat);
    if (cat.subDocs && cat.subDocs.length > 0) {
      setStep("sub-doc");
    } else {
      // Single-doc category: create a synthetic SubDoc
      setSelectedDoc({ id: cat.id, name: cat.name, fee: 0 });
      setStep("auth-select");
    }
  };

  const totalFee = selectedDoc ? selectedDoc.fee * quantity : 0;

  // ── MAIN ─────────────────────────────────────────────────
  if (step === "main") {
    const ACTIVE_IDS = new Set(["resident", "family-reg", "land", "national-tax", "health-welfare"]);

    const btnStyle = (cat: CategoryItem): React.CSSProperties => ({
      background: ACTIVE_IDS.has(cat.id) ? "#1a1a1a" : "#888",
      borderRadius: 16,
      padding: "16px 18px 12px",
      minHeight: 110,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      textAlign: "left",
      cursor: ACTIVE_IDS.has(cat.id) ? "pointer" : "default",
      border: "none",
      boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
      transition: "transform 0.08s",
    });

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f0f0f0" }}>

          {/* Header */}
          <div style={{ padding: "22px 40px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "#f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 44 }}>📢</span>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#111", margin: 0 }}>
                발급을 원하시는 증명서를 선택하십시오.
              </p>
            </div>
            <p style={{ fontSize: 15, color: "#555", margin: 0 }}>
              현재 버전에서는 일부 기능만 사용 가능합니다.
            </p>
          </div>

          {/* Grid container */}
          <div style={{ flex: 1, margin: "10px 24px", background: "#ddd", borderRadius: 20, padding: "16px", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => ACTIVE_IDS.has(cat.id) && handleCategoryTap(cat)}
                  style={btnStyle(cat)}
                  onMouseDown={(e) => ACTIVE_IDS.has(cat.id) && (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={(e) => ACTIVE_IDS.has(cat.id) && (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", whiteSpace: "pre-line", lineHeight: 1.35 }}>
                    {cat.name}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 700, textAlign: "right",
                    color: "#f5c842",
                    whiteSpace: "pre-line",
                    marginTop: 8,
                  }}>
                    {cat.fee}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", padding: "10px 24px 14px", gap: 12, background: "#f0f0f0" }}>
            {/* Left: green buttons */}
            {["설치장소 안내", "서비스 시간"].map((label) => (
              <button key={label} style={{ background: "#6abf6a", border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
                {label}
              </button>
            ))}

            {/* Center: 화면확대 */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button style={{ background: "#f5e96a", border: "none", borderRadius: 16, padding: "12px 36px", fontSize: 20, fontWeight: 900, color: "#333", cursor: "pointer", textAlign: "center", lineHeight: 1.3 }}>
                화면확대<br /><span style={{ fontSize: 13, fontWeight: 600 }}>(저시력 고객용)</span>
              </button>
            </div>

            {/* Right: pink buttons */}
            {["발급수수료", "동전반환"].map((label) => (
              <button key={label} style={{ background: "#e8827a", border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
                {label}
              </button>
            ))}

            {/* Home */}
            <button onClick={() => navigate("/")} style={{ background: "#555", border: "none", borderRadius: 999, padding: "10px 18px", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
              홈으로
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── SUB DOCUMENT ──────────────────────────────────────────
  if (step === "sub-doc" && selectedCategory?.subDocs) {
    const isLand = selectedCategory.id === "land";
    const isFamily = selectedCategory.id === "family-reg";
    const isTwoCol = isLand || selectedCategory.id === "health-welfare";
    const isCompact = !isTwoCol && !isFamily && selectedCategory.subDocs.length > 4;

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: isCompact ? "16px 40px 12px" : "20px 48px 14px", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: isCompact ? "34px" : "40px", flexShrink: 0 }}>📢</span>
            <div>
              {isFamily && (
                <p style={{ fontSize: "22px", fontWeight: 900, color: "#1565c0", margin: "0 0 2px", lineHeight: 1.2 }}>
                  일괄 발급 (가족관계등록부 서비스)
                </p>
              )}
              <p style={{ fontSize: isCompact ? "28px" : "30px", fontWeight: 900, color: "#1a2a4a", margin: 0, lineHeight: 1.25 }}>
                발급을 원하시는{" "}
                <span style={{ color: "#1565c0", textDecoration: "underline", textUnderlineOffset: "4px" }}>증명서</span>를
                선택하십시오.
              </p>
            </div>
          </div>

          {isFamily ? (
            /* ── Family-reg 2-column black/gray grid ── */
            <div style={{ flex: 1, margin: "0 36px 16px", background: "rgba(255,255,255,0.60)", borderRadius: 20, padding: "20px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100%" }}>
                {selectedCategory.subDocs.map((doc) => {
                  const active = ["family", "basic", "marriage"].includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        if (!active) return;
                        setSelectedDoc(doc);
                        setResidentId("");
                        setStep("family-notice");
                      }}
                      onMouseDown={e => { if (active) e.currentTarget.style.filter = "brightness(1.2)"; }}
                      onMouseUp={e => (e.currentTarget.style.filter = "")}
                      onMouseLeave={e => (e.currentTarget.style.filter = "")}
                      style={{
                        background: active
                          ? "linear-gradient(180deg, #1a1a1a 65%, #333 100%)"
                          : "linear-gradient(180deg, #aaaaaa 65%, #999 100%)",
                        borderRadius: 16,
                        border: "none",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12,
                        cursor: active ? "pointer" : "default",
                        opacity: active ? 1 : 0.7,
                        transition: "filter 0.08s",
                        boxShadow: active ? "0 4px 14px rgba(0,0,0,0.35)" : "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      <span style={{ color: "#fff", fontSize: "32px", fontWeight: 800, textAlign: "center", lineHeight: 1.3 }}>
                        {doc.name}
                      </span>
                      <span style={{ color: "#f5c842", fontSize: "22px", fontWeight: 700, textAlign: "center" }}>
                        {doc.fee.toLocaleString()}원
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : isTwoCol ? (
            /* ── 2-column dark grid (토지·건강보험 등) ── */
            <div style={{ flex: 1, margin: "0 40px 16px", background: "rgba(255,255,255,0.50)", borderRadius: 18, padding: "24px 32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100%" }}>
                {selectedCategory.subDocs.map((doc) => {
                  const active = isLand
                    ? (doc.id === "land-reg" || doc.id === "bldg-reg")
                    : doc.id === "hw-cert";
                  const nextStep = isLand ? "land-sigungu" : "resident-id";
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        if (!active) return;
                        setSelectedDoc(doc);
                        setResidentId("");
                        setStep(nextStep);
                      }}
                      onMouseDown={e => { if (active) e.currentTarget.style.filter = "brightness(1.18)"; }}
                      onMouseUp={e => (e.currentTarget.style.filter = "")}
                      onMouseLeave={e => (e.currentTarget.style.filter = "")}
                      style={{
                        background: active
                          ? "linear-gradient(180deg, #4a4a4a 0%, #282828 100%)"
                          : "linear-gradient(180deg, #6a6a6a 0%, #555555 100%)",
                        borderRadius: 14,
                        border: "1px solid #555",
                        padding: "20px 20px 14px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        cursor: active ? "pointer" : "default",
                        boxShadow: active ? "0 3px 8px rgba(0,0,0,0.3)" : "none",
                        transition: "filter 0.08s",
                        textAlign: "center",
                        opacity: active ? 1 : 0.45,
                      }}
                    >
                      <span style={{ color: "#fff", fontSize: "22px", fontWeight: 700, lineHeight: 1.35 }}>
                        {doc.name}
                      </span>
                      <span style={{ color: "#f5c842", fontSize: "14px", fontWeight: 700, marginTop: 8, display: "block" }}>
                        {doc.fee.toLocaleString()}원{doc.feeNote ? `(${doc.feeNote})` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : isCompact ? (
            /* ── Compact 3-column grid (국세증명 등 항목 많은 경우) ── */
            <div style={{ flex: 1, margin: "0 20px 10px", background: "rgba(255,255,255,0.50)", borderRadius: 18, padding: "14px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "1fr", gap: 10, height: "100%" }}>
                {selectedCategory.subDocs.map((doc) => {
                  const active = doc.id === "nt-payment";
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        if (!active) return;
                        setSelectedDoc(doc);
                        setResidentId("");
                        setStep(selectedCategory.id === "national-tax" ? "cert-type" : "auth-select");
                      }}
                      onMouseDown={e => { if (active) e.currentTarget.style.filter = "brightness(1.18)"; }}
                      onMouseUp={e => (e.currentTarget.style.filter = "")}
                      onMouseLeave={e => (e.currentTarget.style.filter = "")}
                      style={{
                        background: active
                          ? "linear-gradient(180deg, #4a4a4a 0%, #282828 100%)"
                          : "linear-gradient(180deg, #6a6a6a 0%, #555555 100%)",
                        borderRadius: 14,
                        border: "1px solid #555",
                        padding: "14px 14px 8px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        cursor: active ? "pointer" : "default",
                        boxShadow: active ? "0 3px 8px rgba(0,0,0,0.3)" : "none",
                        transition: "filter 0.08s",
                        textAlign: "center",
                        opacity: active ? 1 : 0.45,
                      }}
                    >
                      <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700, lineHeight: 1.35, whiteSpace: "pre-line", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {doc.name}
                      </span>
                      <span style={{ color: "#f5c842", fontSize: "13px", fontWeight: 700, textAlign: "right", marginTop: 6, display: "block" }}>
                        {doc.fee > 0 ? `${doc.fee.toLocaleString()}원` : "무료"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Large card layout (주민등록 등 항목 적은 경우) ── */
            <div style={{ flex: 1, display: "flex", gap: 32, padding: "10px 60px 24px", alignItems: "stretch" }}>
              {selectedCategory.subDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setResidentId("");
                    setStep(selectedCategory.id === "resident" ? "resident-id" : "auth-select");
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.90)",
                    borderRadius: 24,
                    border: "3px solid #90c8e8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    cursor: "pointer",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                    transition: "transform 0.08s",
                  }}
                >
                  <div style={{ width: 100, height: 100, borderRadius: 20, background: "linear-gradient(135deg, #d0eaff 0%, #a8d4f8 100%)", border: "2px solid #7ab8e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "52px" }}>📄</span>
                  </div>
                  <span style={{ fontSize: "34px", fontWeight: 900, color: "#1a3a6a", textAlign: "center", lineHeight: 1.25 }}>
                    {doc.name}
                  </span>
                  <div style={{ background: "linear-gradient(180deg, #4caf72 0%, #2d8a50 100%)", borderRadius: 999, padding: "8px 28px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                      {doc.fee > 0 ? `${doc.fee.toLocaleString()}원` : "무 료"}
                    </span>
                  </div>
                  <div style={{ width: 58, height: 58, borderRadius: "50%", border: "2.5px solid #1565c0", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(21,101,192,0.08)" }}>
                    <span style={{ fontSize: "26px", color: "#1565c0" }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={reset}
                style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
              >
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button
                onClick={() => setStep("main")}
                style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
              >
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "16px", margin: 0, fontWeight: 600 }}>
                {(isCompact || isTwoCol || isFamily) ? "안녕하세요. 무인민원발급기입니다." : `〈${selectedCategory.name}〉`}
              </p>
            </div>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── FAMILY NOTICE ─────────────────────────────────────────
  if (step === "family-notice" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "28px 48px 20px", display: "flex", alignItems: "flex-start", gap: 18 }}>
            <span style={{ fontSize: "48px", flexShrink: 0 }}>📢</span>
            <p style={{ fontSize: "34px", fontWeight: 800, color: "#1a2a4a", margin: 0, lineHeight: 1.5 }}>
              {selectedDoc.name} 발급을 계속하시려면 <span style={{ color: "#e53e3e" }}>확인버튼</span>을{" "}
              발급업무를 중단하시려면 <span style={{ color: "#e53e3e" }}>첫화면버튼</span>을 눌러주십시오.
            </p>
          </div>

          {/* Content card */}
          <div style={{ flex: 1, margin: "0 36px 20px", background: "rgba(255,255,255,0.92)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* Blue banner */}
            <div style={{ background: "linear-gradient(180deg, #1a52c8 0%, #1565c0 100%)", padding: "22px 0", textAlign: "center" }}>
              <span style={{ color: "#fff", fontSize: "38px", fontWeight: 900, letterSpacing: "0.1em" }}>[발급안내]</span>
            </div>

            {/* Bullets */}
            <div style={{ flex: 1, padding: "44px 80px", display: "flex", flexDirection: "column", gap: 44, justifyContent: "center", alignItems: "center" }}>
              {/* Bullet 1 */}
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", width: "100%" }}>
                <span style={{ color: "#e53e3e", fontSize: "36px", lineHeight: 1.6, flexShrink: 0 }}>●</span>
                <p style={{ fontSize: "36px", fontWeight: 700, color: "#111", margin: 0, lineHeight: 1.7, textAlign: "left" }}>
                  {selectedDoc.name}는{" "}
                  <span style={{ background: "#1a1a1a", color: "#f5c842", padding: "2px 8px", borderRadius: 4 }}>신청인(본인)</span>을{" "}
                  <span style={{ background: "#f5c842", color: "#1a1a1a", padding: "2px 8px", borderRadius: 4 }}>기준</span>으로<br />
                  <span style={{ background: "#f5c842", color: "#1a1a1a", padding: "2px 8px", borderRadius: 4 }}>부모, 배우자, 자녀 3대</span>에 한해서만 인적사항이 출력됩니다.
                </p>
              </div>

              {/* Bullet 2 */}
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", width: "100%" }}>
                <span style={{ color: "#e53e3e", fontSize: "36px", lineHeight: 1.6, flexShrink: 0 }}>●</span>
                <p style={{ fontSize: "36px", fontWeight: 700, color: "#111", margin: 0, lineHeight: 1.7, textAlign: "left" }}>
                  <span style={{ background: "#f5c842", color: "#1a1a1a", padding: "2px 8px", borderRadius: 4 }}>형제, 자매</span>의 인적사항이 필요한 경우에는<br />
                  가까운 <span style={{ background: "#f5c842", color: "#1a1a1a", padding: "2px 8px", borderRadius: 4 }}>관공서에 방문</span>하여 확인하시기바랍니다.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={reset}
                style={{ background: "#222", border: "none", borderRadius: 999, padding: "16px 28px", fontSize: "18px", fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                🏠 첫화면
              </button>
              <button
                onClick={() => setStep("sub-doc")}
                style={{ background: "#222", border: "none", borderRadius: 999, padding: "16px 28px", fontSize: "18px", fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                ← 이전 화면
              </button>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setStep("family-notice-2")}
              style={{ background: "#1565c0", border: "none", borderRadius: 999, padding: "16px 36px", fontSize: "20px", fontWeight: 800, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}
            >
              ✓ 확인
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── FAMILY NOTICE 2 ────────────────────────────────────────
  if (step === "family-notice-2" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Content card */}
          <div style={{ flex: 1, margin: "28px 36px 20px", background: "rgba(255,255,255,0.92)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* Blue banner */}
            <div style={{ background: "linear-gradient(180deg, #1a52c8 0%, #1565c0 100%)", padding: "22px 0", textAlign: "center" }}>
              <span style={{ color: "#fff", fontSize: "38px", fontWeight: 900, letterSpacing: "0.15em" }}>[안 내]</span>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: "44px 80px", display: "flex", flexDirection: "column", gap: 36, justifyContent: "center" }}>
              {/* Bullet */}
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <span style={{ color: "#e53e3e", fontSize: "36px", lineHeight: 1.6, flexShrink: 0 }}>●</span>
                <p style={{ fontSize: "36px", fontWeight: 700, color: "#111", margin: 0, lineHeight: 1.7 }}>
                  증명서를 제출용으로 발급받고자 하는 경우에는<br />
                  증명서를 제출요구자(예:관공서, 회사, 은행 등)에게<br />
                  <span style={{ background: "#1a1a1a", color: "#f5c842", padding: "2px 8px", borderRadius: 4 }}>필요한 증명서의 종류</span>를{" "}
                  <span style={{ background: "#f5c842", color: "#1a1a1a", padding: "2px 8px", borderRadius: 4 }}>미리 확인</span>한 후 발급받으시기 바랍니다.
                </p>
              </div>

              {/* Red warning box */}
              <div style={{ border: "3px solid #e53e3e", borderRadius: 12, padding: "20px 32px", textAlign: "center" }}>
                <span style={{ fontSize: "34px", fontWeight: 800, color: "#e53e3e" }}>
                  화면에 개인정보가 노출될 수 있으므로 유의하여 주십시오.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={reset}
                style={{ background: "#222", border: "none", borderRadius: 999, padding: "16px 28px", fontSize: "18px", fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                🏠 첫화면
              </button>
              <button
                onClick={() => setStep("family-notice")}
                style={{ background: "#222", border: "none", borderRadius: 999, padding: "16px 28px", fontSize: "18px", fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                ← 이전 화면
              </button>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setStep("resident-id")}
              style={{ background: "#1565c0", border: "none", borderRadius: 999, padding: "16px 36px", fontSize: "20px", fontWeight: 800, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}
            >
              ✓ 확인
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── RESIDENT ID INPUT ────────────────────────────────────
  if (step === "resident-id" && selectedDoc) {
    const digits = residentId;
    const front = digits.slice(0, 6);
    const back = digits.slice(6, 13);

    const handleKey = (key: string) => {
      if (key === "삭제") { setResidentId(v => v.slice(0, -1)); return; }
      if (key === "정정") { setResidentId(""); return; }
      if (digits.length < 13) setResidentId(v => v + key);
    };

    const numpadKeys = ["1","2","3","4","5","6","7","8","9","삭제","0","정정"];

    const dotDisplay = (str: string, total: number) =>
      Array.from({ length: total }).map((_, i) =>
        i < str.length ? "●" : "○"
      ).join(" ");

    return (
      <PubPage><div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 30%, #a8e8d0 70%, #6dbf72 100%)" }}>
        {/* Header */}
        <div className="relative px-4 py-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 60%, #a8e8d0 100%)" }}>
          <div className="absolute top-1 left-6 w-16 h-5 bg-white rounded-full opacity-80" />
          <div className="absolute top-3 left-10 w-12 h-4 bg-white rounded-full opacity-70" />
          <div className="absolute top-2 right-16 w-20 h-6 bg-white rounded-full opacity-75" />
          <div className="flex items-center gap-3 relative">
            <span style={{ fontSize: "28px" }}>📢</span>
            <p className="text-blue-900 font-bold" style={{ fontSize: "19px" }}>
              주민등록번호를 입력한 후 <span className="underline">확인</span>을 누르십시오.
            </p>
          </div>
        </div>

        {/* Input display */}
        <div className="mx-4 mt-3 bg-white rounded-xl border-2 border-blue-400 px-6 py-4 shadow-inner">
          <p className="text-gray-700 text-center tracking-widest font-mono" style={{ fontSize: "24px", letterSpacing: "0.18em" }}>
            {dotDisplay(front, 6)}&nbsp;&nbsp;-&nbsp;&nbsp;{dotDisplay(back, 7)}
          </p>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", gap: 32, padding: "16px 48px 12px", alignItems: "stretch", minHeight: 0 }}>
          {/* Left: notice */}
          <div style={{ flex: 1, background: "rgba(255,255,255,0.85)", borderRadius: 20, padding: "28px 28px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
            <p style={{ fontSize: "20px", lineHeight: 2, color: "#1a2a4a", margin: 0, textAlign: "left", fontWeight: 600 }}>
              주민등록증을 발급받으신 분에 한하여<br />이용이 가능합니다.
            </p>
          </div>

          {/* Right: numpad */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "1fr", gap: 12 }}>
            {numpadKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                style={{
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: key === "삭제" || key === "정정" ? "20px" : "36px",
                  background:
                    key === "삭제" ? "linear-gradient(180deg,#f87171,#dc2626)" :
                    key === "정정" ? "linear-gradient(180deg,#4ade80,#16a34a)" :
                    "linear-gradient(180deg,#f0f4f8,#d8e0ea)",
                  color: key === "삭제" || key === "정정" ? "#fff" : "#1e3a5f",
                  border: "2px solid",
                  borderColor: key === "삭제" ? "#991b1b" : key === "정정" ? "#166534" : "#94a3b8",
                  borderBottomWidth: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                  transition: "transform 0.08s",
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-4 py-3 flex items-center"
          style={{ background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)" }}
        >
          {/* Left: 첫화면 / 전화면 */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="rounded-full flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all"
              style={{ width: "62px", height: "62px", background: "#e53e3e", border: "2px solid #9b2c2c" }}
            >
              <span style={{ fontSize: "20px" }}>🏠</span>
              <span className="text-white font-bold" style={{ fontSize: "11px" }}>첫화면</span>
            </button>
            <button
              onClick={() => setStep(selectedCategory?.id === "national-tax" ? "cert-type" : "sub-doc")}
              className="rounded-full flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all"
              style={{ width: "62px", height: "62px", background: "#e53e3e", border: "2px solid #9b2c2c" }}
            >
              <span style={{ fontSize: "18px" }}>←</span>
              <span className="text-white font-bold" style={{ fontSize: "11px" }}>전화면</span>
            </button>
          </div>

          {/* Center: breadcrumb */}
          <div className="flex-1 text-center">
            <p className="text-yellow-200" style={{ fontSize: "13px" }}>
              〈{selectedCategory?.name ?? "주민등록"} → {selectedDoc.name.replace(/\n/g, "")}〉
            </p>
          </div>

          {/* Right: 확인 */}
          <button
            onClick={() => digits.length === 13 && setStep(selectedCategory?.id === "national-tax" ? "taxpayer-type" : "resident-auth")}
            className="rounded-full flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all"
            style={{
              width: "62px", height: "62px",
              background: digits.length === 13 ? "#3182ce" : "#64748b",
              border: "2px solid",
              borderColor: digits.length === 13 ? "#1e4e8c" : "#334155",
              opacity: digits.length === 13 ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: "20px" }}>✓</span>
            <span className="text-white font-bold" style={{ fontSize: "11px" }}>확인</span>
          </button>
        </div>
      </div></PubPage>
    );
  }

  // ── RESIDENT AUTH ─────────────────────────────────────────
  if (step === "resident-auth" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 30%, #a8e8d0 70%, #6dbf72 100%)" }}>

          {/* Blue header bar */}
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0, textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              증명서 발급을 위한 인증 방법을 선택하여 주십시오.
            </p>
          </div>

          {/* Two auth tiles */}
          <div style={{ flex: 1, display: "flex", gap: 40, padding: "36px 100px 28px", alignItems: "stretch" }}>
            {/* 지문 */}
            <button
              onClick={() => setStep("fingerprint-scan")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              style={{
                flex: 1, background: "rgba(240,242,245,0.92)", borderRadius: 24, border: "3px solid #bbb",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 20, cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
                transition: "transform 0.08s",
              }}
            >
              <div style={{ width: 130, height: 130, background: "linear-gradient(135deg, #ffeaea 0%, #f0f4f8 100%)", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #ddd" }}>
                <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                  {/* Scan frame corners (blue) */}
                  <rect x="3" y="3" width="14" height="2.5" fill="#1565c0" rx="1.2"/>
                  <rect x="3" y="3" width="2.5" height="14" fill="#1565c0" rx="1.2"/>
                  <rect x="71" y="3" width="14" height="2.5" fill="#1565c0" rx="1.2"/>
                  <rect x="82.5" y="3" width="2.5" height="14" fill="#1565c0" rx="1.2"/>
                  <rect x="3" y="82.5" width="14" height="2.5" fill="#1565c0" rx="1.2"/>
                  <rect x="3" y="71" width="2.5" height="14" fill="#1565c0" rx="1.2"/>
                  <rect x="71" y="82.5" width="14" height="2.5" fill="#1565c0" rx="1.2"/>
                  <rect x="82.5" y="71" width="2.5" height="14" fill="#1565c0" rx="1.2"/>
                  {/* Fingerprint icon from finger-print-outline-svgrepo-com.svg */}
                  <g transform="translate(14, 14) scale(0.117)">
                    <path fill="#555" d="M390.42,75.28a10.45,10.45,0,0,1-5.32-1.44C340.72,50.08,302.35,40,256.35,40c-45.77,0-89.23,11.28-128.76,33.84C122,77,115.11,74.8,111.87,69a12.4,12.4,0,0,1,4.63-16.32A281.81,281.81,0,0,1,256.35,16c49.23,0,92.23,11.28,139.39,36.48a12,12,0,0,1,4.85,16.08A11.3,11.3,0,0,1,390.42,75.28Zm-330.79,126a11.73,11.73,0,0,1-6.7-2.16,12.26,12.26,0,0,1-2.78-16.8c22.89-33.6,52-60,86.69-78.48C209.42,65,302.35,64.72,375.16,103.6c34.68,18.48,63.8,44.64,86.69,78a12.29,12.29,0,0,1-2.78,16.8,11.26,11.26,0,0,1-16.18-2.88c-20.8-30.24-47.15-54-78.36-70.56-66.34-35.28-151.18-35.28-217.29.24-31.44,16.8-57.79,40.8-78.59,71A10,10,0,0,1,59.63,201.28ZM204.1,491a10.66,10.66,0,0,1-8.09-3.6C175.9,466.48,165,453,149.55,424c-16-29.52-24.27-65.52-24.27-104.16,0-71.28,58.71-129.36,130.84-129.36S387,248.56,387,319.84a11.56,11.56,0,1,1-23.11,0c0-58.08-48.32-105.36-107.72-105.36S148.4,261.76,148.4,319.84c0,34.56,7.39,66.48,21.49,92.4,14.8,27.6,25,39.36,42.77,58.08a12.67,12.67,0,0,1,0,17A12.44,12.44,0,0,1,204.1,491Zm165.75-44.4c-27.51,0-51.78-7.2-71.66-21.36a129.1,129.1,0,0,1-55-105.36,11.57,11.57,0,1,1,23.12,0,104.28,104.28,0,0,0,44.84,85.44c16.41,11.52,35.6,17,58.72,17a147.41,147.41,0,0,0,24-2.4c6.24-1.2,12.25,3.12,13.4,9.84a11.92,11.92,0,0,1-9.47,13.92A152.28,152.28,0,0,1,369.85,446.56ZM323.38,496a13,13,0,0,1-3-.48c-36.76-10.56-60.8-24.72-86-50.4-32.37-33.36-50.16-77.76-50.16-125.28,0-38.88,31.9-70.56,71.19-70.56s71.2,31.68,71.2,70.56c0,25.68,21.5,46.56,48.08,46.56s48.08-20.88,48.08-46.56c0-90.48-75.13-163.92-167.59-163.92-65.65,0-125.75,37.92-152.79,96.72-9,19.44-13.64,42.24-13.64,67.2,0,18.72,1.61,48.24,15.48,86.64,2.32,6.24-.69,13.2-6.7,15.36a11.34,11.34,0,0,1-14.79-7,276.39,276.39,0,0,1-16.88-95c0-28.8,5.32-55,15.72-77.76,30.75-67,98.94-110.4,173.6-110.4,105.18,0,190.71,84.24,190.71,187.92,0,38.88-31.9,70.56-71.2,70.56s-71.2-31.68-71.2-70.56C303.5,293.92,282,273,255.42,273s-48.08,20.88-48.08,46.56c0,41,15.26,79.44,43.23,108.24,22,22.56,43,35,75.59,44.4,6.24,1.68,9.71,8.4,8.09,14.64A11.39,11.39,0,0,1,323.38,496Z"/>
                  </g>
                </svg>
              </div>
              <span style={{ fontSize: "52px", fontWeight: 900, color: "#1a1a1a" }}>지문</span>
              <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2.5px solid #333", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)" }}>
                <span style={{ fontSize: "26px", color: "#222" }}>→</span>
              </div>
            </button>

            {/* 모바일 신분증 — disabled */}
            <button
              disabled
              style={{
                flex: 1, background: "linear-gradient(145deg, #e0e0e0 0%, #c8c8c8 100%)", borderRadius: 24, border: "3px solid #aaa",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 20, cursor: "not-allowed", boxShadow: "none",
                opacity: 0.5,
              }}
            >
              <svg width="110" height="90" viewBox="0 0 110 90" fill="none">
                {/* Red diamond */}
                <path d="M55 4 L82 30 L55 46 L28 30 Z" fill="#d63031"/>
                {/* Black diamond */}
                <path d="M55 24 L82 50 L55 66 L28 50 Z" fill="#2d3436"/>
                {/* Blue diamond */}
                <path d="M55 44 L82 70 L55 86 L28 70 Z" fill="#0984e3"/>
              </svg>
              <span style={{ fontSize: "44px", fontWeight: 900, color: "#4a2800" }}>모바일 신분증</span>
              <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2.5px solid #7a5500", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.4)" }}>
                <span style={{ fontSize: "26px", color: "#4a2800" }}>→</span>
              </div>
            </button>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={reset}
                style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
              >
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button
                onClick={() => setStep("resident-id")}
                style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
              >
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "16px", margin: 0, fontWeight: 600 }}>
                〈{selectedCategory?.name ?? "주민등록"} → {selectedDoc.name}〉
              </p>
            </div>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── FINGERPRINT SCAN ──────────────────────────────────────
  if (step === "fingerprint-scan" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "18px 40px", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: "38px", flexShrink: 0 }}>📢</span>
            <p style={{ fontSize: "32px", fontWeight: 900, color: "#1a2a4a", margin: 0, lineHeight: 1.2 }}>
              지문인식기에 <span style={{ color: "#1565c0" }}>오른쪽 엄지손가락</span>을 올려주세요.
            </p>
          </div>

          {/* Content box */}
          <div style={{ flex: 1, margin: "8px 16px 6px", background: "rgba(255,255,255,0.72)", borderRadius: 18, padding: "14px 20px 10px", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <p style={{ textAlign: "center", color: "#1565c0", fontSize: "22px", fontWeight: 800, margin: "0 0 14px", letterSpacing: "0.22em" }}>
              ［사 용 안 내］
            </p>

            {/* Three panels — replaced with reference image */}
            <div style={{ flex: 1, minHeight: 0, borderRadius: 12, overflow: "hidden" }}>
              <img
                src="/fingerprint-guide.png"
                alt="지문인식 사용안내"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
            </div>

            {/* Progress bar */}
            <div style={{ height: 12, background: "#b8c8d8", borderRadius: 6, marginTop: 10, overflow: "hidden" }}>
              <div style={{ width: "45%", height: "100%", background: "linear-gradient(90deg, #1565c0, #42a5f5)", borderRadius: 6 }} />
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("resident-auth")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "16px", margin: 0, fontWeight: 600 }}>
                〈주민등록 → {selectedDoc.name}〉
              </p>
            </div>
            <button
              onClick={() => setStep(selectedCategory?.id === "family-reg" ? "id-visibility" : "recipient-select")}
              style={{ background: "#3182ce", border: "none", borderRadius: 14, padding: "12px 24px", color: "#fff", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.25)" }}
            >
              인식 완료 (시뮬레이션)
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── RECIPIENT SELECT ──────────────────────────────────────
  if (step === "recipient-select" && selectedDoc) {
    const frontId = residentId.slice(0, 6);
    const displayId = frontId ? `${frontId} - *******` : "------ - *******";

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "22px 48px", display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: "42px", flexShrink: 0 }}>📢</span>
            <p style={{ fontSize: "34px", fontWeight: 900, color: "#1a2a4a", margin: 0 }}>
              발급대상자를 선택해주십시오.
            </p>
          </div>

          {/* Content box */}
          <div style={{ flex: 1, margin: "0 28px 10px", background: "rgba(255,255,255,0.78)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* Table header */}
            <div style={{ background: "linear-gradient(180deg, #5b9bd5 0%, #2f6abf 100%)", display: "grid", gridTemplateColumns: "90px 1fr 1.6fr 1fr", padding: "14px 20px 14px 16px", alignItems: "center" }}>
              {["선택", "성명", "주민등록번호", "관계"].map((col, i, arr) => (
                <span key={col} style={{ color: "#fff", fontSize: "20px", fontWeight: 700, textAlign: "center", borderRight: i < arr.length - 1 ? "1.5px solid rgba(255,255,255,0.45)" : "none" }}>
                  {col}
                </span>
              ))}
            </div>

            {/* Rows area + scroll arrows */}
            <div style={{ flex: 1, display: "flex", gap: 0, padding: "18px 16px 18px 16px" }}>
              <div style={{ flex: 1 }}>
                {/* Selectable row */}
                <button
                  onClick={() => setRecipientSelected(v => !v)}
                  style={{
                    display: "grid", gridTemplateColumns: "90px 1fr 1.6fr 1fr",
                    background: recipientSelected
                      ? "linear-gradient(180deg, #f5e07a 0%, #e8c535 100%)"
                      : "rgba(255,255,255,0.85)",
                    border: recipientSelected ? "2.5px solid #c8a010" : "2.5px solid #ccc",
                    borderRadius: 10, padding: "16px 12px", alignItems: "center",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
                    width: "100%", cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {recipientSelected ? (
                      <div style={{ width: 38, height: 38, background: "#7a1515", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #5a0e0e" }}>
                        <span style={{ color: "#fff", fontSize: "22px", fontWeight: 900, lineHeight: 1 }}>✓</span>
                      </div>
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: 7, border: "2px solid #aaa", background: "rgba(255,255,255,0.9)" }} />
                    )}
                  </div>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", textAlign: "center" }}>홍길동</span>
                  <span style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a1a", textAlign: "center", fontFamily: "monospace", letterSpacing: "0.05em" }}>{displayId}</span>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", textAlign: "center" }}>본인</span>
                </button>
              </div>

              {/* Up / pagination / down */}
              <div style={{ width: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", paddingLeft: 12 }}>
                <button style={{ width: 54, height: 54, borderRadius: "50%", background: "#dde4ec", border: "2px solid #a8b8cc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
                  <span style={{ fontSize: "26px", color: "#2d4a6a" }}>▲</span>
                </button>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#445" }}>1/1</span>
                <button style={{ width: 54, height: 54, borderRadius: "50%", background: "#dde4ec", border: "2px solid #a8b8cc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
                  <span style={{ fontSize: "26px", color: "#2d4a6a" }}>▼</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 36px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center", gap: 12 }}>
            {/* 첫화면 / 전화면 */}
            <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "22px" }}>🏠</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
            </button>
            <button onClick={() => setStep("fingerprint-scan")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
            </button>

            {/* Breadcrumb */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈{selectedCategory?.name ?? "주민등록"} → {selectedDoc.name}〉
              </p>
            </div>

            {/* 선택 */}
            <button style={{ width: 70, height: 70, borderRadius: "50%", background: "#444", border: "2px solid #222", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "22px" }}>👆</span>
              <span style={{ color: "#e53e3e", fontWeight: 800, fontSize: "13px" }}>선택</span>
            </button>

            {/* 확인 */}
            <button
              onClick={() => recipientSelected && setStep(selectedCategory?.id === "health-welfare" ? "quantity" : "notice")}
              style={{
                width: 70, height: 70, borderRadius: "50%",
                background: recipientSelected ? "#3182ce" : "#7a9ab8",
                border: recipientSelected ? "2px solid #1e4e8c" : "2px solid #506070",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: recipientSelected ? "pointer" : "default",
                flexShrink: 0,
                boxShadow: recipientSelected ? "0 3px 8px rgba(0,0,0,0.3)" : "none",
                opacity: recipientSelected ? 1 : 0.55,
              }}
            >
              <span style={{ fontSize: "24px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── NOTICE ────────────────────────────────────────────────
  if (step === "notice" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* [ 안 내 ] header */}
          <div style={{ padding: "20px 48px 14px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <p style={{ fontSize: "34px", fontWeight: 900, color: "#cc1111", margin: 0, letterSpacing: "0.35em", textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
              ［ 안 &nbsp; 내 ］
            </p>
          </div>

          {/* Content box */}
          <div style={{ flex: 1, margin: "0 28px 10px", background: "rgba(255,255,255,0.82)", borderRadius: 18, padding: "24px 40px", display: "flex", flexDirection: "column", justifyContent: "space-evenly", overflow: "hidden" }}>

            {/* Main notice paragraph */}
            <p style={{ fontSize: "28px", fontWeight: 700, color: "#1a2a4a", margin: 0, lineHeight: 1.7, textAlign: "center" }}>
              {selectedDoc.name} 발급 시 선택사항에 대해<br />
              <span style={{ color: "#1a4abf" }}>법원(등기소), 교육기관, 공공기관, 금융기관, 개인확인용</span><br />
              <span style={{ color: "#cc1111" }}>5가지 선택사항</span>으로 발급을 도와 드리겠습니다.
            </p>

            {/* Bullet 1 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ fontSize: "28px", flexShrink: 0, marginTop: 2 }}>🟠</span>
              <p style={{ fontSize: "26px", color: "#1a2a4a", margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                다른 용도로 발급을 원하시는 경우{" "}
                <span style={{ color: "#1a4abf", fontWeight: 700 }}>개별항목</span>을 선택하여 발급 가능
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 3, background: "linear-gradient(90deg, #2a9a2a, #6abf6a)", borderRadius: 2 }} />

            {/* Bullet 2 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ fontSize: "28px", flexShrink: 0, marginTop: 2 }}>🟠</span>
              <div>
                <p style={{ fontSize: "26px", color: "#1a2a4a", margin: 0, lineHeight: 1.7, fontWeight: 600 }}>
                  성년의 경우에는 <span style={{ color: "#cc1111", fontWeight: 800 }}>본인</span>,{" "}
                  미성년자인 경우에는 <span style={{ color: "#cc1111", fontWeight: 800 }}>세대주</span>만<br />
                  초본의 과거주소변동사항 중 '세대주의 성명 및 관계'를{" "}
                  <span style={{ color: "#cc1111", fontWeight: 800 }}>포함</span>하여 신청할 수 있습니다.
                </p>
                <p style={{ fontSize: "20px", color: "#556", margin: "10px 0 0", fontWeight: 500 }}>
                  ※ 미성년자의 직계존속은 확인을 위해 창구에서 교부 가능합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 36px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "22px" }}>🏠</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
            </button>
            <button onClick={() => setStep("recipient-select")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
            </button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈주민등록 → {selectedDoc.name}〉
              </p>
            </div>
            <button onClick={() => setStep("options")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: "24px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── TAX PERIOD ────────────────────────────────────────────
  if (step === "tax-period" && selectedDoc) {
    const valBox: React.CSSProperties = {
      background: "#fff", border: "2.5px solid #5a90d8", borderRadius: 12,
      padding: "10px 18px", fontSize: "40px", fontWeight: 900, color: "#1a1a1a",
      minWidth: 114, textAlign: "center" as const, display: "inline-block",
    };
    const lbl: React.CSSProperties = { fontSize: "32px", fontWeight: 700, color: "#1a1a1a" };
    const chBtn: React.CSSProperties = {
      background: "#f0f0f0", border: "2px solid #aaa", borderRadius: 12,
      padding: "10px 22px", fontSize: "28px", fontWeight: 700,
      cursor: "pointer", color: "#1a1a1a", letterSpacing: "0.25em",
    };
    const adjBtn: React.CSSProperties = {
      background: "#e8f0f8", border: "1.5px solid #7ab0d8", borderRadius: 8,
      width: 42, height: 42, fontSize: "20px", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, color: "#1a3a6a",
    };

    const renderRow = (
      which: "from" | "to",
      period: { year: number; month: number },
      setPeriod: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>,
      suffix: string
    ) => {
      const isEditing = editingPeriod === which;
      return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18, padding: "0 40px", borderBottom: which === "from" ? "1.5px solid #ccd8e8" : "none", position: "relative" }}>
          {isEditing ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <button style={adjBtn} onClick={() => setPeriod(p => ({ ...p, year: p.year + 1 }))}>▲</button>
                <span style={valBox}>{period.year}</span>
                <button style={adjBtn} onClick={() => setPeriod(p => ({ ...p, year: Math.max(2000, p.year - 1) }))}>▼</button>
              </div>
              <span style={lbl}>년</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <button style={adjBtn} onClick={() => setPeriod(p => ({ ...p, month: p.month === 12 ? 1 : p.month + 1 }))}>▲</button>
                <span style={valBox}>{period.month}</span>
                <button style={adjBtn} onClick={() => setPeriod(p => ({ ...p, month: p.month === 1 ? 12 : p.month - 1 }))}>▼</button>
              </div>
              <span style={lbl}>{suffix}</span>
              <button
                style={{ ...chBtn, background: "#d8f0d8", borderColor: "#5ab55a", color: "#2d5a2d" }}
                onClick={() => setEditingPeriod(null)}
              >완 료</button>
            </>
          ) : (
            <>
              <span style={valBox}>{period.year}</span>
              <span style={lbl}>년</span>
              <span style={valBox}>{period.month}</span>
              <span style={lbl}>{suffix}</span>
              <button style={chBtn} onClick={() => setEditingPeriod(which)}>변 경</button>
            </>
          )}
        </div>
      );
    };

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "18px 40px 14px", display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: "28px", fontWeight: 800, color: "#1a3a6a", margin: 0 }}>
              수납기간을 선택하고 확인을 누르십시오.
            </p>
          </div>

          {/* Content box */}
          <div style={{ flex: 1, margin: "0 24px 12px", background: "rgba(255,255,255,0.80)", borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }} viewBox="0 0 900 500" preserveAspectRatio="xMidYMid meet">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <ellipse key={i} cx="450" cy="250" rx={i * 75} ry={i * 38} fill="none" stroke="#4a90d9" strokeWidth="1.2" />
              ))}
            </svg>

            {renderRow("from", taxPeriodFrom, setTaxPeriodFrom, "월부터")}
            {renderRow("to", taxPeriodTo, setTaxPeriodTo, "월까지")}

            {/* Warning */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 48px", position: "relative" }}>
              <p style={{ fontSize: "22px", color: "#1a1a1a", margin: 0, textAlign: "center", lineHeight: 1.8, fontWeight: 500 }}>
                ※ 수납기간이 길어 발급이 되지 않는 경우가 있으니,<br />
                이런 경우에는{" "}
                <span style={{ color: "#cc1111", fontWeight: 700 }}>수납기간을 짧게 하여 신청해</span>
                {" "}보시기 바랍니다.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("tax-item")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
            <button
              onClick={() => setStep("id-visibility")}
              style={{ width: 70, height: 70, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
            >
              <span style={{ fontSize: "24px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── ID VISIBILITY ──────────────────────────────────────────
  if (step === "id-visibility" && selectedDoc) {
    const idPanels: { key: "public" | "private"; label: string; example: string; desc: string }[] = [
      { key: "public",  label: "공개",   example: "예]  881111 - 1112223", desc: "주민등록번호 전체를 공개합니다." },
      { key: "private", label: "비공개", example: "예]  881111 - *******", desc: "주민등록번호 뒷자리를 비공개합니다." },
    ];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0, textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              주민등록번호 공개 여부를 선택하여 주십시오.
            </p>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 40, padding: "36px 100px 28px", alignItems: "stretch" }}>
            {idPanels.map(panel => (
              <button
                key={panel.key}
                onClick={() => { setIdVisible(panel.key); setStep(selectedCategory?.id === "family-reg" ? "quantity" : "addr-visibility"); }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                style={{
                  flex: 1, background: "rgba(240,242,245,0.92)", borderRadius: 24, border: "3px solid #bbb",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 20, cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
                  transition: "transform 0.08s",
                }}
              >
                <span style={{ fontSize: 52, fontWeight: 900, color: "#1a1a1a" }}>{panel.label}</span>
                <span style={{ fontSize: 20, color: "#1565c0", fontFamily: "monospace", fontWeight: 700 }}>{panel.example}</span>
                <span style={{ fontSize: 16, color: "#444", textAlign: "center" }}>{panel.desc}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep(selectedCategory?.id === "family-reg" ? "fingerprint-scan" : "tax-period")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈{selectedCategory?.name ?? "국세증명"} → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
            <div style={{ width: 70 }} />
          </div>
        </div>
      </PubPage>
    );
  }

  // ── ADDR VISIBILITY ────────────────────────────────────────
  if (step === "addr-visibility" && selectedDoc) {
    const addrPanels: { key: "public" | "private"; label: string; example: string; desc: string }[] = [
      { key: "public",  label: "공개",   example: "예]  서울특별시 중구 세종대로 110", desc: "주소 전체를 공개합니다." },
      { key: "private", label: "비공개", example: "예]  서울특별시 중구 **** ***",     desc: "주소 상세 내역을 비공개합니다." },
    ];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0, textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              주소 공개 여부를 선택하여 주십시오.
            </p>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 40, padding: "36px 100px 28px", alignItems: "stretch" }}>
            {addrPanels.map(panel => (
              <button
                key={panel.key}
                onClick={() => { setAddrVisible(panel.key); setStep("use-purpose"); }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                style={{
                  flex: 1, background: "rgba(240,242,245,0.92)", borderRadius: 24, border: "3px solid #bbb",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 20, cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
                  transition: "transform 0.08s",
                }}
              >
                <span style={{ fontSize: 52, fontWeight: 900, color: "#1a1a1a" }}>{panel.label}</span>
                <span style={{ fontSize: 18, color: "#1565c0", fontFamily: "monospace", fontWeight: 700 }}>{panel.example}</span>
                <span style={{ fontSize: 16, color: "#444", textAlign: "center" }}>{panel.desc}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("id-visibility")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
            <div style={{ width: 70 }} />
          </div>
        </div>
      </PubPage>
    );
  }

  // ── USE PURPOSE ────────────────────────────────────────────
  if (step === "use-purpose" && selectedDoc) {
    const purposes = ["세금신고", "대출신청", "보험가입", "비자신청", "학교제출", "기타"];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0, textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              사용 용도를 선택하여 주십시오.
            </p>
          </div>
          <div style={{ flex: 1, margin: "0 36px 16px", background: "rgba(255,255,255,0.82)", borderRadius: 20, padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, width: "100%" }}>
              {purposes.map(p => (
                <button
                  key={p}
                  onClick={() => { setUsePurpose(p); setStep("submission-dest"); }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  style={{
                    height: 130, borderRadius: 20,
                    background: "rgba(255,255,255,0.92)", border: "2.5px solid #888",
                    borderBottomWidth: "4px",
                    fontSize: 30, fontWeight: 900, color: "#1a2a4a",
                    cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                    transition: "transform 0.08s",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("addr-visibility")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
            <div style={{ width: 70 }} />
          </div>
        </div>
      </PubPage>
    );
  }

  // ── SUBMISSION DEST ────────────────────────────────────────
  if (step === "submission-dest" && selectedDoc) {
    const destinations = ["금융기관", "관공서", "조합협회", "거래처", "학교", "기타"];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0, textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              제출처를 선택하여 주십시오.
            </p>
          </div>
          <div style={{ flex: 1, margin: "0 36px 16px", background: "rgba(255,255,255,0.82)", borderRadius: 20, padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, width: "100%" }}>
              {destinations.map(d => (
                <button
                  key={d}
                  onClick={() => { setSubmissionDest(d); setStep("tax-quantity"); }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  style={{
                    height: 130, borderRadius: 20,
                    background: "rgba(255,255,255,0.92)", border: "2.5px solid #888",
                    borderBottomWidth: "4px",
                    fontSize: 30, fontWeight: 900, color: "#1a2a4a",
                    cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                    transition: "transform 0.08s",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("use-purpose")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
            <div style={{ width: 70 }} />
          </div>
        </div>
      </PubPage>
    );
  }

  // ── TAX QUANTITY ───────────────────────────────────────────
  if (step === "tax-quantity" && selectedDoc) {
    const maskId = (id: string) => id.length === 13 ? id.slice(0, 6) + "-" + id[6] + "******" : id;
    const periodLabel = `${taxPeriodFrom.year}.${String(taxPeriodFrom.month).padStart(2, "0")} ~ ${taxPeriodTo.year}.${String(taxPeriodTo.month).padStart(2, "0")}`;
    const summaryRows: [string, string][] = [
      ["신청증명서", selectedDoc.name.replace(/\n/g, "")],
      ["세목", selectedTaxItem ?? "-"],
      ["수납기간", periodLabel],
      ["주민등록번호", maskId(residentId)],
      ["주소 공개", addrVisible === "public" ? "공개" : "비공개"],
      ["사용용도", usePurpose ?? "-"],
      ["제출처", submissionDest ?? "-"],
    ];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0, textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              발급 부수를 선택하여 주십시오.
            </p>
          </div>
          <div style={{ flex: 1, margin: "0 36px 16px", display: "flex", gap: 24, overflow: "hidden" }}>
            {/* Left summary */}
            <div style={{ flex: 1.2, background: "rgba(255,255,255,0.82)", borderRadius: 20, padding: "28px 32px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#1a2a4a", margin: "0 0 14px", borderBottom: "2px solid #1565c0", paddingBottom: 10 }}>신청 내용 확인</p>
              {summaryRows.map(([label, value]) => (
                <div key={label} style={{ display: "flex", borderBottom: "1px solid #dde4ef", padding: "11px 0" }}>
                  <span style={{ width: 130, fontSize: 17, color: "#555", fontWeight: 600, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 17, color: "#1a2a4a", fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
            {/* Right quantity picker */}
            <div style={{ flex: 1, background: "rgba(255,255,255,0.82)", borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#1a2a4a", margin: 0 }}>발급 부수</p>
              <div style={{ fontSize: 80, fontWeight: 900, color: "#1565c0", lineHeight: 1 }}>{taxQty}</div>
              <div style={{ display: "flex", gap: 20 }}>
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setTaxQty(n)}
                    style={{
                      width: 88, height: 88, borderRadius: 20,
                      background: taxQty === n ? "linear-gradient(180deg, #1976d2, #1565c0)" : "linear-gradient(180deg, #f0f4f8, #d8e0ea)",
                      border: "2px solid",
                      borderColor: taxQty === n ? "#0d47a1" : "#94a3b8",
                      borderBottomWidth: "4px",
                      fontSize: 36, fontWeight: 900,
                      color: taxQty === n ? "#fff" : "#1e3a5f",
                      cursor: "pointer",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 15, color: "#666", margin: 0 }}>최대 3부까지 선택 가능합니다.</p>
            </div>
          </div>
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("submission-dest")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
            <button
              onClick={() => setStep("complete")}
              style={{ width: 70, height: 70, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
            >
              <span style={{ fontSize: "24px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── LAND SIGUNGU ──────────────────────────────────────────
  if (step === "land-sigungu" && selectedDoc) {
    const DISTRICTS: Record<string, string[]> = {
      "ㄱ": ["강릉시","고성군","군산시","기장군"],
      "ㄴ": ["남원시","논산시","나주시"],
      "ㄷ": ["달서구","달성군","동해시"],
      "ㄹ": [],
      "ㅁ": ["무주군","목포시","밀양시"],
      "ㅂ": ["부안군","보성군","보령시"],
      "ㅅ": ["수원시 팔달구","순창군","서산시"],
      "ㅇ": ["완주군","익산시","임실군","영광군"],
      "ㅈ": ["전주시 덕진구","전주시 완산구","정읍시","진안군","장수군"],
      "ㅊ": ["천안시","청주시","춘천시"],
      "ㅋ": [],
      "ㅌ": ["태안군","통영시"],
      "ㅍ": ["평창군","포항시"],
      "ㅎ": ["화성시","홍천군","함안군"],
    };
    const allDistricts = Object.values(DISTRICTS).flat();
    const filtered = landConsonant === "전체" ? allDistricts : (DISTRICTS[landConsonant] ?? []);
    const consonantRows = [
      ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ"],
      ["ㅂ","ㅅ","ㅇ","ㅈ","ㅊ"],
      ["ㅋ","ㅌ","ㅍ","ㅎ","전체"],
    ];
    const breadcrumb = `〈지적, 토지, 건축 → ${selectedDoc.name}〉`;
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "28px", fontWeight: 800, margin: 0, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>해당 시군구를 선택하십시오.</p>
          </div>
          {/* Province bar */}
          <div style={{ margin: "10px 24px 0", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ flex: 1, background: "#fff", border: "2px solid #bbb", borderRadius: 8, padding: "12px 24px", fontSize: 26, fontWeight: 700, color: "#1a2a4a", textAlign: "center" }}>전북특별자치도</div>
            <button disabled style={{ background: "linear-gradient(180deg,#4caf50,#2e7d32)", borderRadius: "50%", width: 64, height: 64, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, opacity: 0.7, cursor: "not-allowed" }}>주소<br/>변경</button>
          </div>
          {/* Content */}
          <div style={{ flex: 1, margin: "10px 24px 10px", display: "flex", gap: 16, overflow: "hidden" }}>
            {/* Left: instructions + consonant keyboard */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.75)", borderRadius: 12, padding: "14px 16px", fontSize: 17, color: "#1a2a4a", lineHeight: 1.7, fontWeight: 600 }}>
                ◆ 원하시는 지역의 <span style={{ color: "#1565c0", fontWeight: 800 }}>초성</span>을 선택하여 주십시오.<br/>
                <span style={{ fontSize: 15 }}>예] "<span style={{ color: "#1565c0", fontWeight: 700 }}>경기도</span>"이면 "<span style={{ fontWeight: 700 }}>ㄱ</span>" 선택</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {consonantRows.map((row, ri) => (
                  <div key={ri} style={{ display: "flex", gap: 8 }}>
                    {row.map(c => (
                      <button key={c} onClick={() => setLandConsonant(c)}
                        style={{
                          flex: 1, height: 52, borderRadius: 10,
                          background: landConsonant === c
                            ? (c === "전체" ? "linear-gradient(180deg,#4caf50,#2e7d32)" : "#fff")
                            : "linear-gradient(180deg,#5a5a5a,#383838)",
                          border: landConsonant === c && c !== "전체" ? "2px solid #1565c0" : "1px solid #444",
                          color: landConsonant === c ? (c === "전체" ? "#fff" : "#1565c0") : "#fff",
                          fontSize: c === "전체" ? 16 : 22, fontWeight: 800, cursor: "pointer",
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Right: district list */}
            <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 6 }}>
              <button style={{ background: "linear-gradient(180deg,#5a5a5a,#383838)", height: 44, borderRadius: 8, border: "1px solid #999", color: "#aaa", fontSize: 16, cursor: "default", opacity: 0.4 }}>↑</button>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const district = filtered[i] ?? "";
                  return (
                    <button key={i}
                      onClick={() => district ? (setLandSigungu(district), setStep("land-jibun")) : undefined}
                      style={{
                        flex: 1, background: district ? "#fff" : "rgba(255,255,255,0.35)",
                        border: district ? "1.5px solid #bbb" : "1px solid rgba(180,180,180,0.4)",
                        borderRadius: 8, fontSize: 17, fontWeight: 700,
                        color: "#1a2a4a", cursor: district ? "pointer" : "default",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 14px",
                      }}>
                      <span>{district}</span>
                      {district && <span style={{ fontSize: 18 }}>👆</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ textAlign: "center", color: "#1a2a4a", fontWeight: 700, fontSize: 15, padding: "2px 0" }}>1/1</div>
              <button style={{ background: "linear-gradient(180deg,#5a5a5a,#383838)", height: 44, borderRadius: 8, border: "1px solid #999", color: "#aaa", fontSize: 16, cursor: "default", opacity: 0.4 }}>↓</button>
            </div>
          </div>
          <div style={{ padding: "8px 32px 12px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={reset} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "20px" }}>🏠</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>첫화면</span>
            </button>
            <button onClick={() => setStep("sub-doc")} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "18px", color: "#fff" }}>←</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>전화면</span>
            </button>
            <button disabled style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(180deg,#4caf50,#2e7d32)", border: "2px solid #1b5e20", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "not-allowed", opacity: 0.7 }}>
              <span style={{ fontSize: "16px" }}>((·))</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>타지역</span>
            </button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "14px", margin: 0, fontWeight: 600 }}>{breadcrumb}</p>
            </div>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── LAND JIBUN ────────────────────────────────────────────
  if (step === "land-jibun" && selectedDoc) {
    const breadcrumb = `〈지적, 토지, 건축 → ${selectedDoc.name}〉`;
    const displayVal = landJibunType === "산" ? `산 ${landJibun}` : landJibun;
    const numpadKeys = ["1","2","3","4","5","6","7","8","9","삭제","0","정정","-"];
    const rightKeys = ["일반지번","폐쇄지번","산"];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ padding: "18px 48px 14px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 36, flexShrink: 0 }}>📢</span>
            <p style={{ fontSize: "26px", fontWeight: 900, color: "#1a2a4a", margin: 0 }}>해당 지번을 입력한 후 확인을 누르십시오.</p>
          </div>
          {/* Display bar */}
          <div style={{ margin: "0 24px 14px", background: "#fff", border: "2.5px solid #5ab5f5", borderRadius: 10, padding: "14px 24px", fontSize: 28, fontWeight: 700, color: "#1a2a4a", minHeight: 58 }}>
            {displayVal || <span style={{ color: "#bbb" }}>지번 입력</span>}
          </div>
          {/* Numpad grid */}
          <div style={{ flex: 1, margin: "0 24px 10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "repeat(4,1fr)", gap: 10 }}>
            {/* Numbers in first 3 cols, special keys in col 4 */}
            {[
              {key:"1",col:1,row:1},{key:"2",col:2,row:1},{key:"3",col:3,row:1},
              {key:"4",col:1,row:2},{key:"5",col:2,row:2},{key:"6",col:3,row:2},
              {key:"7",col:1,row:3},{key:"8",col:2,row:3},{key:"9",col:3,row:3},
              {key:"삭제",col:1,row:4},{key:"0",col:2,row:4},{key:"정정",col:3,row:4},{key:"-",col:4,row:4},
            ].map(({key,col,row}) => {
              const isDelete = key === "삭제";
              const isCorrect = key === "정정";
              return (
                <button key={key}
                  onClick={() => {
                    if (isDelete) setLandJibun(p => p.slice(0,-1));
                    else if (isCorrect) setLandJibun("");
                    else if (key === "-") setLandJibun(p => p + "-");
                    else setLandJibun(p => p + key);
                  }}
                  style={{
                    gridColumn: col, gridRow: row,
                    borderRadius: 16, fontWeight: 700,
                    fontSize: isDelete || isCorrect ? "18px" : "32px",
                    background: isDelete ? "linear-gradient(180deg,#f87171,#dc2626)" : isCorrect ? "linear-gradient(180deg,#4ade80,#16a34a)" : "linear-gradient(180deg,#f0f4f8,#d8e0ea)",
                    color: isDelete || isCorrect ? "#fff" : "#1e3a5f",
                    border: "2px solid", borderColor: isDelete ? "#991b1b" : isCorrect ? "#166534" : "#94a3b8",
                    borderBottomWidth: "4px", cursor: "pointer",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                  }}>
                  {key}
                </button>
              );
            })}
            {/* Right col: type selectors */}
            {rightKeys.map((k,i) => (
              <button key={k}
                onClick={() => { if (k === "산") { setLandJibunType("산"); } else { setLandJibunType(k === "일반지번" ? "일반" : "폐쇄"); } }}
                style={{
                  gridColumn: 4, gridRow: i + 1,
                  borderRadius: 14, fontWeight: 700, fontSize: "16px",
                  background: (landJibunType === "일반" && k === "일반지번") || (landJibunType === "폐쇄" && k === "폐쇄지번") || (landJibunType === "산" && k === "산")
                    ? "linear-gradient(180deg,#fffbe6,#fef3c7)"
                    : "linear-gradient(180deg,#f0f4f8,#d8e0ea)",
                  color: "#1e3a5f",
                  border: (landJibunType === "일반" && k === "일반지번") || (landJibunType === "폐쇄" && k === "폐쇄지번") || (landJibunType === "산" && k === "산")
                    ? "2px solid #d97706"
                    : "2px solid #94a3b8",
                  borderBottomWidth: "4px",
                  cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}>
                {(landJibunType === "일반" && k === "일반지번") && <span style={{ color: "#dc2626" }}>✓</span>}
                {k}
              </button>
            ))}
          </div>
          <div style={{ padding: "8px 32px 12px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>🏠</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("land-sigungu")} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "18px", color: "#fff" }}>←</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "14px", margin: 0, fontWeight: 600 }}>{breadcrumb}</p>
            </div>
            <button onClick={() => setStep(selectedDoc.id === "bldg-reg" ? "land-history" : "land-year")}
              style={{ width: 64, height: 64, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: "22px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── LAND YEAR ─────────────────────────────────────────────
  if (step === "land-year" && selectedDoc) {
    const breadcrumb = `〈지적, 토지, 건축 → ${selectedDoc.name}〉`;
    const endYear = 2025;
    const years = [2025, 2024, 2023, 2022, 2021];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ padding: "18px 48px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: "26px", fontWeight: 900, color: "#1a2a4a", margin: 0 }}>출력할 공시지가 시작년도를 선택하십시오.</p>
          </div>
          <div style={{ flex: 1, margin: "0 24px 10px", display: "flex", gap: 20 }}>
            {/* Left: notice panel */}
            <div style={{ flex: 1, background: "rgba(255,255,255,0.75)", borderRadius: 14, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#1a2a4a", margin: 0, textAlign: "center", borderBottom: "1.5px solid #bbb", paddingBottom: 12 }}>- 안 내 -</p>
              <p style={{ fontSize: 18, color: "#1a2a4a", lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
                ◆ 출력할 <span style={{ color: "#e53e3e", fontWeight: 800 }}>공시지가 시작년도</span>를<br/>
                선택 하신 후<br/>
                확인 을 눌러주십시오.
              </p>
              <p style={{ fontSize: 18, color: "#1a2a4a", lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
                ◆ 기본값은 <span style={{ color: "#e53e3e", fontWeight: 800 }}>최근 5년</span> 입니다.
              </p>
            </div>
            {/* Right: year picker */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Range display */}
              <div style={{ background: "#fff", border: "2px solid #5ab5f5", borderRadius: 10, padding: "12px 20px", textAlign: "center", fontSize: 22, fontWeight: 800, color: "#1565c0" }}>
                {landYear} 년 부터 {endYear} 년 까지
              </div>
              {/* Year list header */}
              <button style={{ background: "linear-gradient(180deg,#5a5a5a,#383838)", height: 40, borderRadius: 8, border: "1px solid #999", color: "#aaa", fontSize: 16, cursor: "default", opacity: 0.4 }}>↑</button>
              <div style={{ background: "rgba(255,255,255,0.75)", borderRadius: 12, overflow: "hidden", border: "1px solid #bbb" }}>
                <div style={{ background: "#e0eaff", padding: "10px", textAlign: "center", fontSize: 17, fontWeight: 800, color: "#1565c0", borderBottom: "1px solid #bbb" }}>시작 년도</div>
                {years.map(y => (
                  <button key={y} onClick={() => setLandYear(y)}
                    style={{
                      width: "100%", padding: "12px", fontSize: 22, fontWeight: 700,
                      background: landYear === y ? "#5ab5f5" : "#fff",
                      color: landYear === y ? "#fff" : "#1a2a4a",
                      border: "none", borderBottom: "1px solid #dde4ef",
                      cursor: "pointer", textAlign: "center",
                    }}>
                    {y}
                  </button>
                ))}
              </div>
              <button style={{ background: "linear-gradient(180deg,#5a5a5a,#383838)", height: 40, borderRadius: 8, border: "1px solid #999", color: "#aaa", fontSize: 16, cursor: "default", opacity: 0.4 }}>↓</button>
            </div>
          </div>
          <div style={{ padding: "8px 32px 12px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>🏠</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("land-jibun")} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "18px", color: "#fff" }}>←</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "14px", margin: 0, fontWeight: 600 }}>{breadcrumb}</p>
            </div>
            <button onClick={() => setStep("land-history")}
              style={{ width: 64, height: 64, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: "22px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── LAND HISTORY ──────────────────────────────────────────
  if (step === "land-history" && selectedDoc) {
    const breadcrumb = `〈지적, 토지, 건축 → ${selectedDoc.name}〉`;
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "28px", fontWeight: 800, margin: 0, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>토지 연혁 포함 여부를 선택하여 주십시오.</p>
          </div>
          <div style={{ flex: 1, margin: "20px 40px 16px", background: "rgba(255,255,255,0.75)", borderRadius: 18, padding: "36px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 32 }}>
              {(["연혁 포함","연혁 미포함"] as const).map(opt => (
                <button key={opt}
                  onClick={() => { setLandHistory(opt === "연혁 포함" ? "포함" : "미포함"); setStep("land-owner-id"); }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  style={{
                    flex: 1, height: 110, borderRadius: 20,
                    background: "rgba(255,255,255,0.92)", border: "2.5px solid #888", borderBottomWidth: "4px",
                    fontSize: 34, fontWeight: 900, color: "#1565c0",
                    cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                    transition: "transform 0.08s",
                  }}>
                  {opt}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 18, color: "#1565c0", fontWeight: 600, margin: 0, lineHeight: 1.8 }}>
              해당토지의<br/>지목, 면적, 날짜, 원인 등의<br/>세부사항의 변동사항 출력
            </p>
          </div>
          <div style={{ padding: "8px 32px 12px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>🏠</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep(selectedDoc.id === "bldg-reg" ? "land-jibun" : "land-year")} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "18px", color: "#fff" }}>←</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "14px", margin: 0, fontWeight: 600 }}>{breadcrumb}</p>
            </div>
            <div style={{ width: 64 }} />
          </div>
        </div>
      </PubPage>
    );
  }

  // ── LAND OWNER ID ─────────────────────────────────────────
  if (step === "land-owner-id" && selectedDoc) {
    const breadcrumb = `〈지적, 토지, 건축 → ${selectedDoc.name}〉`;
    const panels = [
      {
        key: "입력" as const,
        label: "주민등록번호 입력",
        desc1: "소유주 주민등록번호와",
        desc2: <>일치하는 경우에만 <span style={{ color: "#1565c0", fontWeight: 800 }}>공개</span> 출력</>,
      },
      {
        key: "미입력" as const,
        label: "미 입 력",
        desc1: "소유주 주민등록번호를",
        desc2: <><span style={{ color: "#e53e3e", fontWeight: 800 }}>'*'</span>로 <span style={{ color: "#e53e3e", fontWeight: 800 }}>비공개</span> 출력</>,
      },
    ];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "26px", fontWeight: 800, margin: 0, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>소유주 주민등록번호 입력 여부를 선택하여 주십시오.</p>
          </div>
          <div style={{ flex: 1, margin: "20px 40px 16px", background: "rgba(255,255,255,0.75)", borderRadius: 18, padding: "36px 48px", display: "flex", gap: 32 }}>
            {panels.map(panel => (
              <div key={panel.key} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                <button
                  onClick={() => { setLandOwnerIdOpt(panel.key); setStep("land-quantity"); }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  style={{
                    width: "100%", height: 100, borderRadius: 20,
                    background: "rgba(255,255,255,0.92)", border: "2.5px solid #888", borderBottomWidth: "4px",
                    fontSize: panel.key === "입력" ? 26 : 30, fontWeight: 900, color: "#1565c0",
                    cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                    transition: "transform 0.08s",
                  }}>
                  {panel.label}
                </button>
                <p style={{ fontSize: 17, color: "#1a2a4a", lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
                  {panel.desc1}<br/>{panel.desc2}
                </p>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 32px 12px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>🏠</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("land-history")} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "18px", color: "#fff" }}>←</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "14px", margin: 0, fontWeight: 600 }}>{breadcrumb}</p>
            </div>
            <div style={{ width: 64 }} />
          </div>
        </div>
      </PubPage>
    );
  }

  // ── LAND QUANTITY ─────────────────────────────────────────
  if (step === "land-quantity" && selectedDoc) {
    const breadcrumb = `〈지적, 토지, 건축 → ${selectedDoc.name}〉`;
    const summaryRows: [string, string][] = [
      ["신청증명서", selectedDoc.name],
      ["시군구", landSigungu],
      ["지번", (landJibunType === "산" ? "산 " : "") + landJibun],
      ["공시지가", `${landYear}년 ~ 2025년`],
      ["토지 연혁", landHistory ?? "-"],
      ["소유주번호", landOwnerIdOpt === "입력" ? "입력" : "미입력('*' 처리)"],
    ];
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "28px", fontWeight: 800, margin: 0, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>발급 부수를 선택하여 주십시오.</p>
          </div>
          <div style={{ flex: 1, margin: "10px 24px 10px", display: "flex", gap: 20, overflow: "hidden" }}>
            {/* Left summary */}
            <div style={{ flex: 1.3, background: "rgba(255,255,255,0.82)", borderRadius: 18, padding: "24px 28px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#1a2a4a", margin: "0 0 12px", borderBottom: "2px solid #1565c0", paddingBottom: 10 }}>신청 내용 확인</p>
              {summaryRows.map(([label, value]) => (
                <div key={label} style={{ display: "flex", borderBottom: "1px solid #dde4ef", padding: "10px 0" }}>
                  <span style={{ width: 120, fontSize: 16, color: "#555", fontWeight: 600, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 16, color: "#1a2a4a", fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
            {/* Right quantity picker */}
            <div style={{ flex: 1, background: "rgba(255,255,255,0.82)", borderRadius: 18, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#1a2a4a", margin: 0 }}>발급 부수</p>
              <div style={{ fontSize: 80, fontWeight: 900, color: "#1565c0", lineHeight: 1 }}>{landQty}</div>
              <div style={{ display: "flex", gap: 18 }}>
                {[1,2,3].map(n => (
                  <button key={n} onClick={() => setLandQty(n)}
                    style={{
                      width: 88, height: 88, borderRadius: 20,
                      background: landQty === n ? "linear-gradient(180deg, #1976d2, #1565c0)" : "linear-gradient(180deg, #f0f4f8, #d8e0ea)",
                      border: "2px solid", borderColor: landQty === n ? "#0d47a1" : "#94a3b8", borderBottomWidth: "4px",
                      fontSize: 36, fontWeight: 900, color: landQty === n ? "#fff" : "#1e3a5f",
                      cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                    }}>
                    {n}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "#666", margin: 0 }}>최대 3부까지 선택 가능합니다.</p>
            </div>
          </div>
          <div style={{ padding: "8px 32px 12px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>🏠</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("land-owner-id")} style={{ width: 64, height: 64, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "18px", color: "#fff" }}>←</span><span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "14px", margin: 0, fontWeight: 600 }}>{breadcrumb}</p>
            </div>
            <button onClick={() => setStep("complete")}
              style={{ width: 64, height: 64, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: "22px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── CERT TYPE ─────────────────────────────────────────────
  if (step === "cert-type" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "24px 48px 18px", display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: "30px", fontWeight: 800, color: "#1a3a6a", margin: 0, textAlign: "center" }}>
              증명서 구분을 선택하여 주십시오.
            </p>
          </div>

          {/* Content box */}
          <div style={{ flex: 1, margin: "0 36px 16px", background: "rgba(255,255,255,0.82)", borderRadius: 20, padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "space-evenly", position: "relative", overflow: "hidden" }}>
            {/* Decorative watermark */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }} viewBox="0 0 900 500" preserveAspectRatio="xMidYMid meet">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <ellipse key={i} cx="450" cy="250" rx={i * 75} ry={i * 38} fill="none" stroke="#4a90d9" strokeWidth="1.2" />
              ))}
            </svg>

            {/* Description text */}
            <div style={{ position: "relative" }}>
              <p style={{ fontSize: "36px", color: "#1a2a4a", lineHeight: 1.8, margin: "0 0 16px", fontWeight: 600, textAlign: "center" }}>
                개인용(개인/개인사업자) 증명서를 발급하시려면{" "}
                <span style={{ color: "#1565c0", fontWeight: 800 }}>개인용</span>을<br />
                법인용 증명서를 발급하시려면{" "}
                <span style={{ color: "#1565c0", fontWeight: 800 }}>법인용</span>을 선택하여 주십시오.
              </p>
              <p style={{ fontSize: "34px", color: "#cc1111", fontWeight: 700, margin: 0, lineHeight: 1.5, textAlign: "center" }}>
                법인은 법인대표자만 증명서를 발급 받으실 수 있습니다.
              </p>
            </div>

            {/* Two choice buttons */}
            <div style={{ display: "flex", gap: 32, position: "relative" }}>
              <button
                onClick={() => { setResidentId(""); setStep("resident-id"); }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.92)", border: "2.5px solid #888",
                  borderRadius: 20, padding: "36px 20px", fontSize: "54px", fontWeight: 900,
                  color: "#1a2a4a", cursor: "pointer", transition: "transform 0.08s",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                }}
              >
                개인용
              </button>
              <button
                disabled
                style={{
                  flex: 1, background: "rgba(200,200,200,0.6)", border: "2.5px solid #bbb",
                  borderRadius: 20, padding: "36px 20px", fontSize: "54px", fontWeight: 900,
                  color: "#999", cursor: "not-allowed", opacity: 0.45, boxShadow: "none",
                }}
              >
                법인용
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("sub-doc")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── TAXPAYER TYPE ─────────────────────────────────────────
  if (step === "taxpayer-type" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "24px 48px 18px", display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: "30px", fontWeight: 800, color: "#1a3a6a", margin: 0, textAlign: "center" }}>
              납세자 구분을 선택하여 주십시오.
            </p>
          </div>

          {/* Content box */}
          <div style={{ flex: 1, margin: "0 36px 16px", background: "rgba(255,255,255,0.82)", borderRadius: 20, padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "space-evenly", position: "relative", overflow: "hidden" }}>
            {/* Decorative watermark */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }} viewBox="0 0 900 500" preserveAspectRatio="xMidYMid meet">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <ellipse key={i} cx="450" cy="250" rx={i * 75} ry={i * 38} fill="none" stroke="#4a90d9" strokeWidth="1.2" />
              ))}
            </svg>

            {/* Description text */}
            <p style={{ fontSize: "36px", color: "#1a2a4a", lineHeight: 1.8, margin: 0, fontWeight: 600, textAlign: "center", position: "relative" }}>
              납세자 구분이 주민등록번호이면{" "}
              <span style={{ color: "#1565c0", fontWeight: 800 }}>주민등록번호</span>를<br />
              사업자등록번호이면{" "}
              <span style={{ color: "#1565c0", fontWeight: 800 }}>사업자등록번호</span>를<br />
              선택하여 주십시오.
            </p>

            {/* Two choice buttons */}
            <div style={{ display: "flex", gap: 32, position: "relative" }}>
              <button
                onClick={() => { setTaxPage(0); setStep("tax-item"); }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.92)", border: "2.5px solid #888",
                  borderRadius: 20, padding: "36px 20px", fontSize: "42px", fontWeight: 900,
                  color: "#1a2a4a", cursor: "pointer", transition: "transform 0.08s",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                }}
              >
                주민등록번호
              </button>
              <button
                disabled
                style={{
                  flex: 1, background: "rgba(200,200,200,0.6)", border: "2.5px solid #bbb",
                  borderRadius: 20, padding: "36px 20px", fontSize: "42px", fontWeight: 900,
                  color: "#999", cursor: "not-allowed", opacity: 0.45, boxShadow: "none",
                }}
              >
                사업자등록번호
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("resident-id")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── TAX ITEM ──────────────────────────────────────────────
  if (step === "tax-item" && selectedDoc) {
    const TAX_ITEMS_ALL = [
      "전체", "종합소득세", "이자소득세",
      "배당소득세", "사업소득세", "근로소득세(갑)",
      "근로소득세(을)", "기타소득세", "연금소득세",
      "근로장려금", "자녀장려금", "퇴직소득세",
      "양도소득세", "산림소득세", "법인세",
      "부가가치세", "개별소비세", "주세",
      "인지세", "증권거래세", "교육세",
      "농어촌특별세", "종합부동산세", "상속세",
      "증여세", "원천징수세액", "가산세",
      "원천세", "특별소비세", "납부지연가산세",
    ];
    const TOTAL_PAGES = 5;
    const ITEMS_PER_PAGE = 15;
    const pageItems = TAX_ITEMS_ALL.slice(taxPage * ITEMS_PER_PAGE, (taxPage + 1) * ITEMS_PER_PAGE);

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "16px 40px 12px", display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: "28px", fontWeight: 800, color: "#1a3a6a", margin: 0 }}>
              발급을 원하는 세목을 선택하여 주십시오.
            </p>
          </div>

          {/* Content box */}
          <div style={{ flex: 1, margin: "0 20px 10px", background: "rgba(255,255,255,0.72)", borderRadius: 18, padding: "14px 12px 14px 16px", display: "flex", gap: 10, minHeight: 0 }}>

            {/* 3-column grid */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: 10 }}>
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => {
                const item = pageItems[i];
                if (!item) return <div key={i} />;
                return (
                  <button
                    key={i}
                    onClick={() => { setSelectedTaxItem(item); setEditingPeriod(null); setStep("tax-period"); }}
                    onMouseDown={e => (e.currentTarget.style.filter = "brightness(0.90)")}
                    onMouseUp={e => (e.currentTarget.style.filter = "")}
                    onMouseLeave={e => (e.currentTarget.style.filter = "")}
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      border: "1.5px solid #aaa",
                      borderRadius: 12,
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#1a1a1a",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                      transition: "filter 0.08s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 10px",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Pagination column */}
            <div style={{ width: 66, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <button
                onClick={() => setTaxPage(p => Math.max(0, p - 1))}
                style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.88)", border: "1.5px solid #aaa", cursor: taxPage > 0 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: taxPage > 0 ? 1 : 0.4 }}
              >
                <span style={{ fontSize: "28px", color: "#1a3a6a" }}>▲</span>
              </button>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#1a3a6a" }}>
                {taxPage + 1}/{TOTAL_PAGES}
              </span>
              <button
                onClick={() => setTaxPage(p => Math.min(TOTAL_PAGES - 1, p + 1))}
                style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.88)", border: "1.5px solid #aaa", cursor: taxPage < TOTAL_PAGES - 1 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: taxPage < TOTAL_PAGES - 1 ? 1 : 0.4 }}
              >
                <span style={{ fontSize: "28px", color: "#1a3a6a" }}>▼</span>
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("taxpayer-type")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈국세증명 → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── AUTH SELECT ───────────────────────────────────────────
  if (step === "auth-select") {
    return (
      <PubPage>
        <SkyHeader onBack={() => selectedCategory?.subDocs ? setStep("sub-doc") : setStep("main")} />

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <p className="text-gray-500 text-sm">{selectedDoc?.name}</p>
            <p className="text-gray-800 font-bold" style={{ fontSize: "18px" }}>
              본인 인증 방법을 선택하세요
            </p>
          </div>

          <div className="space-y-3">
            {AUTH_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setAuthMethod(opt.id);
                  setStep(opt.id === "certificate" ? "auth-pin" : "auth-scan");
                }}
                className="w-full rounded-xl flex items-center gap-4 px-5 py-5 shadow-md active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(180deg, #6a6a6a 0%, #484848 100%)",
                  border: "1px solid #222",
                }}
              >
                <span style={{ fontSize: "40px" }}>{opt.emoji}</span>
                <div className="text-left">
                  <p className="text-white font-bold" style={{ fontSize: "18px" }}>{opt.label}</p>
                  <p className="text-gray-300 mt-0.5" style={{ fontSize: "13px" }}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mt-4">
            <p className="text-yellow-800" style={{ fontSize: "14px", lineHeight: "1.6" }}>
              ⚠️ 본인이 직접 신청하는 경우에만 발급이 가능합니다.<br />
              타인의 서류를 무단 발급하는 것은 불법입니다.
            </p>
          </div>
        </div>

        <GreenBar navigate={navigate} />
      </PubPage>
    );
  }

  // ── AUTH SCAN ─────────────────────────────────────────────
  if (step === "auth-scan") {
    const authLabel = AUTH_OPTIONS.find((a) => a.id === authMethod)?.label ?? "신분증";
    return (
      <PubPage>
        <SkyHeader onBack={() => setStep("auth-select")} />

        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="bg-white rounded-2xl p-6 w-full shadow-md text-center">
            <p className="text-gray-500 mb-1" style={{ fontSize: "15px" }}>본인 인증 — {authLabel}</p>
            <p className="text-gray-900 font-bold" style={{ fontSize: "22px" }}>
              카드를 스캐너에 올려놓으세요
            </p>
          </div>

          <div className="bg-white border-4 border-dashed border-gray-400 rounded-2xl p-10 w-full text-center shadow-inner">
            <span style={{ fontSize: "80px" }}>
              {authMethod === "license" ? "🚗" : authMethod === "health-card" ? "🏥" : "🪪"}
            </span>
            <p className="text-gray-600 mt-4 font-semibold" style={{ fontSize: "16px" }}>
              ↑ 이곳에 카드를 올려놓으세요
            </p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>사진이 위로 향하게 반듯하게 놓으세요</p>
          </div>

          <button
            onClick={() => setStep("options")}
            className="w-full rounded-2xl py-6 shadow-xl active:scale-95 transition-all text-white font-bold"
            style={{
              background: "linear-gradient(180deg, #5a5a5a 0%, #383838 100%)",
              fontSize: "20px",
            }}
          >
            카드 인식 완료 (시뮬레이션)
          </button>
        </div>

        <GreenBar navigate={navigate} />
      </PubPage>
    );
  }

  // ── AUTH PIN ──────────────────────────────────────────────
  if (step === "auth-pin") {
    return (
      <PubPage>
        <SkyHeader onBack={() => setStep("auth-select")} />

        <div className="flex-1 flex flex-col p-5 gap-5">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-gray-500 text-sm mb-1">공인(금융)인증서 인증</p>
            <p className="text-gray-900 font-bold" style={{ fontSize: "20px" }}>
              인증서 비밀번호를 입력하세요
            </p>
            <p className="text-gray-400 text-sm mt-1">6자리 비밀번호</p>
          </div>

          <div className="flex justify-center gap-4 py-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-11 h-11 rounded-full border-4 transition-all ${
                  pin.length > i ? "bg-gray-700 border-gray-700" : "bg-white border-gray-400"
                }`}
              />
            ))}
          </div>

          <div className="max-w-xs mx-auto w-full">
            <GovNumpad value={pin} maxLen={6} onChange={setPin} />
          </div>

          {pin.length === 6 && (
            <button
              onClick={() => setStep("options")}
              className="w-full rounded-xl py-6 shadow-xl active:scale-95 transition-all text-white font-bold"
              style={{ background: "linear-gradient(180deg, #5a5a5a 0%, #383838 100%)", fontSize: "20px" }}
            >
              인증 완료
            </button>
          )}
        </div>

        <GreenBar navigate={navigate} />
      </PubPage>
    );
  }

  // ── OPTIONS ───────────────────────────────────────────────
  if (step === "options" && selectedDoc) {
    const prevStep = selectedCategory?.id === "resident" ? "notice" : authMethod === "certificate" ? "auth-pin" : "auth-scan";

    const PURPOSES = ["법원(등기소)", "교육기관", "공공기관", "금융기관", "개인확인"];

    type OptRow = { id: string; label: string; sub?: string; choices?: string[] };
    const OPT_ROWS: OptRow[] = [
      { id: "1", label: "1. 개인 인적 사항 변경 내용" },
      { id: "2", label: "2. 과거의 주소 변동 사항", choices: ["전체포함", "직접입력", "최근5년", "미포함"] },
      { id: "3", label: "3. 과거의 주소 변동 사항 중\n   세대주의 성명과 세대주와의 관계", sub: "□포함 선택 가능 자: 성년인 본인, 미성년자의 세대주" },
      { id: "4", label: "4. 주민등록번호 뒷자리" },
      { id: "5", label: "5. 세대주의 성명과 세대주와의 관계", sub: "□포함 선택 가능 자: 성년인 본인, 미성년자의 세대주" },
      { id: "6", label: "6. 발생일 / 신고일" },
      { id: "7", label: "7. 변동 사유" },
      { id: "8", label: "8. 병역 사항", choices: ["기본(입영/전역일자)", "전체", "미포함"] },
      { id: "9", label: "9. 국내거소신고번호 / 외국인등록번호" },
    ];

    const getVal = (id: string) => optionIncludes[id] ?? "미포함";
    const setVal = (id: string, val: string) =>
      setOptionIncludes(prev => ({ ...prev, [id]: val }));
    const setAll = (include: boolean) => {
      const all: Record<string, string> = {};
      OPT_ROWS.forEach(r => {
        all[r.id] = include ? (r.choices ? r.choices[0] : "포함") : "미포함";
      });
      setOptionIncludes(all);
    };

    const btnBase: React.CSSProperties = {
      display: "flex", alignItems: "center", gap: 3,
      border: "1.5px solid #888", borderRadius: 5,
      padding: "3px 8px", cursor: "pointer", flexShrink: 0,
      fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" as const,
    };
    const Radio = ({ id, val, label }: { id: string; val: string; label: string }) => {
      const active = getVal(id) === val;
      return (
        <button onClick={() => setVal(id, val)} style={{ ...btnBase, background: active ? "#d8d0c0" : "#ececec", color: active ? "#1a1a1a" : "#444", fontWeight: active ? 800 : 600 }}>
          <span style={{ fontSize: "9px", marginRight: 2 }}>{active ? "●" : "○"}</span>{label}
        </button>
      );
    };

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Blue header bar */}
          <div style={{ background: "linear-gradient(180deg, #b8d8f0 0%, #d0e8f8 100%)", padding: "12px 24px", borderBottom: "2px solid #90b8d8" }}>
            <p style={{ fontSize: "17px", fontWeight: 700, color: "#1a2a4a", margin: 0, textAlign: "center" }}>
              개인정보 보호를 위해 아래의 초본 사항 중 필요한 사항을 선택하신 후 확인 버튼을 누르십시오.
            </p>
          </div>

          {/* Content */}
          <div style={{ flex: 1, margin: "6px 14px 6px", background: "rgba(255,255,255,0.86)", borderRadius: 12, display: "flex", overflow: "hidden" }}>

            {/* Left: purpose buttons */}
            <div style={{ width: 148, display: "flex", flexDirection: "column", gap: 6, padding: "10px 8px 10px 10px", borderRight: "1px solid #ccc" }}>
              {PURPOSES.map(p => (
                <button key={p} onClick={() => setPurpose(p === purpose ? "" : p)} style={{
                  flex: 1, background: purpose === p ? "#d8e8d8" : "#f4f4f4",
                  border: "1.5px solid #999", borderRadius: 8,
                  fontSize: "15px", fontWeight: purpose === p ? 800 : 600,
                  cursor: "pointer", color: "#1a1a1a",
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Green arrow divider */}
            <div style={{ width: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,255,255,0)" }}>
              <div style={{ width: 18, height: "75%", background: "linear-gradient(180deg, #5abf5a, #2a8a2a)", borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: "13px" }}>▶</span>
              </div>
            </div>

            {/* Right: options */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 12px 6px", minWidth: 0 }}>

              {/* 전체포함 / 전체미포함 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 6 }}>
                <button onClick={() => setAll(true)} style={{ ...btnBase, fontSize: "14px", padding: "5px 16px", background: "#e8e8e8", fontWeight: 700 }}>전체 포함</button>
                <button onClick={() => setAll(false)} style={{ ...btnBase, fontSize: "14px", padding: "5px 16px", background: "#e8e8e8", fontWeight: 700 }}>전체 미포함</button>
              </div>

              {/* Option rows */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {OPT_ROWS.map((row, i) => (
                  <div key={row.id} style={{
                    flex: row.sub ? 1.5 : 1,
                    display: "flex", alignItems: "center",
                    borderBottom: i < OPT_ROWS.length - 1 ? "1px solid #ddd" : "none",
                    gap: 8, paddingLeft: 4,
                  }}>
                    {/* Label */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#8b1a1a", margin: 0, whiteSpace: "pre-line", lineHeight: 1.35 }}>
                        {row.label}
                      </p>
                      {row.sub && (
                        <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0", fontWeight: 500 }}>{row.sub}</p>
                      )}
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      {!row.choices ? (
                        <>
                          <Radio id={row.id} val="포함" label="포함" />
                          <Radio id={row.id} val="미포함" label="미포함" />
                        </>
                      ) : row.id === "8" ? (
                        <>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#333" }}>포함(</span>
                          <Radio id={row.id} val="기본(입영/전역일자)" label="기본(입영/전역일자)" />
                          <span style={{ fontSize: "12px", color: "#333" }}>,</span>
                          <Radio id={row.id} val="전체" label="전체" />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#333" }}>)</span>
                          <Radio id={row.id} val="미포함" label="미포함" />
                        </>
                      ) : (
                        row.choices.map(c => <Radio key={c} id={row.id} val={c} label={c} />)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: "12px", color: "#555", margin: "4px 0 0", fontWeight: 500 }}>
                ※ 선택사항의 변동이 없을 경우 발급을 진행하여 주시기 바랍니다.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 36px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "22px" }}>🏠</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
            </button>
            <button onClick={() => setStep(prevStep)} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
            </button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈주민등록 → {selectedDoc.name}〉
              </p>
            </div>
            <button onClick={() => setStep("fee-exemption")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: "24px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── FEE EXEMPTION ─────────────────────────────────────────
  if (step === "fee-exemption" && selectedDoc) {
    const goldBg = "linear-gradient(145deg, #f5e07a 0%, #e8c840 50%, #d4a820 100%)";
    const goldBtn = "linear-gradient(180deg, #e8c840 0%, #c8a010 100%)";
    const grayBg = "linear-gradient(180deg, #f0f2f5 0%, #e4e8ec 100%)";
    const grayBtn = "linear-gradient(180deg, #dde0e5 0%, #c4c8cc 100%)";

    const Panel = ({ id, label, selected, onSelect }: { id: "exempt" | "not-exempt"; label: string; selected: boolean; onSelect: () => void }) => (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: selected ? goldBg : grayBg,
        borderRight: id === "exempt" ? "2px solid #aaa" : "none",
        transition: "background 0.15s",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 28px" }}>
          <p style={{ fontSize: "40px", fontWeight: 900, color: selected ? "#4a2800" : "#1a2a4a", margin: 0, textAlign: "center", lineHeight: 1.45 }}>
            {label}
          </p>
        </div>
        <button
          onClick={onSelect}
          style={{
            padding: "22px", border: "none", cursor: "pointer",
            background: selected ? goldBtn : grayBtn,
            borderTop: `2px solid ${selected ? "#b89010" : "#aaa"}`,
            fontSize: "36px", fontWeight: 900,
            color: selected ? "#4a2800" : "#1a2a4a",
            letterSpacing: "0.55em", transition: "filter 0.1s",
          }}
          onMouseDown={e => (e.currentTarget.style.filter = "brightness(0.92)")}
          onMouseUp={e => (e.currentTarget.style.filter = "")}
          onMouseLeave={e => (e.currentTarget.style.filter = "")}
        >
          선 &nbsp; 택
        </button>
      </div>
    );

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ padding: "22px 40px 16px", display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: "28px", fontWeight: 800, color: "#1a3a6a", margin: 0, textAlign: "center" }}>
              수수료 면제 대상 여부를 선택하여 주십시오.
            </p>
          </div>

          {/* Two panels */}
          <div style={{ flex: 1, display: "flex", margin: "0 48px 14px", borderRadius: 16, overflow: "hidden", border: "2px solid #aaa", boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
            <Panel id="exempt" label={"수수료 면제\n대상자"} selected={selectedFeeOption === "exempt"} onSelect={() => setSelectedFeeOption("exempt")} />
            <Panel id="not-exempt" label={"수수료 면제\n대상자 아님"} selected={selectedFeeOption === "not-exempt"} onSelect={() => setSelectedFeeOption("not-exempt")} />
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 36px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "22px" }}>🏠</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
            </button>
            <button onClick={() => setStep("options")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
            </button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈주민등록 → {selectedDoc.name}〉
              </p>
            </div>
            <button
              onClick={() => selectedFeeOption && setStep("quantity")}
              style={{
                width: 70, height: 70, borderRadius: "50%",
                background: selectedFeeOption ? "#3182ce" : "#7a9ab8",
                border: selectedFeeOption ? "2px solid #1e4e8c" : "2px solid #506070",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: selectedFeeOption ? "pointer" : "default",
                flexShrink: 0, opacity: selectedFeeOption ? 1 : 0.55,
                boxShadow: selectedFeeOption ? "0 3px 8px rgba(0,0,0,0.3)" : "none",
              }}
            >
              <span style={{ fontSize: "24px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── QUANTITY ──────────────────────────────────────────────
  if (step === "quantity" && selectedDoc) {
    const OPT_LABELS = [
      "개인 인적 사항 변경 내용",
      "과거의 주소 변동 사항",
      "과거의 주소 변동 사항 중 세대주의 성명과 세대주와의 관계",
      "주민등록번호 뒷자리",
      "세대주의 성명과 세대주와의 관계",
      "발생일 / 신고일",
      "변동 사유",
      "병역 사항",
      "국내거소신고번호 / 외국인등록번호",
    ];

    const formatOpt = (val: string) => {
      if (!val || val === "미포함") return "[미포함]";
      if (val === "포함") return "[포함]";
      if (val === "전체포함") return "[포함(전체)]";
      if (val === "최근5년") return "[포함(최근5년)]";
      if (val === "직접입력") return "[포함(직접입력)]";
      return `[포함(${val})]`;
    };

    const feeLabel = selectedFeeOption === "exempt" ? "면제 대상자" : "일반 (면제 아님)";

    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 100%)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: "28px", fontWeight: 800, color: "#1a3a6a", margin: 0, textAlign: "center" }}>
              발급할 부수를 입력한 후 확인을 누르십시오.
            </p>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: "flex", gap: 20, margin: "10px 24px 10px", minHeight: 0 }}>

            {/* Left: summary */}
            <div style={{ flex: 1.2, background: "rgba(255,255,255,0.88)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4, overflow: "hidden" }}>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#1a3a6a", margin: 0 }}>
                신청증명서&nbsp; <span style={{ fontWeight: 700 }}>{selectedDoc.name}</span>
              </p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#1a3a6a", margin: 0 }}>
                교부대상자&nbsp; <span style={{ fontWeight: 700 }}>홍**</span>
              </p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#1a3a6a", margin: 0 }}>
                수수료면제&nbsp; <span style={{ fontWeight: 700 }}>{feeLabel}</span>
              </p>
              {selectedCategory?.id !== "family-reg" && (
                <>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "#1a3a6a", margin: "10px 0 4px" }}>선택항목</p>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    {OPT_LABELS.map((label, i) => {
                      const val = optionIncludes[String(i + 1)] ?? "미포함";
                      const tag = formatOpt(val);
                      return (
                        <p key={i} style={{ fontSize: "16px", color: "#1a1a1a", margin: "3px 0", lineHeight: 1.5 }}>
                          {i + 1}.&nbsp;<span style={{ color: "#1a3a6a", fontWeight: 700 }}>{tag}</span>&nbsp;{label}
                        </p>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right: numpad */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Quantity display */}
              <div style={{ background: "rgba(255,255,255,0.9)", border: "2.5px solid #4a90d9", borderRadius: 12, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#1a3a6a" }}>발급부수</span>
                <span style={{ fontSize: "52px", fontWeight: 900, color: "#1a3a6a" }}>{quantity}</span>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#1a3a6a" }}>부</span>
              </div>

              {/* Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < quantity * 2 ? "#4a90d9" : "#b0c0d0" }} />
                ))}
              </div>

              <p style={{ fontSize: "16px", color: "#1a3a6a", textAlign: "center", margin: 0, fontWeight: 600 }}>
                최대 9부까지 선택 가능합니다.
              </p>

              {/* 1–9 numpad */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gap: 10 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuantity(n)}
                    style={{
                      borderRadius: 18,
                      fontSize: "42px",
                      fontWeight: 700,
                      background: quantity === n
                        ? "linear-gradient(180deg, #b8d4f0 0%, #8ab0e0 100%)"
                        : "linear-gradient(180deg, #f0f4f8 0%, #d8e0ea 100%)",
                      color: "#1a3a6a",
                      border: quantity === n ? "2.5px solid #4a80c8" : "2px solid #94a3b8",
                      borderBottomWidth: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                      transition: "transform 0.08s",
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.94)")}
                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 36px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "22px" }}>🏠</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
            </button>
            <button onClick={() => setStep("fee-exemption")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
            </button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈주민등록 → {selectedDoc.name}〉
              </p>
            </div>
            <button
              onClick={() => setStep(selectedDoc.fee === 0 ? "complete" : "payment")}
              style={{ width: 70, height: 70, borderRadius: "50%", background: "#3182ce", border: "2px solid #1e4e8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
            >
              <span style={{ fontSize: "24px", color: "#fff" }}>✓</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>확인</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  // ── PAYMENT ───────────────────────────────────────────────
  if (step === "payment" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Blue header */}
          <div style={{ background: "linear-gradient(180deg, #1565c0 0%, #1976d2 100%)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0, textAlign: "center", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              결제 수단을 선택하여 주십시오.
            </p>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: "flex", gap: 32, padding: "28px 60px 20px", alignItems: "stretch" }}>

            {/* Left: 발급 내역 */}
            <div style={{ flex: 1, background: "rgba(255,255,255,0.90)", borderRadius: 20, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#1a3a6a", margin: 0, borderBottom: "2px solid #d0daea", paddingBottom: 14 }}>
                발급 내역 확인
              </p>
              {[
                { label: "서류명", value: selectedDoc.name.replace(/\n/g, " ") },
                { label: "발급 매수", value: `${quantity}매` },
                { label: "1매당 수수료", value: `${selectedDoc.fee.toLocaleString()}원` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "22px", color: "#555", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: "22px", color: "#1a1a1a", fontWeight: 700 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #d0daea", paddingTop: 16, marginTop: 4 }}>
                <span style={{ fontSize: "26px", color: "#1a3a6a", fontWeight: 800 }}>합계 수수료</span>
                <span style={{ fontSize: "32px", color: "#1a3a6a", fontWeight: 900 }}>{totalFee.toLocaleString()}원</span>
              </div>
            </div>

            {/* Right: 결제 버튼 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              <button
                onClick={() => setStep("complete")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                style={{ flex: 1, background: "linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)", borderRadius: 24, border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.20)", transition: "transform 0.08s" }}
              >
                <span style={{ fontSize: "64px" }}>💳</span>
                <span style={{ fontSize: "32px", fontWeight: 900, color: "#fff" }}>카드 결제</span>
              </button>
              <button
                onClick={() => setStep("complete")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                style={{ flex: 1, background: "linear-gradient(180deg, #2e7d32 0%, #1b5e20 100%)", borderRadius: 24, border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.20)", transition: "transform 0.08s" }}
              >
                <span style={{ fontSize: "64px" }}>💵</span>
                <span style={{ fontSize: "32px", fontWeight: 900, color: "#fff" }}>현금 결제</span>
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 40px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px" }}>🏠</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
              </button>
              <button onClick={() => setStep("quantity")} style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "20px", color: "#fff" }}>←</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>전화면</span>
              </button>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈{selectedCategory?.name ?? ""} → {selectedDoc.name.replace(/\n/g, "")}〉
              </p>
            </div>
            <div style={{ width: 70 }} />
          </div>
        </div>
      </PubPage>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────
  if (step === "complete" && selectedDoc) {
    return (
      <PubPage>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #4dc8f0 0%, #7dd8f5 35%, #a8e8d0 72%, #6dbf72 100%)" }}>

          {/* Centered content box */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 48px 10px" }}>
            <div style={{
              width: "100%",
              background: "rgba(255,255,255,0.93)",
              borderRadius: 22,
              border: "3px solid #7ab8e8",
              padding: "52px 64px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              boxShadow: "0 6px 30px rgba(0,0,0,0.12)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative ellipse watermark */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }} viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <ellipse key={i} cx="450" cy="230" rx={i * 70} ry={i * 35} fill="none" stroke="#4a90d9" strokeWidth="1.2" />
                ))}
              </svg>

              <p style={{ fontSize: "54px", fontWeight: 900, color: "#1a3a6a", margin: 0, textAlign: "center", lineHeight: 1.2, position: "relative" }}>
                증명서 발급이 완료 되었습니다.
              </p>
              <p style={{ fontSize: "36px", fontWeight: 700, color: "#00a87a", margin: 0, textAlign: "center", position: "relative" }}>
                배출구에서 증명서를 수령하십시오.
              </p>
              <p style={{ fontSize: "22px", color: "#333", margin: 0, textAlign: "center", lineHeight: 1.8, position: "relative" }}>
                ※ 휴대 전화, 지갑,&nbsp;
                <span style={{ color: "#cc1111", fontWeight: 700 }}>신용카드</span>&nbsp;
                등의 귀중품 등을<br />
                두고 가시는 일이 없도록&nbsp;
                <span style={{ color: "#cc1111", fontWeight: 700 }}>주의</span>
                하시기 바랍니다.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: "10px 36px 14px", background: "linear-gradient(180deg, #5ab55a 0%, #2d7d2d 100%)", display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ color: "#f5e642", fontSize: "15px", margin: 0, fontWeight: 600 }}>
                〈주민등록 → {selectedDoc.name}〉
              </p>
            </div>
            <button
              onClick={reset}
              style={{ width: 70, height: 70, borderRadius: "50%", background: "#e53e3e", border: "2px solid #9b2c2c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }}
            >
              <span style={{ fontSize: "22px" }}>🏠</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>첫화면</span>
            </button>
          </div>
        </div>
      </PubPage>
    );
  }

  return null;
}

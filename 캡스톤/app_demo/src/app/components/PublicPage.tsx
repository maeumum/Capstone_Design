import { useNavigate } from "react-router";
import { useState } from "react";
import { Check, Plus, Minus, Search } from "lucide-react";

type Step =
  | "main"
  | "sub-doc"
  | "auth-select"
  | "auth-scan"
  | "auth-pin"
  | "options"
  | "payment"
  | "complete";

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
  hasIdOption?: boolean;
  hasAddressOption?: boolean;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "resident", name: "주민등록", fee: "200원",
    subDocs: [
      { id: "res-copy", name: "주민등록등본", fee: 200, hasIdOption: true, hasAddressOption: true },
      { id: "res-abstract", name: "주민등록초본", fee: 200, hasIdOption: true, hasAddressOption: true },
    ],
  },
  {
    id: "land", name: "지적, 토지, 건축", fee: "수수료: 다음화면",
    subDocs: [
      { id: "land-reg", name: "토지대장", fee: 500 },
      { id: "bldg-reg", name: "건축물대장", fee: 500 },
      { id: "land-use", name: "토지이용계획확인서", fee: 1500 },
      { id: "cadastral", name: "지적도", fee: 500 },
    ],
  },
  { id: "vehicle", name: "차량", fee: "수수료: 다음화면" },
  { id: "health-welfare", name: "보건복지", fee: "무료" },
  { id: "farmland", name: "농지대장, 농업경영체", fee: "수수료: 다음화면" },
  {
    id: "family-reg", name: "가족관계등록부", fee: "500원",
    subDocs: [
      { id: "family", name: "가족관계증명서", fee: 500, hasIdOption: true },
      { id: "basic", name: "기본증명서", fee: 500, hasIdOption: true },
      { id: "marriage", name: "혼인관계증명서", fee: 500, hasIdOption: true },
      { id: "adoption", name: "입양관계증명서", fee: 500, hasIdOption: true },
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
  { id: "national-tax", name: "국세증명", fee: "무료" },
  { id: "health-ins", name: "건강보험", fee: "무료" },
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

  const reset = () => {
    setStep("main");
    setSelectedCategory(null);
    setSelectedDoc(null);
    setAuthMethod(null);
    setQuantity(1);
    setShowId(true);
    setIncludeAddr(false);
    setPin("");
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
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
        <SkyHeader />

        {/* Button grid */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryTap(cat)}
                className="rounded-xl flex flex-col items-center justify-center py-3 px-1 shadow-md active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(180deg, #6a6a6a 0%, #484848 50%, #383838 100%)",
                  border: "1px solid #222",
                  minHeight: "72px",
                }}
              >
                <span
                  className="text-white text-center leading-tight"
                  style={{ fontSize: "14px", fontWeight: "700", whiteSpace: "pre-line" }}
                >
                  {cat.name}
                </span>
                <span
                  className="text-center mt-1 leading-tight"
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: cat.fee === "무료" ? "#86efac" :
                      cat.fee.startsWith("수수료") ? "#fcd34d" : "#fbbf24",
                    whiteSpace: "pre-line",
                  }}
                >
                  {cat.fee}
                </span>
              </button>
            ))}
          </div>
        </div>

        <GreenBar navigate={navigate} />
      </div>
    );
  }

  // ── SUB DOCUMENT ──────────────────────────────────────────
  if (step === "sub-doc" && selectedCategory?.subDocs) {
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
        <SkyHeader onBack={() => setStep("main")} />

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <p className="text-gray-700 font-bold" style={{ fontSize: "17px" }}>
              📋 {selectedCategory.name} — 발급받을 서류를 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectedCategory.subDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => { setSelectedDoc(doc); setStep("auth-select"); }}
                className="rounded-xl flex flex-col items-center justify-center py-6 px-2 shadow-md active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(180deg, #6a6a6a 0%, #484848 50%, #383838 100%)",
                  border: "1px solid #222",
                  minHeight: "90px",
                }}
              >
                <span className="text-white font-bold text-center" style={{ fontSize: "17px" }}>
                  {doc.name}
                </span>
                <span className="text-yellow-300 mt-2 font-semibold" style={{ fontSize: "14px" }}>
                  {doc.fee > 0 ? `${doc.fee.toLocaleString()}원` : "무료"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <GreenBar navigate={navigate} />
      </div>
    );
  }

  // ── AUTH SELECT ───────────────────────────────────────────
  if (step === "auth-select") {
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
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
      </div>
    );
  }

  // ── AUTH SCAN ─────────────────────────────────────────────
  if (step === "auth-scan") {
    const authLabel = AUTH_OPTIONS.find((a) => a.id === authMethod)?.label ?? "신분증";
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
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
      </div>
    );
  }

  // ── AUTH PIN ──────────────────────────────────────────────
  if (step === "auth-pin") {
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
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
      </div>
    );
  }

  // ── OPTIONS ───────────────────────────────────────────────
  if (step === "options" && selectedDoc) {
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
        <SkyHeader onBack={() => setStep(authMethod === "certificate" ? "auth-pin" : "auth-scan")} />

        <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">발급 옵션 설정</p>
            <p className="text-gray-900 font-bold" style={{ fontSize: "19px" }}>{selectedDoc.name}</p>
          </div>

          {/* 매수 선택 */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-800 font-bold mb-4" style={{ fontSize: "17px" }}>발급 매수</p>
            <div className="flex items-center justify-between">
              <p className="text-gray-500" style={{ fontSize: "15px" }}>
                1매당 {selectedDoc.fee > 0 ? `${selectedDoc.fee.toLocaleString()}원` : "무료"}
              </p>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center active:scale-95 transition-all"
                >
                  <Minus size={20} strokeWidth={3} />
                </button>
                <span className="font-bold w-8 text-center" style={{ fontSize: "28px" }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                  className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center active:scale-95 transition-all"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
            <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>최대 5매까지 발급 가능합니다</p>
          </div>

          {/* 주민번호 표기 */}
          {selectedDoc.hasIdOption && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-gray-800 font-bold mb-4" style={{ fontSize: "17px" }}>주민등록번호 표기</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: true, label: "전체 표기", sub: "13자리 전체" },
                  { val: false, label: "뒤 6자리 생략", sub: "앞 7자리만" },
                ].map(({ val, label, sub }) => (
                  <button
                    key={String(val)}
                    onClick={() => setShowId(val)}
                    className={`rounded-xl py-4 border-4 text-center active:scale-95 transition-all ${
                      showId === val ? "border-gray-700 bg-gray-700 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <p className="font-bold" style={{ fontSize: "15px" }}>{label}</p>
                    <p className="mt-1 opacity-70" style={{ fontSize: "12px" }}>{sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 주소변동 */}
          {selectedDoc.hasAddressOption && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-gray-800 font-bold mb-4" style={{ fontSize: "17px" }}>주소 변동사항</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: false, label: "현재 주소만", sub: "최근 주소만 포함" },
                  { val: true, label: "변동사항 포함", sub: "이력 전체 포함" },
                ].map(({ val, label, sub }) => (
                  <button
                    key={String(val)}
                    onClick={() => setIncludeAddr(val)}
                    className={`rounded-xl py-4 border-4 text-center active:scale-95 transition-all ${
                      includeAddr === val ? "border-gray-700 bg-gray-700 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <p className="font-bold" style={{ fontSize: "15px" }}>{label}</p>
                    <p className="mt-1 opacity-70" style={{ fontSize: "12px" }}>{sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 flex gap-3">
          <button
            onClick={reset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-4 rounded-xl active:scale-95 transition-all"
          >
            <span style={{ fontSize: "16px", fontWeight: "600" }}>처음으로</span>
          </button>
          <button
            onClick={() => setStep("payment")}
            className="flex-1 text-white rounded-xl py-4 active:scale-95 transition-all"
            style={{ background: "linear-gradient(180deg, #5a5a5a 0%, #383838 100%)", fontSize: "18px", fontWeight: "700" }}
          >
            수수료 납부 →
          </button>
        </div>
      </div>
    );
  }

  // ── PAYMENT ───────────────────────────────────────────────
  if (step === "payment" && selectedDoc) {
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
        <SkyHeader onBack={() => setStep("options")} />

        <div className="flex-1 flex flex-col p-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-gray-800 font-bold border-b border-gray-100 pb-3" style={{ fontSize: "17px" }}>
              발급 내역 확인
            </p>
            {[
              { label: "서류명", value: selectedDoc.name },
              { label: "발급 매수", value: `${quantity}매` },
              { label: "1매당 수수료", value: selectedDoc.fee > 0 ? `${selectedDoc.fee.toLocaleString()}원` : "무료" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500" style={{ fontSize: "15px" }}>{label}</span>
                <span className="text-gray-900 font-semibold" style={{ fontSize: "15px" }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between border-t-2 border-gray-200 pt-3 mt-2">
              <span className="text-gray-900 font-bold" style={{ fontSize: "18px" }}>합계 수수료</span>
              <span className="font-bold" style={{ fontSize: "22px", color: "#2d2d2d" }}>
                {totalFee > 0 ? `${totalFee.toLocaleString()}원` : "무료"}
              </span>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <button
              onClick={() => setStep("complete")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-10 flex flex-col items-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "54px" }}>💳</span>
              <span style={{ fontSize: "24px", fontWeight: "700" }}>카드 결제</span>
            </button>
            <button
              onClick={() => setStep("complete")}
              className="w-full bg-green-700 hover:bg-green-800 text-white rounded-2xl py-10 flex flex-col items-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "54px" }}>💵</span>
              <span style={{ fontSize: "24px", fontWeight: "700" }}>현금 결제</span>
            </button>
          </div>
        </div>

        <GreenBar navigate={navigate} />
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────
  if (step === "complete" && selectedDoc) {
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#d0d0d0" }}>
        <SkyHeader />

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-7">
          <div className="bg-green-100 rounded-full w-28 h-28 flex items-center justify-center shadow-xl">
            <Check size={64} className="text-green-600" strokeWidth={3} />
          </div>

          <div className="bg-white rounded-2xl p-6 w-full shadow-md text-center">
            <p className="text-gray-900 font-bold" style={{ fontSize: "22px" }}>
              민원서류 발급이 완료되었습니다
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600" style={{ fontSize: "16px" }}>
                서류명: <strong>{selectedDoc.name}</strong>
              </p>
              <p className="text-gray-600" style={{ fontSize: "16px" }}>
                발급 매수: <strong>{quantity}매</strong>
              </p>
              {totalFee > 0 && (
                <p className="text-gray-600" style={{ fontSize: "16px" }}>
                  납부 금액: <strong>{totalFee.toLocaleString()}원</strong>
                </p>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 w-full text-center">
            <p className="text-orange-800 font-bold" style={{ fontSize: "18px" }}>
              🖨️ 출력구에서 서류를 가져가세요
            </p>
            <p className="text-orange-600 mt-2" style={{ fontSize: "14px" }}>
              신분증도 꼭 챙겨가세요!
            </p>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={reset}
              className="w-full text-white rounded-2xl py-5 shadow-xl active:scale-95 transition-all"
              style={{ background: "linear-gradient(180deg, #5a5a5a 0%, #383838 100%)", fontSize: "20px", fontWeight: "700" }}
            >
              다른 서류 발급하기
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-2xl py-5 active:scale-95 transition-all"
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              홈으로
            </button>
          </div>
        </div>

        <GreenBar navigate={navigate} />
      </div>
    );
  }

  return null;
}

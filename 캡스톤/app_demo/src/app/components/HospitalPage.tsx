import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, ChevronRight, Clock, User, FileText, CreditCard, Banknote } from "lucide-react";

type Screen =
  | "main"
  | "reception-dept"
  | "reception-doctor"
  | "reception-confirm"
  | "reception-complete"
  | "payment-list"
  | "payment-method"
  | "payment-complete"
  | "certificate-select"
  | "certificate-auth"
  | "certificate-complete";

const DEPARTMENTS = [
  { id: "internal", name: "내과", desc: "소화기·호흡기·심장" },
  { id: "ortho", name: "정형외과", desc: "뼈·관절·근육" },
  { id: "neuro", name: "신경과", desc: "두통·어지럼증·마비" },
  { id: "derma", name: "피부과", desc: "피부·모발·손발톱" },
  { id: "ent", name: "이비인후과", desc: "귀·코·목" },
  { id: "ophthal", name: "안과", desc: "시력·눈 질환" },
  { id: "psych", name: "정신건강의학과", desc: "우울·불안·수면" },
  { id: "rehab", name: "재활의학과", desc: "통증·재활치료" },
];

const DOCTORS: Record<string, { id: string; name: string; title: string }[]> = {
  internal: [
    { id: "d1", name: "김민준", title: "내과 전문의" },
    { id: "d2", name: "이서연", title: "소화기 전문의" },
  ],
  ortho: [
    { id: "d3", name: "박지훈", title: "정형외과 전문의" },
    { id: "d4", name: "최수아", title: "관절 전문의" },
  ],
  neuro: [{ id: "d5", name: "정하은", title: "신경과 전문의" }],
  derma: [{ id: "d6", name: "강도윤", title: "피부과 전문의" }],
  ent: [{ id: "d7", name: "윤지아", title: "이비인후과 전문의" }],
  ophthal: [{ id: "d8", name: "임서준", title: "안과 전문의" }],
  psych: [{ id: "d9", name: "한소율", title: "정신건강의학과 전문의" }],
  rehab: [{ id: "d10", name: "오채원", title: "재활의학과 전문의" }],
};

const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

const UNPAID_BILLS = [
  { id: "b1", date: "2026.04.28", dept: "내과", doctor: "김민준", amount: 12500 },
  { id: "b2", date: "2026.05.02", dept: "정형외과", doctor: "박지훈", amount: 27800 },
];

const CERTIFICATES = [
  { id: "c1", name: "진단서", fee: 10000, desc: "질병·상해 진단 내용" },
  { id: "c2", name: "소견서", fee: 3000, desc: "의사 소견 및 치료 경과" },
  { id: "c3", name: "입퇴원확인서", fee: 1000, desc: "입원·퇴원 날짜 확인" },
  { id: "c4", name: "통원확인서", fee: 1000, desc: "외래 진료 방문 확인" },
  { id: "c5", name: "처방전", fee: 0, desc: "약 처방 내용 (무료)" },
];

const GREEN = "#16A34A";

export default function HospitalPage() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>("main");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [selectedCert, setSelectedCert] = useState<string>("");
  const [receptionNum] = useState(() => Math.floor(Math.random() * 900 + 100));

  const dept = DEPARTMENTS.find((d) => d.id === selectedDept);
  const doctors = DOCTORS[selectedDept] ?? [];
  const doctor = doctors.find((d) => d.id === selectedDoctor);
  const cert = CERTIFICATES.find((c) => c.id === selectedCert);
  const totalBill = UNPAID_BILLS.filter((b) => selectedBills.includes(b.id)).reduce((s, b) => s + b.amount, 0);

  const toggleBill = (id: string) =>
    setSelectedBills((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);

  // ── MAIN ─────────────────────────────────────────────────
  if (screen === "main") {
    return (
      <div className="min-h-svh flex flex-col" style={{ background: "#F0FDF4" }}>
        <div className="px-5 pt-10 pb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-gray-500 mb-6" style={{ fontSize: "14px" }}>
            <ArrowLeft size={18} /> 홈
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: GREEN, fontSize: "20px" }}>
              +
            </div>
            <h1 className="font-black text-gray-900" style={{ fontSize: "26px" }}>병원 키오스크</h1>
          </div>
          <p className="text-gray-500 ml-13" style={{ fontSize: "14px", paddingLeft: "52px" }}>원하시는 서비스를 선택해 주세요</p>
        </div>

        <div className="flex-1 px-5 space-y-4">
          {[
            {
              icon: <User size={32} style={{ color: GREEN }} />,
              title: "진료 접수",
              desc: "진료과 선택 후 접수증을 받으세요",
              screen: "reception-dept" as Screen,
            },
            {
              icon: <CreditCard size={32} style={{ color: GREEN }} />,
              title: "수납",
              desc: "진료비를 확인하고 결제하세요",
              screen: "payment-list" as Screen,
            },
            {
              icon: <FileText size={32} style={{ color: GREEN }} />,
              title: "증명서 발급",
              desc: "진단서·소견서·확인서를 발급하세요",
              screen: "certificate-select" as Screen,
            },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => setScreen(item.screen)}
              className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all text-left"
              style={{ border: "1.5px solid #DCFCE7" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#F0FDF4" }}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900" style={{ fontSize: "18px" }}>{item.title}</p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: "13px" }}>{item.desc}</p>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          ))}
        </div>

        <div className="px-5 py-8 text-center text-gray-400" style={{ fontSize: "12px" }}>
          도움이 필요하시면 직원에게 문의하세요
        </div>
      </div>
    );
  }

  // ── RECEPTION: 진료과 선택 ────────────────────────────────
  if (screen === "reception-dept") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("main")} className="text-gray-700 mr-3"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>진료과 선택</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 grid grid-cols-2 gap-3 content-start">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => { setSelectedDept(dept.id); setSelectedDoctor(""); setSelectedTime(""); setScreen("reception-doctor"); }}
              className="bg-white rounded-2xl p-4 text-left shadow-sm active:scale-95 transition-all"
              style={{ border: "1.5px solid #E5E7EB" }}
            >
              <p className="font-bold text-gray-900" style={{ fontSize: "17px" }}>{dept.name}</p>
              <p className="text-gray-400 mt-1" style={{ fontSize: "12px" }}>{dept.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── RECEPTION: 의사·시간 선택 ─────────────────────────────
  if (screen === "reception-doctor") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("reception-dept")} className="text-gray-700 mr-3"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>{dept?.name} 접수</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* 의사 선택 */}
          <div>
            <p className="font-bold text-gray-700 mb-3" style={{ fontSize: "15px" }}>담당 의사</p>
            <div className="space-y-2">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all"
                  style={{ borderColor: selectedDoctor === doc.id ? GREEN : "#E5E7EB", background: selectedDoctor === doc.id ? "#F0FDF4" : "#fff" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: GREEN, fontSize: "15px" }}>
                    {doc.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>{doc.name} 선생님</p>
                    <p className="text-gray-400" style={{ fontSize: "13px" }}>{doc.title}</p>
                  </div>
                  {selectedDoctor === doc.id && <Check size={20} className="ml-auto" style={{ color: GREEN }} />}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 선택 */}
          <div>
            <p className="font-bold text-gray-700 mb-3" style={{ fontSize: "15px" }}>진료 시간</p>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className="py-2.5 rounded-xl font-bold transition-all"
                  style={{
                    fontSize: "14px",
                    background: selectedTime === t ? GREEN : "#F3F4F6",
                    color: selectedTime === t ? "#fff" : "#374151",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100">
          <button
            onClick={() => setScreen("reception-confirm")}
            disabled={!selectedDoctor || !selectedTime}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all disabled:opacity-40"
            style={{ background: GREEN, fontSize: "18px" }}
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  // ── RECEPTION: 확인 ───────────────────────────────────────
  if (screen === "reception-confirm") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("reception-doctor")} className="text-gray-700 mr-3"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>접수 확인</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 p-5">
          <div className="rounded-2xl border-2 p-5 space-y-4" style={{ borderColor: GREEN }}>
            <p className="font-bold text-gray-900 border-b border-gray-100 pb-3" style={{ fontSize: "16px" }}>접수 정보</p>
            {[
              { label: "진료과", value: dept?.name },
              { label: "담당 의사", value: `${doctor?.name} 선생님` },
              { label: "진료 시간", value: selectedTime },
              { label: "접수 날짜", value: new Date().toLocaleDateString("ko-KR") },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400" style={{ fontSize: "14px" }}>{label}</span>
                <span className="font-semibold text-gray-800" style={{ fontSize: "14px" }}>{value}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-6" style={{ fontSize: "13px" }}>
            접수 후 대기실에서 순서를 기다려 주세요
          </p>
        </div>

        <div className="p-5 border-t border-gray-100">
          <button
            onClick={() => setScreen("reception-complete")}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all"
            style={{ background: GREEN, fontSize: "18px" }}
          >
            접수하기
          </button>
        </div>
      </div>
    );
  }

  // ── RECEPTION: 완료 ───────────────────────────────────────
  if (screen === "reception-complete") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 text-center">
          <h1 className="font-bold text-gray-900" style={{ fontSize: "18px" }}>접수 완료</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <div className="rounded-full w-24 h-24 flex items-center justify-center" style={{ background: "#DCFCE7" }}>
            <Check size={52} style={{ color: GREEN }} strokeWidth={3} />
          </div>

          <div className="text-center">
            <p className="font-black text-gray-900" style={{ fontSize: "22px" }}>접수가 완료되었습니다</p>
            <p className="text-gray-400 mt-2" style={{ fontSize: "14px" }}>대기 번호를 확인해 주세요</p>
          </div>

          <div className="w-32 h-32 rounded-3xl flex flex-col items-center justify-center shadow-lg" style={{ background: GREEN }}>
            <p className="text-white font-bold" style={{ fontSize: "13px" }}>대기 번호</p>
            <p className="text-white font-black" style={{ fontSize: "52px", lineHeight: 1 }}>{receptionNum}</p>
          </div>

          <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-2">
            {[
              { label: "진료과", value: dept?.name },
              { label: "의사", value: `${doctor?.name} 선생님` },
              { label: "시간", value: selectedTime },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400" style={{ fontSize: "13px" }}>{label}</span>
                <span className="font-semibold text-gray-700" style={{ fontSize: "13px" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <button
            onClick={() => { setSelectedDept(""); setSelectedDoctor(""); setSelectedTime(""); setScreen("main"); }}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all"
            style={{ background: GREEN, fontSize: "18px" }}
          >
            처음으로
          </button>
        </div>
      </div>
    );
  }

  // ── PAYMENT: 미납 내역 ────────────────────────────────────
  if (screen === "payment-list") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("main")} className="text-gray-700 mr-3"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>수납</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 px-5 py-4 space-y-3">
          <p className="text-gray-500 mb-4" style={{ fontSize: "14px" }}>결제할 항목을 선택해 주세요</p>
          {UNPAID_BILLS.map((bill) => (
            <button
              key={bill.id}
              onClick={() => toggleBill(bill.id)}
              className="w-full text-left rounded-2xl p-4 border-2 transition-all"
              style={{ borderColor: selectedBills.includes(bill.id) ? GREEN : "#E5E7EB", background: selectedBills.includes(bill.id) ? "#F0FDF4" : "#fff" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>{bill.dept}</p>
                  <p className="text-gray-400 mt-0.5" style={{ fontSize: "13px" }}>{bill.date} · {bill.doctor} 선생님</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900" style={{ fontSize: "17px" }}>{bill.amount.toLocaleString()}원</span>
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: selectedBills.includes(bill.id) ? GREEN : "#D1D5DB", background: selectedBills.includes(bill.id) ? GREEN : "#fff" }}>
                    {selectedBills.includes(bill.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-5 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-600" style={{ fontSize: "15px" }}>선택 금액</span>
            <span className="font-black" style={{ fontSize: "22px", color: GREEN }}>{totalBill.toLocaleString()}원</span>
          </div>
          <button
            onClick={() => setScreen("payment-method")}
            disabled={selectedBills.length === 0}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all disabled:opacity-40"
            style={{ background: GREEN, fontSize: "18px" }}
          >
            결제하기
          </button>
        </div>
      </div>
    );
  }

  // ── PAYMENT: 결제 수단 ────────────────────────────────────
  if (screen === "payment-method") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("payment-list")} className="text-gray-700 mr-3"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>결제 수단 선택</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 p-5 space-y-3">
          <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center mb-6">
            <span className="font-semibold text-gray-600" style={{ fontSize: "15px" }}>결제 금액</span>
            <span className="font-black" style={{ fontSize: "22px", color: GREEN }}>{totalBill.toLocaleString()}원</span>
          </div>

          <button
            onClick={() => setScreen("payment-complete")}
            className="w-full text-white rounded-2xl py-10 flex flex-col items-center gap-3 shadow-md active:scale-95 transition-all"
            style={{ background: GREEN }}
          >
            <CreditCard size={52} className="text-white" />
            <span style={{ fontSize: "22px", fontWeight: "700" }}>카드 결제</span>
          </button>
          <button
            onClick={() => setScreen("payment-complete")}
            className="w-full bg-gray-700 text-white rounded-2xl py-10 flex flex-col items-center gap-3 shadow-md active:scale-95 transition-all"
          >
            <Banknote size={52} className="text-white" />
            <span style={{ fontSize: "22px", fontWeight: "700" }}>현금 결제</span>
          </button>
        </div>
      </div>
    );
  }

  // ── PAYMENT: 완료 ─────────────────────────────────────────
  if (screen === "payment-complete") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 text-center">
          <h1 className="font-bold text-gray-900" style={{ fontSize: "18px" }}>수납 완료</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <div className="rounded-full w-24 h-24 flex items-center justify-center" style={{ background: "#DCFCE7" }}>
            <Check size={52} style={{ color: GREEN }} strokeWidth={3} />
          </div>
          <div className="text-center">
            <p className="font-black text-gray-900" style={{ fontSize: "22px" }}>결제가 완료되었습니다</p>
            <p className="font-bold mt-2" style={{ fontSize: "18px", color: GREEN }}>{totalBill.toLocaleString()}원</p>
          </div>
          <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-2">
            {UNPAID_BILLS.filter((b) => selectedBills.includes(b.id)).map((b) => (
              <div key={b.id} className="flex justify-between">
                <span className="text-gray-500" style={{ fontSize: "13px" }}>{b.dept} ({b.date})</span>
                <span className="font-semibold text-gray-700" style={{ fontSize: "13px" }}>{b.amount.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <button
            onClick={() => { setSelectedBills([]); setScreen("main"); }}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all"
            style={{ background: GREEN, fontSize: "18px" }}
          >
            처음으로
          </button>
        </div>
      </div>
    );
  }

  // ── CERTIFICATE: 종류 선택 ────────────────────────────────
  if (screen === "certificate-select") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("main")} className="text-gray-700 mr-3"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>증명서 발급</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <p className="text-gray-500 mb-4" style={{ fontSize: "14px" }}>발급할 증명서를 선택해 주세요</p>
          {CERTIFICATES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedCert(c.id); setScreen("certificate-auth"); }}
              className="w-full text-left rounded-2xl p-4 border-2 flex items-center gap-4 active:scale-[0.98] transition-all"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F0FDF4" }}>
                <FileText size={24} style={{ color: GREEN }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900" style={{ fontSize: "16px" }}>{c.name}</p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>{c.desc}</p>
              </div>
              <span className="font-bold" style={{ fontSize: "14px", color: c.fee === 0 ? GREEN : "#374151" }}>
                {c.fee === 0 ? "무료" : `${c.fee.toLocaleString()}원`}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── CERTIFICATE: 본인 확인 ────────────────────────────────
  if (screen === "certificate-auth") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <button onClick={() => setScreen("certificate-select")} className="text-gray-700 mr-3"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center font-bold text-gray-900" style={{ fontSize: "18px" }}>본인 확인</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <FileText size={48} style={{ color: GREEN }} />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900" style={{ fontSize: "20px" }}>{cert?.name}</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "14px" }}>발급 수수료: {cert?.fee === 0 ? "무료" : `${cert?.fee.toLocaleString()}원`}</p>
          </div>

          <div className="w-full bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p className="font-bold text-amber-700 mb-1" style={{ fontSize: "14px" }}>신분증을 스캔해 주세요</p>
            <p className="text-amber-600" style={{ fontSize: "13px" }}>주민등록증 또는 운전면허증을 아래 스캔 단말기에 올려 주세요</p>
          </div>

          <div className="w-full h-32 rounded-2xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: GREEN }}>
            <div className="text-center">
              <Clock size={32} style={{ color: GREEN }} className="mx-auto mb-2" />
              <p style={{ fontSize: "13px", color: GREEN }}>신분증 인식 대기 중...</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <button
            onClick={() => setScreen("certificate-complete")}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all"
            style={{ background: GREEN, fontSize: "18px" }}
          >
            인식 완료 (시뮬레이션)
          </button>
        </div>
      </div>
    );
  }

  // ── CERTIFICATE: 발급 완료 ────────────────────────────────
  if (screen === "certificate-complete") {
    return (
      <div className="min-h-svh bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 text-center">
          <h1 className="font-bold text-gray-900" style={{ fontSize: "18px" }}>발급 완료</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <div className="rounded-full w-24 h-24 flex items-center justify-center" style={{ background: "#DCFCE7" }}>
            <Check size={52} style={{ color: GREEN }} strokeWidth={3} />
          </div>
          <div className="text-center">
            <p className="font-black text-gray-900" style={{ fontSize: "22px" }}>발급이 완료되었습니다</p>
            <p className="text-gray-400 mt-2" style={{ fontSize: "14px" }}>아래 출력구에서 서류를 가져가세요</p>
          </div>
          <div className="w-full bg-gray-50 rounded-2xl p-4">
            <div className="flex justify-between">
              <span className="text-gray-400" style={{ fontSize: "14px" }}>발급 서류</span>
              <span className="font-semibold text-gray-800" style={{ fontSize: "14px" }}>{cert?.name}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-400" style={{ fontSize: "14px" }}>발급 일시</span>
              <span className="font-semibold text-gray-800" style={{ fontSize: "14px" }}>{new Date().toLocaleString("ko-KR")}</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <button
            onClick={() => { setSelectedCert(""); setScreen("main"); }}
            className="w-full text-white rounded-2xl py-5 font-bold active:scale-95 transition-all"
            style={{ background: GREEN, fontSize: "18px" }}
          >
            처음으로
          </button>
        </div>
      </div>
    );
  }

  return null;
}

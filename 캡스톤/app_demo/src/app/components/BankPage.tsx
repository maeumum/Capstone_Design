import { useNavigate } from "react-router";
import { useState } from "react";

type Service = "withdrawal" | "balance" | "transfer" | "deposit" | "passbook" | "utility" | null;
type Step =
  | "welcome"
  | "pin"
  | "service"
  | "withdrawal-amount"
  | "transfer-bank"
  | "transfer-account"
  | "transfer-amount"
  | "deposit-insert"
  | "passbook-insert"
  | "confirm"
  | "complete"
  | "balance-result";

const BANKS = [
  "전북은행", "국민은행", "신한은행", "우리은행",
  "하나은행", "농협은행", "기업은행", "카카오뱅크", "토스뱅크",
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 300000, 500000, 700000];
const MOCK_BALANCE = 1245300;

function AtmHeader() {
  const time = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="bg-green-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-lg px-3 py-1">
          <span className="text-green-800" style={{ fontSize: "26px", fontWeight: "900" }}>JB</span>
        </div>
        <span className="text-white" style={{ fontSize: "22px", fontWeight: "700" }}>전북은행</span>
      </div>
      <span className="text-green-200" style={{ fontSize: "18px" }}>{time}</span>
    </div>
  );
}

function Numpad({ onInput }: { onInput: (d: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "delete"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onInput(key)}
          className={`rounded-xl py-5 font-bold shadow active:scale-95 transition-all
            ${key === "clear"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : key === "delete"
              ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
              : "bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
            }`}
          style={{ fontSize: "26px" }}
        >
          {key === "clear" ? "취소" : key === "delete" ? "←" : key}
        </button>
      ))}
    </div>
  );
}

function CancelBar({ onCancel, onBack, backStep }: { onCancel: () => void; onBack?: () => void; backStep?: string }) {
  return (
    <div className="bg-gray-700 px-6 py-4 flex justify-between items-center">
      {onBack ? (
        <button onClick={onBack} className="bg-gray-500 hover:bg-gray-400 text-white px-6 py-3 rounded-xl active:scale-95 transition-all">
          <span style={{ fontSize: "20px", fontWeight: "600" }}>← 이전</span>
        </button>
      ) : <div />}
      <button onClick={onCancel} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl active:scale-95 transition-all">
        <span style={{ fontSize: "20px", fontWeight: "600" }}>취소 / 카드 반환</span>
      </button>
    </div>
  );
}

export default function BankPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [pin, setPin] = useState("");
  const [service, setService] = useState<Service>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [transferBank, setTransferBank] = useState("");
  const [transferAccount, setTransferAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const reset = () => {
    setStep("welcome");
    setPin("");
    setService(null);
    setWithdrawalAmount(0);
    setTransferBank("");
    setTransferAccount("");
    setTransferAmount("");
  };

  const handlePin = (d: string) => {
    if (d === "clear") { setPin(""); return; }
    if (d === "delete") { setPin((p) => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) setTimeout(() => setStep("service"), 400);
  };

  const handleAccount = (d: string) => {
    if (d === "clear") { setTransferAccount(""); return; }
    if (d === "delete") { setTransferAccount((p) => p.slice(0, -1)); return; }
    if (transferAccount.length < 14) setTransferAccount((p) => p + d);
  };

  const handleTransferAmt = (d: string) => {
    if (d === "clear") { setTransferAmount(""); return; }
    if (d === "delete") { setTransferAmount((p) => p.slice(0, -1)); return; }
    if (transferAmount.length < 8) setTransferAmount((p) => p + d);
  };

  // ── WELCOME ──────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col items-center justify-center gap-10 p-8">
          <div className="text-center">
            <p className="text-green-800 mb-1" style={{ fontSize: "20px" }}>안녕하세요</p>
            <p className="text-green-900" style={{ fontSize: "38px", fontWeight: "700" }}>전북은행 ATM입니다</p>
          </div>

          <div className="bg-green-50 border-4 border-green-200 rounded-3xl p-10 w-full max-w-sm text-center">
            <div className="text-8xl mb-6">💳</div>
            <p className="text-gray-700" style={{ fontSize: "26px", fontWeight: "600", lineHeight: "1.6" }}>
              카드를 넣어주세요
            </p>
            <p className="text-gray-500 mt-2" style={{ fontSize: "18px" }}>위쪽 카드 투입구에 넣으세요</p>
          </div>

          <button
            onClick={() => setStep("pin")}
            className="w-full max-w-sm bg-green-700 hover:bg-green-800 text-white rounded-2xl py-8 shadow-xl active:scale-95 transition-all"
          >
            <span style={{ fontSize: "28px", fontWeight: "700" }}>카드 넣기 (시작하기)</span>
          </button>
        </div>
        <div className="bg-gray-700 px-6 py-4">
          <button onClick={() => navigate("/")} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-xl active:scale-95 transition-all">
            <span style={{ fontSize: "20px", fontWeight: "600" }}>← 홈으로</span>
          </button>
        </div>
      </div>
    );
  }

  // ── PIN ───────────────────────────────────────────────────
  if (step === "pin") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col p-6 gap-6">
          <div className="text-center py-4">
            <p className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>비밀번호를 입력하세요</p>
            <p className="text-gray-500 mt-2" style={{ fontSize: "20px" }}>4자리 숫자를 눌러주세요</p>
          </div>

          <div className="flex justify-center gap-6 py-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-14 h-14 rounded-full border-4 transition-all ${
                  pin.length > i ? "bg-green-700 border-green-700" : "bg-white border-gray-400"
                }`}
              />
            ))}
          </div>

          <div className="max-w-xs mx-auto w-full">
            <Numpad onInput={handlePin} />
          </div>

          {pin.length === 4 && (
            <button
              onClick={() => setStep("service")}
              className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-6 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "26px", fontWeight: "700" }}>확인</span>
            </button>
          )}
        </div>
        <CancelBar onCancel={reset} />
      </div>
    );
  }

  // ── SERVICE SELECTION ─────────────────────────────────────
  if (step === "service") {
    const services = [
      { id: "withdrawal", label: "출금", desc: "현금 찾기", emoji: "💵", color: "bg-blue-600" },
      { id: "balance", label: "잔액조회", desc: "잔액 확인", emoji: "📊", color: "bg-green-700" },
      { id: "transfer", label: "이체", desc: "계좌 이체", emoji: "🔄", color: "bg-purple-600" },
      { id: "deposit", label: "입금", desc: "현금 넣기", emoji: "💰", color: "bg-orange-500" },
      { id: "passbook", label: "통장정리", desc: "통장 업데이트", emoji: "📔", color: "bg-teal-600" },
      { id: "utility", label: "공과금납부", desc: "요금 납부", emoji: "🏛️", color: "bg-gray-600" },
    ];

    const handleService = (id: string) => {
      setService(id as Service);
      if (id === "withdrawal") setStep("withdrawal-amount");
      else if (id === "balance") setStep("balance-result");
      else if (id === "transfer") setStep("transfer-bank");
      else if (id === "deposit") setStep("deposit-insert");
      else if (id === "passbook") setStep("passbook-insert");
      else if (id === "utility") setStep("confirm");
    };

    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col p-6 gap-4">
          <h2 className="text-center text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>
            원하시는 업무를 선택하세요
          </h2>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleService(svc.id)}
                className={`${svc.color} hover:opacity-90 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-xl active:scale-95 transition-all`}
              >
                <span style={{ fontSize: "44px" }}>{svc.emoji}</span>
                <span style={{ fontSize: "24px", fontWeight: "700" }}>{svc.label}</span>
                <span style={{ fontSize: "17px", opacity: 0.9 }}>{svc.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <CancelBar onCancel={reset} />
      </div>
    );
  }

  // ── WITHDRAWAL AMOUNT ─────────────────────────────────────
  if (step === "withdrawal-amount") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col p-6 gap-5">
          <h2 className="text-center text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>
            출금 금액을 선택하세요
          </h2>
          <p className="text-center text-gray-500" style={{ fontSize: "18px" }}>
            현재 잔액: <strong className="text-green-800">{MOCK_BALANCE.toLocaleString()}원</strong>
          </p>

          <div className="grid grid-cols-2 gap-4">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setWithdrawalAmount(amount);
                  setStep("confirm");
                }}
                className="bg-white hover:bg-green-50 border-4 border-gray-200 hover:border-green-600 text-gray-800 rounded-2xl py-7 text-center shadow active:scale-95 transition-all"
              >
                <span style={{ fontSize: "26px", fontWeight: "700" }}>{amount.toLocaleString()}원</span>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 text-center">
            <p className="text-blue-700" style={{ fontSize: "20px", fontWeight: "600" }}>
              💡 다른 금액을 원하시면 직원에게 문의하세요
            </p>
          </div>
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("service")} />
      </div>
    );
  }

  // ── BALANCE RESULT ────────────────────────────────────────
  if (step === "balance-result") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 gap-8">
          <h2 className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>잔액 조회 결과</h2>

          <div className="w-full max-w-sm bg-green-50 border-4 border-green-200 rounded-2xl p-8 text-center">
            <p className="text-gray-500 mb-2" style={{ fontSize: "20px" }}>전북은행 (****-**-123456)</p>
            <p className="text-gray-500 mb-3" style={{ fontSize: "20px" }}>잔액</p>
            <p className="text-green-800" style={{ fontSize: "46px", fontWeight: "700" }}>
              {MOCK_BALANCE.toLocaleString()}원
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => setStep("service")}
              className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "24px", fontWeight: "700" }}>다른 업무 보기</span>
            </button>
            <button
              onClick={reset}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "24px", fontWeight: "700" }}>종료 (카드 반환)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── TRANSFER: BANK ────────────────────────────────────────
  if (step === "transfer-bank") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col p-6 gap-4">
          <h2 className="text-center text-gray-800 mb-2" style={{ fontSize: "28px", fontWeight: "700" }}>
            받는 분의 은행을 선택하세요
          </h2>
          <div className="grid grid-cols-3 gap-3 flex-1">
            {BANKS.map((bank) => (
              <button
                key={bank}
                onClick={() => { setTransferBank(bank); setStep("transfer-account"); }}
                className={`border-4 rounded-xl p-4 flex items-center justify-center text-center active:scale-95 transition-all shadow
                  ${transferBank === bank
                    ? "border-green-600 bg-green-50 text-green-800"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50"
                  }`}
              >
                <span style={{ fontSize: "19px", fontWeight: "600" }}>{bank}</span>
              </button>
            ))}
          </div>
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("service")} />
      </div>
    );
  }

  // ── TRANSFER: ACCOUNT NUMBER ──────────────────────────────
  if (step === "transfer-account") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col p-6 gap-5">
          <div className="text-center">
            <h2 className="text-gray-800" style={{ fontSize: "28px", fontWeight: "700" }}>
              계좌번호를 입력하세요
            </h2>
            <p className="text-green-700 mt-1" style={{ fontSize: "20px", fontWeight: "600" }}>
              선택된 은행: {transferBank}
            </p>
          </div>

          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-5 text-center min-h-[70px] flex items-center justify-center">
            <span className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700", letterSpacing: "0.1em" }}>
              {transferAccount || "─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─"}
            </span>
          </div>

          <div className="max-w-xs mx-auto w-full">
            <Numpad onInput={handleAccount} />
          </div>

          {transferAccount.length >= 10 && (
            <button
              onClick={() => setStep("transfer-amount")}
              className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "24px", fontWeight: "700" }}>다음 →</span>
            </button>
          )}
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("transfer-bank")} />
      </div>
    );
  }

  // ── TRANSFER: AMOUNT ──────────────────────────────────────
  if (step === "transfer-amount") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col p-6 gap-5">
          <h2 className="text-center text-gray-800" style={{ fontSize: "28px", fontWeight: "700" }}>
            이체할 금액을 입력하세요
          </h2>

          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-5 text-right min-h-[70px] flex items-center justify-end">
            <span className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>
              {transferAmount ? Number(transferAmount).toLocaleString() + "원" : "0원"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[10000, 30000, 50000, 100000, 200000, 500000].map((amt) => (
              <button
                key={amt}
                onClick={() => setTransferAmount(String(amt))}
                className="bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 rounded-xl py-4 text-center active:scale-95 transition-all"
              >
                <span style={{ fontSize: "19px", fontWeight: "600" }}>
                  {amt >= 10000 ? `${amt / 10000}만원` : `${amt}원`}
                </span>
              </button>
            ))}
          </div>

          <div className="max-w-xs mx-auto w-full">
            <Numpad onInput={handleTransferAmt} />
          </div>

          {transferAmount && Number(transferAmount) > 0 && (
            <button
              onClick={() => setStep("confirm")}
              className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "24px", fontWeight: "700" }}>다음 →</span>
            </button>
          )}
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("transfer-account")} />
      </div>
    );
  }

  // ── DEPOSIT INSERT ────────────────────────────────────────
  if (step === "deposit-insert") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col items-center justify-center gap-10 p-8">
          <div className="text-center">
            <p className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>입금</p>
          </div>
          <div className="bg-orange-50 border-4 border-orange-200 rounded-3xl p-10 w-full max-w-sm text-center">
            <div className="text-7xl mb-5">💵</div>
            <p className="text-gray-700" style={{ fontSize: "26px", fontWeight: "600", lineHeight: "1.7" }}>
              현금을 투입구에<br />넣어주세요
            </p>
          </div>
          <button
            onClick={() => setStep("complete")}
            className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-7 shadow-xl active:scale-95 transition-all"
          >
            <span style={{ fontSize: "26px", fontWeight: "700" }}>현금 넣기 완료</span>
          </button>
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("service")} />
      </div>
    );
  }

  // ── PASSBOOK INSERT ───────────────────────────────────────
  if (step === "passbook-insert") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col items-center justify-center gap-10 p-8">
          <div className="text-center">
            <p className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>통장정리</p>
          </div>
          <div className="bg-teal-50 border-4 border-teal-200 rounded-3xl p-10 w-full max-w-sm text-center">
            <div className="text-7xl mb-5">📔</div>
            <p className="text-gray-700" style={{ fontSize: "26px", fontWeight: "600", lineHeight: "1.7" }}>
              통장을 투입구에<br />넣어주세요
            </p>
          </div>
          <button
            onClick={() => setStep("complete")}
            className="w-full max-w-sm bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-7 shadow-xl active:scale-95 transition-all"
          >
            <span style={{ fontSize: "26px", fontWeight: "700" }}>통장 넣기 완료</span>
          </button>
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("service")} />
      </div>
    );
  }

  // ── CONFIRM ───────────────────────────────────────────────
  if (step === "confirm") {
    const serviceLabel: Record<string, string> = {
      withdrawal: "출금", transfer: "이체", deposit: "입금",
      passbook: "통장정리", utility: "공과금납부",
    };

    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 gap-8">
          <h2 className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>
            거래 내역을 확인하세요
          </h2>

          <div className="w-full max-w-sm bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
              <span className="text-gray-600" style={{ fontSize: "21px" }}>업무 종류</span>
              <span className="text-gray-900" style={{ fontSize: "21px", fontWeight: "700" }}>
                {serviceLabel[service ?? ""] ?? ""}
              </span>
            </div>

            {service === "withdrawal" && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600" style={{ fontSize: "21px" }}>출금 금액</span>
                <span className="text-green-800" style={{ fontSize: "25px", fontWeight: "700" }}>
                  {withdrawalAmount.toLocaleString()}원
                </span>
              </div>
            )}

            {service === "transfer" && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontSize: "21px" }}>받는 은행</span>
                  <span className="text-gray-900" style={{ fontSize: "21px", fontWeight: "600" }}>{transferBank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontSize: "21px" }}>계좌번호</span>
                  <span className="text-gray-900" style={{ fontSize: "21px", fontWeight: "600" }}>{transferAccount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontSize: "21px" }}>이체 금액</span>
                  <span className="text-green-800" style={{ fontSize: "25px", fontWeight: "700" }}>
                    {Number(transferAmount).toLocaleString()}원
                  </span>
                </div>
              </>
            )}

            {service === "utility" && (
              <div className="text-center py-2">
                <p className="text-gray-600" style={{ fontSize: "21px" }}>공과금 청구서를 넣어주세요</p>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => setStep("complete")}
              className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-6 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "26px", fontWeight: "700" }}>확인 (거래 진행)</span>
            </button>
            <button
              onClick={() => {
                if (service === "withdrawal") setStep("withdrawal-amount");
                else if (service === "transfer") setStep("transfer-amount");
                else setStep("service");
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>← 이전</span>
            </button>
          </div>
        </div>
        <div className="bg-gray-700 px-6 py-4">
          <button onClick={reset} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl active:scale-95 transition-all">
            <span style={{ fontSize: "20px", fontWeight: "600" }}>취소 / 카드 반환</span>
          </button>
        </div>
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 gap-8">
          <div className="bg-green-100 rounded-full w-32 h-32 flex items-center justify-center">
            <span style={{ fontSize: "62px" }}>✓</span>
          </div>

          <div className="text-center">
            <h2 className="text-green-800" style={{ fontSize: "34px", fontWeight: "700" }}>
              거래가 완료되었습니다
            </h2>
            {service === "withdrawal" && (
              <p className="text-gray-600 mt-4" style={{ fontSize: "22px" }}>
                현금 {withdrawalAmount.toLocaleString()}원을 가져가세요
              </p>
            )}
            {service === "transfer" && (
              <p className="text-gray-600 mt-4" style={{ fontSize: "22px" }}>
                {Number(transferAmount).toLocaleString()}원이 이체되었습니다
              </p>
            )}
            {service === "deposit" && (
              <p className="text-gray-600 mt-4" style={{ fontSize: "22px" }}>입금이 완료되었습니다</p>
            )}
            {service === "passbook" && (
              <p className="text-gray-600 mt-4" style={{ fontSize: "22px" }}>통장정리가 완료되었습니다</p>
            )}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 w-full max-w-sm text-center">
            <p className="text-yellow-800" style={{ fontSize: "20px", fontWeight: "600" }}>
              {service === "withdrawal"
                ? "💵 현금과 카드를 꼭 챙겨가세요!"
                : service === "passbook"
                ? "📔 통장과 카드를 꼭 챙겨가세요!"
                : "💳 카드를 꼭 챙겨가세요!"}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => setStep("service")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>다른 업무 보기</span>
            </button>
            <button
              onClick={reset}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>종료 (카드 반환)</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>홈으로</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

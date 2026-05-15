import { useNavigate } from "react-router";
import { useState } from "react";
import "./BankMain.css";

type Service = "withdrawal" | "balance" | "transfer" | "deposit" | "passbook" | "utility" | null;
type Step =
  | "main"
  | "pin"
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

function CancelBar({ onCancel, onBack }: { onCancel: () => void; onBack?: () => void }) {
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
  const [step, setStep] = useState<Step>("main");
  const [service, setService] = useState<Service>(null);
  const [pin, setPin] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [transferBank, setTransferBank] = useState("");
  const [transferAccount, setTransferAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const reset = () => {
    setStep("main");
    setService(null);
    setPin("");
    setWithdrawalAmount(0);
    setTransferBank("");
    setTransferAccount("");
    setTransferAmount("");
  };

  const selectService = (svc: Service) => {
    setService(svc);
    setStep("pin");
  };

  const handlePin = (d: string) => {
    if (d === "clear") { setPin(""); return; }
    if (d === "delete") { setPin((p) => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (service === "withdrawal") setStep("withdrawal-amount");
        else if (service === "balance") setStep("balance-result");
        else if (service === "transfer") setStep("transfer-bank");
        else if (service === "deposit") setStep("deposit-insert");
        else if (service === "passbook") setStep("passbook-insert");
        else if (service === "utility") setStep("confirm");
      }, 400);
    }
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

  // ── MAIN ─────────────────────────────────────────────────
  if (step === "main") {
    const notReady = () => alert("해당 업무는 준비 중입니다");
    return (
      <div
        style={{
          height: "100svh",
          overflow: "hidden",
          position: "relative",
          // ATM와 동일한 그라디언트 배경 → 위아래 여백도 자연스럽게 이어짐
          background: "linear-gradient(to bottom, #cfe6f5 0%, #e8f3fa 22%, #ffffff 55%, #ffffff 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // ATM 시각 높이 = 800 × (vw/1340) ≈ 59.7vw
          // 위아래 여백 = (100svh - 59.7vw) / 2 → 세로 중앙 정렬
          paddingTop: "calc((100svh - 59.7vw) / 2)",
        }}
      >
        <div className="atm-screen" data-screen-label="01 ATM Main">

          <header className="atm-header">
            <div className="slogan-slot">slogan placeholder</div>
            <div className="logo-slot">bank logo placeholder</div>
          </header>

          <div className="atm-body">

            <div className="side-col left-col">
              <div className="btn orange smaller-text two-line" onClick={notReady}>QR코드 거래/휴대폰거래/<br />스마트출금</div>
              <div className="btn" onClick={() => selectService("withdrawal")}>예금(수표)출금</div>
              <div className="btn" onClick={() => selectService("balance")}>잔액조회</div>
              <div className="btn small-text two-line" onClick={() => selectService("transfer")}>송금(계좌이체)<br />/펀드입금예약</div>
              <div className="btn" onClick={notReady}>신용카드</div>
              <div className="btn small-text two-line" onClick={notReady}>예금거래<br />기록조회</div>
              <div className="btn" onClick={notReady}>대출업무</div>
            </div>

            <div className="center-col">
              <div className="poster-frame" aria-label="poster area" />
              <div className="info-block">
                <div className="info-row"><span className="k">기번</span><span className="s">:</span><span className="v">052917</span></div>
                <div className="info-row"><span className="k">운영시간</span><span className="s">:</span><span className="v" /></div>
                <div className="info-notes">
                  <div>5만/1만 지급가능</div>
                  <div>5만/1만 입금가능</div>
                </div>
              </div>
              <button className="btn-zoom" type="button">
                <span className="zoom-icon">+</span>
                <span className="label-stack">
                  <span>화면확대</span>
                  <span className="label-sub">(저시력고객용)</span>
                </span>
              </button>
            </div>

            <div className="side-col right-col">
              <div className="btn" onClick={() => selectService("deposit")}>입금</div>
              <div className="btn" onClick={() => selectService("passbook")}>통장정리</div>
              <div className="btn small-text two-line" onClick={notReady}>자동계좌<br />이체설정</div>
              <div className="btn smaller-text two-line" onClick={() => selectService("utility")}>지로/공과금/세금/<br />지방세/범칙금</div>
              <div className="btn small-text two-line" onClick={notReady}>자주쓰는<br />입금계좌관리</div>
              <div className="btn" onClick={notReady}>무카드/무통장</div>
              <div className="btn green two-line" onClick={notReady}>ENGLISH<br />日本語/漢語</div>
            </div>

          </div>
        </div>

        {/* 홈 버튼 — 하단 여백 영역에 절대 위치 */}
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            bottom: "16px",
            background: "rgba(40,60,100,0.12)",
            color: "#2a3a55",
            border: "1px solid rgba(40,60,100,0.25)",
            borderRadius: "8px",
            padding: "7px 24px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← 홈으로
        </button>
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
              onClick={() => handlePin("")}
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
                onClick={() => { setWithdrawalAmount(amount); setStep("confirm"); }}
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
        <CancelBar onCancel={reset} onBack={() => setStep("pin")} />
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
            <button onClick={reset} className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all">
              <span style={{ fontSize: "24px", fontWeight: "700" }}>처음으로 돌아가기</span>
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
        <CancelBar onCancel={reset} onBack={() => setStep("pin")} />
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
            <h2 className="text-gray-800" style={{ fontSize: "28px", fontWeight: "700" }}>계좌번호를 입력하세요</h2>
            <p className="text-green-700 mt-1" style={{ fontSize: "20px", fontWeight: "600" }}>선택된 은행: {transferBank}</p>
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
            <button onClick={() => setStep("transfer-amount")} className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all">
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
            <button onClick={() => setStep("confirm")} className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all">
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
          <div className="bg-orange-50 border-4 border-orange-200 rounded-3xl p-10 w-full max-w-sm text-center">
            <div className="text-7xl mb-5">💵</div>
            <p className="text-gray-700" style={{ fontSize: "26px", fontWeight: "600", lineHeight: "1.7" }}>
              현금을 투입구에<br />넣어주세요
            </p>
          </div>
          <button onClick={() => setStep("complete")} className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-7 shadow-xl active:scale-95 transition-all">
            <span style={{ fontSize: "26px", fontWeight: "700" }}>현금 넣기 완료</span>
          </button>
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("pin")} />
      </div>
    );
  }

  // ── PASSBOOK INSERT ───────────────────────────────────────
  if (step === "passbook-insert") {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <AtmHeader />
        <div className="flex-1 bg-white flex flex-col items-center justify-center gap-10 p-8">
          <div className="bg-teal-50 border-4 border-teal-200 rounded-3xl p-10 w-full max-w-sm text-center">
            <div className="text-7xl mb-5">📔</div>
            <p className="text-gray-700" style={{ fontSize: "26px", fontWeight: "600", lineHeight: "1.7" }}>
              통장을 투입구에<br />넣어주세요
            </p>
          </div>
          <button onClick={() => setStep("complete")} className="w-full max-w-sm bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-7 shadow-xl active:scale-95 transition-all">
            <span style={{ fontSize: "26px", fontWeight: "700" }}>통장 넣기 완료</span>
          </button>
        </div>
        <CancelBar onCancel={reset} onBack={() => setStep("pin")} />
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
          <h2 className="text-gray-800" style={{ fontSize: "30px", fontWeight: "700" }}>거래 내역을 확인하세요</h2>

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
                <span className="text-green-800" style={{ fontSize: "25px", fontWeight: "700" }}>{withdrawalAmount.toLocaleString()}원</span>
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
                  <span className="text-green-800" style={{ fontSize: "25px", fontWeight: "700" }}>{Number(transferAmount).toLocaleString()}원</span>
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
            <button onClick={() => setStep("complete")} className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-6 shadow-xl active:scale-95 transition-all">
              <span style={{ fontSize: "26px", fontWeight: "700" }}>확인 (거래 진행)</span>
            </button>
            <button
              onClick={() => {
                if (service === "withdrawal") setStep("withdrawal-amount");
                else if (service === "transfer") setStep("transfer-amount");
                else setStep("pin");
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
            <h2 className="text-green-800" style={{ fontSize: "34px", fontWeight: "700" }}>거래가 완료되었습니다</h2>
            {service === "withdrawal" && (
              <p className="text-gray-600 mt-4" style={{ fontSize: "22px" }}>현금 {withdrawalAmount.toLocaleString()}원을 가져가세요</p>
            )}
            {service === "transfer" && (
              <p className="text-gray-600 mt-4" style={{ fontSize: "22px" }}>{Number(transferAmount).toLocaleString()}원이 이체되었습니다</p>
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
            <button onClick={reset} className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-5 shadow active:scale-95 transition-all">
              <span style={{ fontSize: "22px", fontWeight: "700" }}>처음으로 돌아가기</span>
            </button>
            <button onClick={() => navigate("/")} className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-xl py-5 shadow active:scale-95 transition-all">
              <span style={{ fontSize: "22px", fontWeight: "700" }}>홈으로</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

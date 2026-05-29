import { useNavigate } from "react-router";
import { useState } from "react";
import "./BankMain.css";

type Service = "withdrawal" | "balance" | "transfer" | "deposit" | "passbook" | "utility" | null;
type Step =
  | "main" | "warning" | "insert" | "pin"
  | "withdrawal-amount" | "transfer-bank" | "transfer-account" | "transfer-amount"
  | "deposit-insert" | "passbook-insert"
  | "confirm" | "complete" | "balance-result";

const BANKS = [
  "전북은행", "국민은행", "신한은행", "우리은행",
  "하나은행", "농협은행", "기업은행", "카카오뱅크", "토스뱅크",
];
const QUICK_AMOUNTS = [50000, 100000, 200000, 300000, 500000, 700000];
const TRANSFER_AMOUNTS = [10000, 30000, 50000, 100000, 200000, 500000];
const MOCK_BALANCE = 1245300;

// ─── Shared ATM outer wrapper (letterbox approach) ────────────────────────────
function AtmPage({ children, onHome }: { children: React.ReactNode; onHome?: () => void }) {
  return (
    <div style={{
      height: "100svh",
      overflow: "hidden",
      position: "relative",
      background: "linear-gradient(to bottom, #cfe6f5 0%, #e8f3fa 22%, #ffffff 55%, #ffffff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: "calc((100svh - 59.7vw) / 2)",
    }}>
      <div className="atm-screen">
        <header className="atm-header">
          <div className="slogan-slot">slogan placeholder</div>
          <div className="logo-slot">bank logo placeholder</div>
        </header>
        {children}
      </div>
      {onHome && (
        <button onClick={onHome} style={{
          position: "absolute", bottom: "16px",
          background: "rgba(40,60,100,0.12)", color: "#2a3a55",
          border: "1px solid rgba(40,60,100,0.25)", borderRadius: "8px",
          padding: "7px 24px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
        }}>← 홈으로</button>
      )}
    </div>
  );
}

// Body area below the 110px header — 1280 × 690px coordinate space
// bottom padding 100px reserves room for the cancel bar (90px)
const body: React.CSSProperties = {
  position: "absolute",
  top: 110, left: 0, right: 0, bottom: 0,
  display: "flex", flexDirection: "column", alignItems: "center",
  padding: "28px 120px 100px",
};
const bodyNoCancelBar: React.CSSProperties = {
  ...body,
  padding: "28px 120px 28px",
};

function AtmNumpad({ onInput }: { onInput: (d: string) => void }) {
  const keys = ["1","2","3","4","5","6","7","8","9","clear","0","delete"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 180px)", gap: 10 }}>
      {keys.map(key => (
        <button key={key} onClick={() => onInput(key)} style={{
          height: 72, borderRadius: 12,
          border: "2px solid",
          borderColor: key === "clear" ? "#dc2626" : key === "delete" ? "#d97706" : "#c1c8d4",
          background:
            key === "clear" ? "linear-gradient(to bottom, #fca5a5, #ef4444)" :
            key === "delete" ? "linear-gradient(to bottom, #fde68a, #f59e0b)" :
            "linear-gradient(to bottom, #f9fafb, #e2e8f0)",
          color: key === "clear" || key === "delete" ? "#fff" : "#111827",
          fontSize: 40, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.7) inset",
        }}>
          {key === "clear" ? "취소" : key === "delete" ? "←" : key}
        </button>
      ))}
    </div>
  );
}

function AtmCancelBar({
  onCancel, onBack, onConfirm,
}: {
  onCancel: () => void;
  onBack?: () => void;
  onConfirm?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 90,
      background: "#374151",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", gap: 16,
    }}>
      <div>
        {onBack && (
          <button onClick={onBack} style={{
            height: 64, paddingInline: 44, borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.35)",
            background: "linear-gradient(to bottom, #9ca3af, #6b7280)",
            color: "#fff", fontSize: 34, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>← 이전</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {onConfirm && (
          <button onClick={onConfirm.onClick} style={{
            height: 64, paddingInline: 44, borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.35)",
            background: "linear-gradient(to bottom, #4ade80, #16a34a, #166534)",
            color: "#fff", fontSize: 34, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>{onConfirm.label}</button>
        )}
        <button onClick={onCancel} style={{
          height: 64, paddingInline: 44, borderRadius: 999,
          border: "2px solid rgba(255,255,255,0.35)",
          background: "linear-gradient(to bottom, #fca5a5, #ef4444, #991b1b)",
          color: "#fff", fontSize: 34, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>취소 / 카드 반환</button>
      </div>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function BankPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("main");
  const [service, setService] = useState<Service>(null);
  const [pin, setPin] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [transferBank, setTransferBank] = useState("");
  const [transferAccount, setTransferAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);

  const reset = () => {
    setStep("main"); setService(null); setPin("");
    setWithdrawalAmount(0); setTransferBank(""); setTransferAccount(""); setTransferAmount(0);
  };

  const selectService = (svc: Service) => { setService(svc); setStep("warning"); };

  const handlePin = (d: string) => {
    if (d === "clear") { setPin(""); return; }
    if (d === "delete") { setPin(p => p.slice(0, -1)); return; }
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
    if (d === "delete") { setTransferAccount(p => p.slice(0, -1)); return; }
    if (transferAccount.length < 14) setTransferAccount(p => p + d);
  };

  // ── MAIN ─────────────────────────────────────────────────────────────────────
  if (step === "main") {
    const notReady = () => alert("해당 업무는 준비 중입니다");
    return (
      <AtmPage onHome={() => navigate("/")}>
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
      </AtmPage>
    );
  }

  // ── WARNING ───────────────────────────────────────────────────────────────────
  if (step === "warning") {
    return (
      <AtmPage>
        <div className="atm-body dialog">
          <section className="warning-panel">
            <h1 className="warning-title">
              <span className="accent">불법 카드복제</span> 관련 유의사항
            </h1>
            <div className="warning-body">
              최근 자동화기기에 카드 복제기를 부착하여 고객 정보 탈취를 시도한<br />
              사례가 있사오니,{" "}
              <span className="accent">카드 투입구가 아래 화면과 다른 경우에는</span><br />
              <span className="accent">사용을 중단하시고 영업점이나 인터폰으로 신고하여 주시기 바랍니다</span>
            </div>
            <div className="slot-illus" aria-label="card slot illustration">
              <div className="slot-shape" />
              <div className="slot-label">
                <div className="col"><span className="ko">카드</span><span className="en">Card</span></div>
                <div className="col"><span className="ko">명세표</span><span className="en">Receipt</span></div>
                <span className="icon" aria-hidden="true"></span>
              </div>
            </div>
          </section>
          <div className="action-row">
            <button type="button" className="action-btn cancel" onClick={() => setStep("main")}>취소</button>
            <button type="button" className="action-btn confirm" onClick={() => setStep("insert")}>확인</button>
          </div>
        </div>
      </AtmPage>
    );
  }

  // ── INSERT (카드 / 통장 삽입) ─────────────────────────────────────────────────
  if (step === "insert") {
    return (
      <AtmPage>
        <div className="atm-body insert">
          <section className="insert-panel">
            <div className="insert-titlebar">
              <h1>카드 / 통장</h1>
            </div>
            <p className="insert-prompt">
              <span className="accent">카드</span>나{" "}
              <span className="accent">통장</span>을 넣어 주십시오
            </p>
            <div className="illus-row">
              {/* 통장 */}
              <div className="illus-side passbook">
                <div className="slot-bar">
                  <span className="label">
                    <span className="ko">통장</span>
                    <span className="en">Passbook</span>
                    <span className="ic" aria-hidden="true"></span>
                  </span>
                </div>
                <div className="book" aria-label="passbook being inserted">
                  <div className="col">
                    <div className="line med"></div>
                    <div className="line short"></div>
                    <div className="line med"></div>
                    <div className="line short"></div>
                    <div className="line med"></div>
                  </div>
                  <div className="col">
                    <div className="line short"></div>
                    <div className="line med"></div>
                    <div className="line short"></div>
                    <div className="line med"></div>
                    <div className="line short"></div>
                  </div>
                </div>
              </div>
              {/* 왼쪽 커넥터 */}
              <div className="connector left">
                <svg viewBox="0 0 110 22" preserveAspectRatio="none">
                  <polyline
                    points="0,11 90,11 90,4 108,11 90,18 90,11"
                    fill="rgba(140,160,185,.45)"
                    stroke="rgba(110,135,165,.6)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* ATM 일러스트 */}
              <div className="atm-illus">
                <div className="body">
                  <div className="screen-top">
                    <div className="brand-tag"></div>
                  </div>
                  <div className="screen-bot"></div>
                  <div className="keypad">
                    {Array.from({ length: 9 }).map((_, i) => <span key={i}></span>)}
                  </div>
                  <div className="slot-detail" aria-hidden="true">
                    <svg viewBox="0 0 56 40" preserveAspectRatio="none">
                      <path
                        d="M6 22 L22 22 L30 14 L50 14"
                        fill="none"
                        stroke="#1a1d24"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="ring left" aria-hidden="true"></div>
                  <div className="ring right" aria-hidden="true"></div>
                </div>
              </div>
              {/* 오른쪽 커넥터 */}
              <div className="connector right">
                <svg viewBox="0 0 110 22" preserveAspectRatio="none">
                  <polyline
                    points="0,11 90,11 90,4 108,11 90,18 90,11"
                    fill="rgba(140,160,185,.45)"
                    stroke="rgba(110,135,165,.6)"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* 카드 슬롯 */}
              <div className="illus-side cardslot">
                <div className="slot-bar" aria-hidden="true"></div>
                <div className="card-back" aria-hidden="true"></div>
                <div className="card-front">
                  <span className="ko">카드</span>
                  <span className="en">Card</span>
                  <span className="ko"></span>
                  <span className="en"></span>
                  <span className="ic" aria-hidden="true"></span>
                </div>
              </div>
            </div>
          </section>
          <div className="action-row">
            <button type="button" className="action-btn cancel" onClick={() => setStep("main")}>취소</button>
            <button type="button" className="action-btn confirm" onClick={() => setStep("pin")}>삽입 완료</button>
          </div>
        </div>
      </AtmPage>
    );
  }

  // ── PIN ───────────────────────────────────────────────────────────────────────
  if (step === "pin") {
    return (
      <AtmPage>
        <div style={body}>
          <p style={{ fontSize: 52, fontWeight: 800, color: "#1a2a4a", marginBottom: 10 }}>비밀번호를 입력하세요</p>
          <p style={{ fontSize: 34, color: "#6b7280", marginBottom: 20 }}>4자리 숫자를 눌러주세요</p>
          <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 64, height: 64, borderRadius: "50%",
                border: `5px solid ${pin.length > i ? "#166534" : "#9ca3af"}`,
                background: pin.length > i ? "#166534" : "#fff",
                transition: "all 0.15s",
              }} />
            ))}
          </div>
          <AtmNumpad onInput={handlePin} />
        </div>
        <AtmCancelBar onCancel={reset} />
      </AtmPage>
    );
  }

  // ── WITHDRAWAL AMOUNT ─────────────────────────────────────────────────────────
  if (step === "withdrawal-amount") {
    return (
      <AtmPage>
        <div style={body}>
          <p style={{ fontSize: 52, fontWeight: 800, color: "#1a2a4a", marginBottom: 10, alignSelf: "flex-start" }}>출금 금액을 선택하세요</p>
          <p style={{ fontSize: 34, color: "#374151", marginBottom: 18, alignSelf: "flex-start" }}>
            현재 잔액: <strong style={{ color: "#166534" }}>{MOCK_BALANCE.toLocaleString()}원</strong>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", marginBottom: 16 }}>
            {QUICK_AMOUNTS.map(amount => (
              <button key={amount} onClick={() => { setWithdrawalAmount(amount); setStep("confirm"); }}
                style={{
                  height: 88, borderRadius: 14, cursor: "pointer",
                  border: "3px solid #d1d5db",
                  background: "linear-gradient(to bottom, #f9fafb, #e5e7eb)",
                  fontSize: 40, fontWeight: 700, color: "#111827",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
                  fontFamily: "inherit",
                }}>
                {amount.toLocaleString()}원
              </button>
            ))}
          </div>
          <div style={{
            width: "100%", padding: "14px 24px",
            background: "#eff6ff", border: "2px solid #bfdbfe",
            borderRadius: 12, fontSize: 28, color: "#1d4ed8", fontWeight: 600,
          }}>
            💡 다른 금액을 원하시면 직원에게 문의하세요
          </div>
        </div>
        <AtmCancelBar onCancel={reset} onBack={() => setStep("pin")} />
      </AtmPage>
    );
  }

  // ── BALANCE RESULT ────────────────────────────────────────────────────────────
  if (step === "balance-result") {
    return (
      <AtmPage onHome={() => navigate("/")}>
        <div style={{ ...bodyNoCancelBar, justifyContent: "center", alignItems: "center", gap: 28 }}>
          <p style={{ fontSize: 52, fontWeight: 800, color: "#1a2a4a" }}>잔액 조회 결과</p>
          <div style={{
            width: 700, padding: "36px 60px",
            background: "linear-gradient(to bottom, #f0fdf4, #dcfce7)",
            border: "3px solid #86efac", borderRadius: 20, textAlign: "center",
          }}>
            <p style={{ fontSize: 30, color: "#6b7280", marginBottom: 8 }}>전북은행 (****-**-123456)</p>
            <p style={{ fontSize: 30, color: "#6b7280", marginBottom: 12 }}>잔액</p>
            <p style={{ fontSize: 72, fontWeight: 800, color: "#166534" }}>{MOCK_BALANCE.toLocaleString()}원</p>
          </div>
          <button onClick={reset} style={{
            width: 500, height: 88, borderRadius: 999,
            background: "linear-gradient(to bottom, #4ade80, #16a34a, #166534)",
            border: "2px solid rgba(255,255,255,0.4)",
            color: "#fff", fontSize: 40, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>처음으로 돌아가기</button>
        </div>
      </AtmPage>
    );
  }

  // ── TRANSFER: BANK ────────────────────────────────────────────────────────────
  if (step === "transfer-bank") {
    return (
      <AtmPage>
        <div style={body}>
          <p style={{ fontSize: 52, fontWeight: 800, color: "#1a2a4a", marginBottom: 20, alignSelf: "flex-start" }}>받는 분의 은행을 선택하세요</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%" }}>
            {BANKS.map(bank => (
              <button key={bank} onClick={() => { setTransferBank(bank); setStep("transfer-account"); }}
                style={{
                  height: 82, borderRadius: 14, cursor: "pointer",
                  border: `3px solid ${transferBank === bank ? "#166534" : "#d1d5db"}`,
                  background: transferBank === bank
                    ? "linear-gradient(to bottom, #bbf7d0, #4ade80)"
                    : "linear-gradient(to bottom, #f9fafb, #e5e7eb)",
                  fontSize: 34, fontWeight: 700,
                  color: transferBank === bank ? "#166534" : "#111827",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
                  fontFamily: "inherit",
                }}>
                {bank}
              </button>
            ))}
          </div>
        </div>
        <AtmCancelBar onCancel={reset} onBack={() => setStep("pin")} />
      </AtmPage>
    );
  }

  // ── TRANSFER: ACCOUNT NUMBER ──────────────────────────────────────────────────
  if (step === "transfer-account") {
    return (
      <AtmPage>
        <div style={body}>
          <p style={{ fontSize: 48, fontWeight: 800, color: "#1a2a4a", marginBottom: 8, alignSelf: "flex-start" }}>계좌번호를 입력하세요</p>
          <p style={{ fontSize: 30, color: "#166534", fontWeight: 700, marginBottom: 12, alignSelf: "flex-start" }}>선택된 은행: {transferBank}</p>
          <div style={{
            width: "100%", height: 84, marginBottom: 14,
            background: "#f1f5f9", border: "3px solid #cbd5e1", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 46, fontWeight: 700, color: "#111827", letterSpacing: "0.08em",
          }}>
            {transferAccount || "─ ─ ─ ─ ─ ─ ─ ─"}
          </div>
          <AtmNumpad onInput={handleAccount} />
        </div>
        <AtmCancelBar
          onCancel={reset}
          onBack={() => setStep("transfer-bank")}
          onConfirm={transferAccount.length >= 10
            ? { label: "다음 →", onClick: () => setStep("transfer-amount") }
            : undefined}
        />
      </AtmPage>
    );
  }

  // ── TRANSFER: AMOUNT ──────────────────────────────────────────────────────────
  if (step === "transfer-amount") {
    return (
      <AtmPage>
        <div style={body}>
          <p style={{ fontSize: 48, fontWeight: 800, color: "#1a2a4a", marginBottom: 14, alignSelf: "flex-start" }}>이체할 금액을 선택하세요</p>
          <div style={{
            width: "100%", height: 84, marginBottom: 14,
            background: "#f1f5f9", border: "3px solid #cbd5e1", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            padding: "0 32px",
            fontSize: 50, fontWeight: 700, color: "#111827",
          }}>
            {transferAmount > 0 ? `${transferAmount.toLocaleString()}원` : "0원"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", marginBottom: 14 }}>
            {TRANSFER_AMOUNTS.map(amt => (
              <button key={amt} onClick={() => setTransferAmount(amt)}
                style={{
                  height: 76, borderRadius: 14, cursor: "pointer",
                  border: `3px solid ${transferAmount === amt ? "#166534" : "#d1d5db"}`,
                  background: transferAmount === amt
                    ? "linear-gradient(to bottom, #bbf7d0, #4ade80)"
                    : "linear-gradient(to bottom, #f9fafb, #e5e7eb)",
                  fontSize: 36, fontWeight: 700,
                  color: transferAmount === amt ? "#166534" : "#111827",
                  fontFamily: "inherit",
                }}>
                {amt >= 10000 ? `${amt / 10000}만원` : `${amt}원`}
              </button>
            ))}
          </div>
          {transferAmount > 0 && (
            <button onClick={() => setStep("confirm")} style={{
              width: "100%", height: 76, borderRadius: 999,
              background: "linear-gradient(to bottom, #4ade80, #16a34a, #166534)",
              border: "2px solid rgba(255,255,255,0.4)",
              color: "#fff", fontSize: 38, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>다음 →</button>
          )}
        </div>
        <AtmCancelBar onCancel={reset} onBack={() => setStep("transfer-account")} />
      </AtmPage>
    );
  }

  // ── DEPOSIT INSERT ────────────────────────────────────────────────────────────
  if (step === "deposit-insert") {
    return (
      <AtmPage>
        <div style={{ ...bodyNoCancelBar, justifyContent: "center", alignItems: "center", gap: 28 }}>
          <div style={{
            width: 180, height: 180, borderRadius: "50%",
            background: "linear-gradient(to bottom, #fed7aa, #f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 90, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}>💵</div>
          <p style={{ fontSize: 52, fontWeight: 700, color: "#1a2a4a", textAlign: "center", lineHeight: 1.6 }}>
            현금을 투입구에<br />넣어주세요
          </p>
          <button onClick={() => setStep("complete")} style={{
            height: 90, paddingInline: 80, borderRadius: 999,
            background: "linear-gradient(to bottom, #fdba74, #f97316, #c2410c)",
            border: "2px solid rgba(255,255,255,0.4)",
            color: "#fff", fontSize: 42, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>현금 넣기 완료</button>
        </div>
        <AtmCancelBar onCancel={reset} onBack={() => setStep("pin")} />
      </AtmPage>
    );
  }

  // ── PASSBOOK INSERT ───────────────────────────────────────────────────────────
  if (step === "passbook-insert") {
    return (
      <AtmPage>
        <div style={{ ...bodyNoCancelBar, justifyContent: "center", alignItems: "center", gap: 28 }}>
          <div style={{
            width: 180, height: 180, borderRadius: "50%",
            background: "linear-gradient(to bottom, #99f6e4, #0d9488)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 90, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}>📔</div>
          <p style={{ fontSize: 52, fontWeight: 700, color: "#1a2a4a", textAlign: "center", lineHeight: 1.6 }}>
            통장을 투입구에<br />넣어주세요
          </p>
          <button onClick={() => setStep("complete")} style={{
            height: 90, paddingInline: 80, borderRadius: 999,
            background: "linear-gradient(to bottom, #5eead4, #0d9488, #115e59)",
            border: "2px solid rgba(255,255,255,0.4)",
            color: "#fff", fontSize: 42, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>통장 넣기 완료</button>
        </div>
        <AtmCancelBar onCancel={reset} onBack={() => setStep("pin")} />
      </AtmPage>
    );
  }

  // ── CONFIRM ───────────────────────────────────────────────────────────────────
  if (step === "confirm") {
    const serviceLabel: Record<string, string> = {
      withdrawal: "출금", transfer: "이체", deposit: "입금",
      passbook: "통장정리", utility: "공과금납부",
    };
    return (
      <AtmPage>
        <div style={body}>
          <p style={{ fontSize: 52, fontWeight: 800, color: "#1a2a4a", marginBottom: 18, alignSelf: "flex-start" }}>거래 내역을 확인하세요</p>
          <div style={{
            width: "100%", padding: "22px 40px", marginBottom: 18,
            background: "#f8fafc", border: "3px solid #e2e8f0", borderRadius: 16,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              paddingBottom: 14, borderBottom: "2px solid #e2e8f0", marginBottom: 14,
            }}>
              <span style={{ fontSize: 34, color: "#6b7280" }}>업무 종류</span>
              <span style={{ fontSize: 34, fontWeight: 700, color: "#111827" }}>{serviceLabel[service ?? ""] ?? ""}</span>
            </div>
            {service === "withdrawal" && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 34, color: "#6b7280" }}>출금 금액</span>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#166534" }}>{withdrawalAmount.toLocaleString()}원</span>
              </div>
            )}
            {service === "transfer" && (<>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 34, color: "#6b7280" }}>받는 은행</span>
                <span style={{ fontSize: 34, fontWeight: 700 }}>{transferBank}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 34, color: "#6b7280" }}>계좌번호</span>
                <span style={{ fontSize: 34, fontWeight: 700 }}>{transferAccount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 34, color: "#6b7280" }}>이체 금액</span>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#166534" }}>{transferAmount.toLocaleString()}원</span>
              </div>
            </>)}
            {service === "utility" && (
              <p style={{ fontSize: 34, color: "#6b7280", textAlign: "center" }}>공과금 청구서를 넣어주세요</p>
            )}
          </div>
          <div style={{ display: "flex", gap: 14, width: "100%" }}>
            <button onClick={() => {
              if (service === "withdrawal") setStep("withdrawal-amount");
              else if (service === "transfer") setStep("transfer-amount");
              else setStep("pin");
            }} style={{
              flex: 1, height: 84, borderRadius: 999,
              background: "linear-gradient(to bottom, #9ca3af, #6b7280)",
              border: "2px solid rgba(255,255,255,0.35)",
              color: "#fff", fontSize: 34, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>← 이전</button>
            <button onClick={() => setStep("complete")} style={{
              flex: 2, height: 84, borderRadius: 999,
              background: "linear-gradient(to bottom, #4ade80, #16a34a, #166534)",
              border: "2px solid rgba(255,255,255,0.4)",
              color: "#fff", fontSize: 38, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>확인 (거래 진행)</button>
          </div>
        </div>
        <AtmCancelBar onCancel={reset} />
      </AtmPage>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────────────────────────
  if (step === "complete") {
    return (
      <AtmPage onHome={() => navigate("/")}>
        <div style={{ ...bodyNoCancelBar, justifyContent: "center", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 140, height: 140, borderRadius: "50%",
            background: "linear-gradient(to bottom, #bbf7d0, #4ade80)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 80, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}>✓</div>
          <p style={{ fontSize: 58, fontWeight: 800, color: "#166534" }}>거래가 완료되었습니다</p>
          {service === "withdrawal" && <p style={{ fontSize: 38, color: "#374151" }}>현금 {withdrawalAmount.toLocaleString()}원을 가져가세요</p>}
          {service === "transfer" && <p style={{ fontSize: 38, color: "#374151" }}>{transferAmount.toLocaleString()}원이 이체되었습니다</p>}
          {service === "deposit" && <p style={{ fontSize: 38, color: "#374151" }}>입금이 완료되었습니다</p>}
          {service === "passbook" && <p style={{ fontSize: 38, color: "#374151" }}>통장정리가 완료되었습니다</p>}
          <div style={{
            width: "80%", padding: "14px 28px",
            background: "#fefce8", border: "3px solid #fde68a",
            borderRadius: 14, fontSize: 34, color: "#854d0e", fontWeight: 600, textAlign: "center",
          }}>
            {service === "withdrawal" ? "💵 현금과 카드를 꼭 챙겨가세요!" :
              service === "passbook" ? "📔 통장과 카드를 꼭 챙겨가세요!" :
              "💳 카드를 꼭 챙겨가세요!"}
          </div>
          <button onClick={reset} style={{
            width: 500, height: 86, borderRadius: 999,
            background: "linear-gradient(to bottom, #4ade80, #16a34a, #166534)",
            border: "2px solid rgba(255,255,255,0.4)",
            color: "#fff", fontSize: 38, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>처음으로 돌아가기</button>
        </div>
      </AtmPage>
    );
  }

  return null;
}

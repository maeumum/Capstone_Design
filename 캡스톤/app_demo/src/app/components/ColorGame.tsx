import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

type GameState = "home" | "playing" | "feedback" | "levelup" | "roundSuccess" | "roundFail";
type Level = 1 | 2 | 3 | 4 | 5;

interface ColorDef { name: string; hex: string; }

const ALL_COLORS: ColorDef[] = [
  { name: "빨강", hex: "#ef4444" },
  { name: "파랑", hex: "#3b82f6" },
  { name: "초록", hex: "#22c55e" },
  { name: "노랑", hex: "#eab308" },
  { name: "보라", hex: "#a855f7" },
  { name: "주황", hex: "#f97316" },
];

const LEVEL_CONFIG: Record<Level, { requiredSuccess: number; timeLimit: number; label: string; stars: string; questionsPerRound: number; numColors: number }> = {
  1: { requiredSuccess: 3,        timeLimit: 7, label: "레벨 1", stars: "⭐",          questionsPerRound: 3, numColors: 4 },
  2: { requiredSuccess: 5,        timeLimit: 6, label: "레벨 2", stars: "⭐⭐",         questionsPerRound: 4, numColors: 4 },
  3: { requiredSuccess: 7,        timeLimit: 5, label: "레벨 3", stars: "⭐⭐⭐",        questionsPerRound: 5, numColors: 5 },
  4: { requiredSuccess: 10,       timeLimit: 4, label: "레벨 4", stars: "⭐⭐⭐⭐",       questionsPerRound: 5, numColors: 5 },
  5: { requiredSuccess: Infinity, timeLimit: 3, label: "레벨 5", stars: "⭐⭐⭐⭐⭐",      questionsPerRound: 5, numColors: 6 },
};

const THEME = {
  bg: "linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)",
  accent: "#f97316", accent2: "#fb923c",
  ink: "#431407", sub: "rgba(67,20,7,0.55)",
  chipBg: "rgba(255,255,255,0.7)", surface: "#ffffff",
  shadow: "0 10px 24px -12px rgba(249,115,22,0.45)",
};

const SUCCESS_MESSAGES = ["최고예요! 🏆", "순발력이 대단해요! ⚡", "정말 빠르시네요! 🎊", "두뇌가 건강해졌어요! 💪"];
const WRONG_MESSAGES = ["아쉬워요! 글자 말고 색을 보세요 💪", "글자에 속지 마세요! 😊", "색깔에 집중해봐요! 🔥"];

interface Question {
  displayWord: string;
  displayColor: string;
  answer: string;
  choices: ColorDef[];
}

function generateQuestion(level: Level): Question {
  const { numColors } = LEVEL_CONFIG[level];
  const active = ALL_COLORS.slice(0, numColors);
  const inkColor = active[Math.floor(Math.random() * active.length)];
  const wordOptions = active.filter(c => c.name !== inkColor.name);
  const wordColor = wordOptions[Math.floor(Math.random() * wordOptions.length)];
  const others = active.filter(c => c.name !== inkColor.name)
    .sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...others, inkColor].sort(() => Math.random() - 0.5);
  return {
    displayWord: wordColor.name,
    displayColor: inkColor.hex,
    answer: inkColor.name,
    choices,
  };
}

export default function ColorGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("home");
  const [level, setLevel] = useState<Level>(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(7);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);

  const [successCounts, setSuccessCounts] = useState<Record<Level, number>>(() => {
    const s = localStorage.getItem("colorSuccessCounts");
    return s ? JSON.parse(s) : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  });
  const [unlockedLevels, setUnlockedLevels] = useState<Set<Level>>(() => {
    const s = localStorage.getItem("colorUnlockedLevels");
    return s ? new Set(JSON.parse(s) as Level[]) : new Set<Level>([1]);
  });

  useEffect(() => {
    const el = document.querySelector(".phone-frame") as HTMLElement;
    if (!el) return;
    el.style.overflowY = (gameState === "playing" || gameState === "feedback") ? "hidden" : "";
    return () => { el.style.overflowY = ""; };
  }, [gameState]);

  const loadQuestion = useCallback((lvl: Level) => {
    setQuestion(generateQuestion(lvl));
    setSelected(null);
    setIsCorrect(false);
    setTimeLeft(LEVEL_CONFIG[lvl].timeLimit);
  }, []);

  const startGame = (lvl: Level) => {
    if (!unlockedLevels.has(lvl)) return;
    setLevel(lvl);
    setRoundIndex(0);
    setRoundErrors(0);
    setGameState("playing");
    loadQuestion(lvl);
  };

  const resetRound = (lvl: Level) => {
    setRoundIndex(0);
    setRoundErrors(0);
    loadQuestion(lvl);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState]);

  const handleAnswer = (answer: string | null) => {
    if (gameState !== "playing" || selected !== null) return;
    const correct = answer === question?.answer;
    setSelected(answer ?? "");
    setIsCorrect(correct);
    setGameState("feedback");
    const newErrors = correct ? roundErrors : roundErrors + 1;
    const newIndex = roundIndex + 1;
    const isRoundDone = newIndex >= LEVEL_CONFIG[level].questionsPerRound;
    setFeedbackMsg(correct
      ? SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]
      : WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
    );
    if (!correct) setRoundErrors(newErrors);
    setTimeout(() => {
      if (isRoundDone) {
        if (newErrors === 0) {
          setSuccessCounts(prev => {
            const n = prev[level] + 1;
            const next = { ...prev, [level]: n };
            localStorage.setItem("colorSuccessCounts", JSON.stringify(next));
            if (n >= LEVEL_CONFIG[level].requiredSuccess && level < 5) {
              const nxt = (level + 1) as Level;
              setUnlockedLevels(pu => {
                const s = new Set([...pu, nxt]);
                localStorage.setItem("colorUnlockedLevels", JSON.stringify([...s]));
                return s;
              });
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              setGameState("levelup");
            } else setGameState("roundSuccess");
            return next;
          });
        } else setGameState("roundFail");
        setRoundIndex(0);
        setRoundErrors(0);
      } else {
        setRoundIndex(newIndex);
        loadQuestion(level);
        setGameState("playing");
      }
    }, 1500);
  };

  const config = LEVEL_CONFIG[level];
  const timerPct = (timeLeft / config.timeLimit) * 100;
  const timerColor = timeLeft <= 2 ? "#ef4444" : timeLeft <= 3 ? "#f97316" : THEME.accent;

  // ── 홈 화면 ──
  if (gameState === "home") return (
    <div style={{ height: "844px", overflowY: "auto", overflowX: "hidden", background: THEME.bg, fontFamily: '"Pretendard", -apple-system, system-ui' }}>
      {showResetModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 28, padding: 28, width: 300, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", fontSize: 48 }}>⚠️</div>
            <h2 style={{ textAlign: "center", color: THEME.ink, fontWeight: 900, fontSize: 20, margin: 0 }}>레벨 초기화</h2>
            <p style={{ textAlign: "center", color: THEME.sub, fontSize: 15, margin: 0, lineHeight: 1.6 }}>모든 진행 상황이<br />초기화됩니다.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: 14, borderRadius: 14, background: "#f3f4f6", color: "#374151", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>취소</button>
              <button onClick={() => {
                localStorage.removeItem("colorSuccessCounts");
                localStorage.removeItem("colorUnlockedLevels");
                setSuccessCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
                setUnlockedLevels(new Set([1]));
                setShowResetModal(false);
              }} style={{ flex: 1, padding: 14, borderRadius: 14, background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>초기화</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => navigate("/game")} style={{ alignSelf: "flex-start", background: THEME.chipBg, color: THEME.ink, fontWeight: 700, padding: "8px 16px", borderRadius: 99, fontSize: 14, border: "none", cursor: "pointer" }}>← 뒤로가기</button>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: THEME.sub }}>BRAIN GAME</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.ink, marginTop: 2 }}>색깔 맞추기 🎨</div>
          <div style={{ fontSize: 14, color: THEME.sub, marginTop: 4 }}>글자 말고 잉크 색깔을 맞춰보세요!</div>
        </div>

        {/* 게임 설명 카드 */}
        <div style={{ background: "white", borderRadius: 20, padding: "16px 18px", boxShadow: "0 4px 16px rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.1)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.sub, marginBottom: 10 }}>이렇게 하세요!</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#3b82f6" }}>초록</div>
            <div style={{ fontSize: 20, color: THEME.sub }}>→</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["빨강", "파랑", "초록", "노랑"].map((w, i) => (
                <div key={i} style={{ padding: "4px 8px", borderRadius: 8, background: i === 1 ? "#1e293b" : "#f3f4f6", color: i === 1 ? "white" : "#374151", fontWeight: 800, fontSize: 12 }}>{w}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: THEME.sub, marginTop: 8 }}>👆 "초록"이 파란색으로 쓰였으니 "파랑" 선택!</div>
        </div>

        {([1, 2, 3, 4, 5] as Level[]).map(lvl => {
          const unlocked = unlockedLevels.has(lvl);
          const cfg = LEVEL_CONFIG[lvl];
          const count = successCounts[lvl];
          const required = cfg.requiredSuccess === Infinity ? "∞" : cfg.requiredSuccess;
          const displayCount = cfg.requiredSuccess === Infinity ? count : Math.min(count, cfg.requiredSuccess);
          const colors = ["#f97316", "#ef4444", "#a855f7", "#3b82f6", "#1e293b"];
          return (
            <button key={lvl} onClick={() => startGame(lvl)} disabled={!unlocked}
              style={{ background: unlocked ? `linear-gradient(135deg,${colors[lvl - 1]},${colors[Math.min(lvl, 4)]})` : THEME.chipBg, color: unlocked ? "white" : THEME.sub, padding: "16px 20px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: unlocked ? 1 : 0.7, cursor: unlocked ? "pointer" : "not-allowed", boxShadow: unlocked ? THEME.shadow : "inset 0 0 0 1px rgba(0,0,0,0.06)", border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {unlocked ? cfg.stars[0] : "🔒"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{cfg.label}</span>
                  <span style={{ fontSize: 12, opacity: 0.85 }}>
                    {unlocked ? `${cfg.numColors}가지 색 · ${cfg.timeLimit}초 · 성공 ${displayCount}/${required}` : "이전 레벨을 클리어하면 해금돼요!"}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.9 }}>{unlocked ? "▶" : "🔒"}</span>
            </button>
          );
        })}

        <button onClick={() => setShowResetModal(true)}
          style={{ marginTop: 4, padding: "12px 24px", borderRadius: 99, background: "linear-gradient(135deg,#fff7ed,#ffedd5)", color: THEME.accent, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, alignSelf: "center" }}>
          🔄 레벨 초기화
        </button>
      </div>
    </div>
  );

  // ── 레벨업 ──
  if (gameState === "levelup") {
    const nextLevel = (level + 1) as Level;
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 80 }}>🏆</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>순발력이 대단해요! ⚡</h1>
        <div style={{ background: THEME.accent, color: "white", padding: "12px 28px", borderRadius: 20, fontSize: 22, fontWeight: 800, boxShadow: THEME.shadow }}>🎊 레벨 {level} 클리어!</div>
        <div style={{ background: "rgba(255,255,255,0.8)", border: `2px solid ${THEME.accent2}`, color: THEME.ink, padding: "12px 24px", borderRadius: 16, fontSize: 16, fontWeight: 700, textAlign: "center" }}>🔓 레벨 {nextLevel} 해금됐어요!</div>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button onClick={() => startGame(nextLevel)} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, boxShadow: THEME.shadow }}>레벨 {nextLevel} 도전! →</button>
          <button onClick={() => setGameState("home")} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontWeight: 700, fontSize: 16 }}>처음으로</button>
        </div>
      </div>
    );
  }

  // ── 라운드 성공 ──
  if (gameState === "roundSuccess") {
    const required = config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess;
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 80 }}>🎉</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>완벽해요!</h1>
        <p style={{ color: THEME.sub, textAlign: "center", fontSize: 16, margin: 0 }}>누적 성공: {Math.min(successCounts[level], config.requiredSuccess === Infinity ? successCounts[level] : config.requiredSuccess)} / {required}</p>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button onClick={() => resetRound(level)} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, boxShadow: THEME.shadow }}>다음 라운드 →</button>
          <button onClick={() => setGameState("home")} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontWeight: 700, fontSize: 16 }}>레벨 선택</button>
        </div>
      </div>
    );
  }

  // ── 라운드 실패 ──
  if (gameState === "roundFail") {
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 80 }}>💪</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>다시 도전해봐요!</h1>
        <p style={{ color: THEME.sub, textAlign: "center", fontSize: 16, margin: 0 }}>글자 말고 색깔을 보세요!</p>
        <button onClick={() => resetRound(level)} style={{ width: "100%", height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 18, boxShadow: THEME.shadow }}>다시 도전하기!</button>
        <button onClick={() => setGameState("home")} style={{ color: THEME.sub, fontSize: 16, background: "transparent", border: "none", cursor: "pointer" }}>← 레벨 선택으로</button>
      </div>
    );
  }

  // ── 게임 화면 ──
  return (
    <div style={{ height: 844, display: "flex", flexDirection: "column", background: THEME.bg, fontFamily: '"Pretendard", -apple-system, system-ui' }}>

      {/* 헤더 */}
      <div style={{ padding: "12px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ height: 38, padding: "0 14px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6, background: THEME.chipBg, fontSize: 13, fontWeight: 600, color: THEME.accent }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: THEME.accent }} />
            {config.label}
          </div>
          <div style={{ height: 38, padding: "0 14px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6, background: THEME.chipBg, fontSize: 13, fontWeight: 600, color: timeLeft <= 2 ? "#ef4444" : THEME.ink }}>
            ⏱ {timeLeft}초
          </div>
        </div>
        <div style={{ height: 38, padding: "0 14px", borderRadius: 99, background: THEME.chipBg, display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: THEME.accent }}>
          {roundIndex + 1} / {config.questionsPerRound}
        </div>
      </div>

      {/* 타이머 바 */}
      <div style={{ margin: "0 20px", height: 10, borderRadius: 99, background: "rgba(249,115,22,0.1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 99, transition: "width 1s linear" }} />
      </div>

      {/* 성공 카운트 */}
      <div style={{ margin: "8px 20px 0", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ color: THEME.sub, fontSize: 12, fontWeight: 700 }}>
          성공: <span style={{ color: THEME.accent }}>{Math.min(successCounts[level], config.requiredSuccess === Infinity ? successCounts[level] : config.requiredSuccess)}</span> / {config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess}
        </span>
      </div>

      {/* 메인 게임 영역 */}
      <div style={{ flex: 1, padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* 문제 카드 */}
        <div style={{ background: "white", borderRadius: 28, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(249,115,22,0.12)", gap: 16 }}>
  <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink }}>
    이 글자의 색깔은?
  </div>
  <div style={{ fontSize: 88, fontWeight: 900, color: question?.displayColor, letterSpacing: "-2px", lineHeight: 1, textShadow: `0 8px 24px ${question?.displayColor}44` }}>
    {question?.displayWord}
  </div>
  <div style={{ fontSize: 18, color: THEME.sub, fontWeight: 700 }}>
    글자 뜻 말고 색깔을 선택!
  </div>
</div>

        {/* 답안 4개 (텍스트 버튼) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {question?.choices.map((color, i) => {
            const showResult = gameState === "feedback";
            const isAnswer = color.name === question.answer;
            const isSelected = selected === color.name;
            let bg = "white", textColor = THEME.ink, border = "2px solid rgba(249,115,22,0.12)";
            if (showResult && isAnswer) { bg = "#22c55e"; textColor = "white"; border = "2px solid #16a34a"; }
            else if (showResult && isSelected && !isAnswer) { bg = "#ef4444"; textColor = "white"; border = "2px solid #dc2626"; }
            return (
              <button key={i} onClick={() => handleAnswer(color.name)}
                disabled={gameState === "feedback"}
                style={{ height: 68, borderRadius: 20, background: bg, border, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: textColor }}>{color.name}</span>
              </button>
            );
          })}
        </div>

        {/* 피드백 */}
        {gameState === "feedback" && (
          <div style={{ textAlign: "center", padding: "12px", borderRadius: 16, background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: isCorrect ? "#16a34a" : "#dc2626", fontWeight: 700, fontSize: 14 }}>
            {isCorrect ? `✅ 정답! ${feedbackMsg}` : `❌ 정답은 "${question?.answer}"이에요! ${feedbackMsg}`}
          </div>
        )}
      </div>

      {/* 하단 */}
      <div style={{ padding: "8px 20px 20px", display: "flex", gap: 10 }}>
        <button onClick={() => setGameState("home")} style={{ flex: 1, height: 48, borderRadius: 16, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontSize: 14, fontWeight: 700, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>레벨 선택</button>
        <button onClick={() => resetRound(level)} style={{ flex: 1, height: 48, borderRadius: 16, border: "none", cursor: "pointer", background: THEME.ink, color: "#fff", fontSize: 14, fontWeight: 700 }}>🔄 다시시작</button>
      </div>
    </div>
  );
}
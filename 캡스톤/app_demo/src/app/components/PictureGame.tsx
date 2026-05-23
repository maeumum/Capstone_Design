import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

type GameState = "home" | "playing" | "feedback" | "levelup" | "roundSuccess" | "roundFail";
type Level = 1 | 2 | 3 | 4 | 5;

interface QuizItem {
  word: string;
  code: string;
  category: string;
}

const CDN = (code: string) =>
  `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/${code}.svg`;

const ITEMS: Record<Level, QuizItem[]> = {
  1: [
    { word: "사과",   code: "1F34E", category: "과일" },
    { word: "바나나", code: "1F34C", category: "과일" },
    { word: "수박",   code: "1F349", category: "과일" },
    { word: "강아지", code: "1F436", category: "동물" },
    { word: "고양이", code: "1F431", category: "동물" },
    { word: "자동차", code: "1F697", category: "탈것" },
    { word: "피자",   code: "1F355", category: "음식" },
    { word: "집",     code: "1F3E0", category: "건물" },
  ],
  2: [
    { word: "딸기",     code: "1F353", category: "과일" },
    { word: "코끼리",   code: "1F418", category: "동물" },
    { word: "비행기",   code: "2708",  category: "탈것" },
    { word: "나비",     code: "1F98B", category: "곤충" },
    { word: "사자",     code: "1F981", category: "동물" },
    { word: "무지개",   code: "1F308", category: "자연" },
    { word: "해바라기", code: "1F33B", category: "식물" },
    { word: "펭귄",     code: "1F427", category: "동물" },
  ],
  3: [
    { word: "여우",     code: "1F98A", category: "동물" },
    { word: "개구리",   code: "1F438", category: "동물" },
    { word: "기타",     code: "1F3B8", category: "악기" },
    { word: "파인애플", code: "1F34D", category: "과일" },
    { word: "돌고래",   code: "1F42C", category: "동물" },
    { word: "문어",     code: "1F419", category: "동물" },
    { word: "기린",     code: "1F992", category: "동물" },
    { word: "얼룩말",   code: "1F993", category: "동물" },
  ],
  4: [
    { word: "악어",     code: "1F40A", category: "동물" },
    { word: "낙타",     code: "1F42A", category: "동물" },
    { word: "공작",     code: "1F99A", category: "동물" },
    { word: "하마",     code: "1F99B", category: "동물" },
    { word: "플라밍고", code: "1F9A9", category: "동물" },
    { word: "코뿔소",   code: "1F98F", category: "동물" },
    { word: "게",       code: "1F980", category: "동물" },
    { word: "전갈",     code: "1F982", category: "동물" },
  ],
  5: [
    { word: "박쥐",     code: "1F987", category: "동물" },
    { word: "고슴도치", code: "1F994", category: "동물" },
    { word: "앵무새",   code: "1F99C", category: "동물" },
    { word: "도마뱀",   code: "1F98E", category: "동물" },
    { word: "뱀",       code: "1F40D", category: "동물" },
    { word: "독수리",   code: "1F985", category: "동물" },
    { word: "두루미",   code: "1F9A2", category: "동물" },
    { word: "용",       code: "1F409", category: "전설" },
  ],
};

const LEVEL_CONFIG: Record<Level, {
  requiredSuccess: number; timeLimit: number;
  label: string; stars: string;
  questionsPerRound: number; startInset: number;
}> = {
  1: { requiredSuccess: 3,        timeLimit: 30, label: "레벨 1", stars: "⭐",          questionsPerRound: 3, startInset: 20 },
  2: { requiredSuccess: 5,        timeLimit: 28, label: "레벨 2", stars: "⭐⭐",         questionsPerRound: 4, startInset: 28 },
  3: { requiredSuccess: 7,        timeLimit: 25, label: "레벨 3", stars: "⭐⭐⭐",        questionsPerRound: 5, startInset: 34 },
  4: { requiredSuccess: 10,       timeLimit: 22, label: "레벨 4", stars: "⭐⭐⭐⭐",       questionsPerRound: 5, startInset: 38 },
  5: { requiredSuccess: Infinity, timeLimit: 20, label: "레벨 5", stars: "⭐⭐⭐⭐⭐",      questionsPerRound: 5, startInset: 43 },
};

const THEME = {
  bg: "linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%)",
  accent: "#10b981",
  accent2: "#34d399",
  ink: "#064E3B",
  sub: "rgba(6,78,59,0.55)",
  chipBg: "rgba(255,255,255,0.7)",
  surface: "#ffffff",
  shadow: "0 10px 24px -12px rgba(16,185,129,0.45)",
};

const SUCCESS_MESSAGES = ["최고예요! 🏆", "눈이 정말 좋으시네요! ✨", "정말 대단해요! 🎊", "두뇌가 건강해졌어요! 💪"];
const WRONG_MESSAGES = ["아쉬워요! 다시 도전해봐요 💪", "괜찮아요, 다음엔 맞출 수 있어요! 😊", "조금만 더 집중해봐요! 🔥"];

function generateChoices(correctWord: string, level: Level): string[] {
  const all: string[] = [];
  ([1, 2, 3, 4, 5] as Level[]).forEach(l =>
    ITEMS[l].forEach(q => { if (q.word !== correctWord && !all.includes(q.word)) all.push(q.word); })
  );
  const wrong = all.sort(() => Math.random() - 0.5).slice(0, 3);
  return [...wrong, correctWord].sort(() => Math.random() - 0.5);
}

export default function PictureGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("home");
  const [level, setLevel] = useState<Level>(1);
  const [currentItem, setCurrentItem] = useState<QuizItem | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [shownWords, setShownWords] = useState<string[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [successCounts, setSuccessCounts] = useState<Record<Level, number>>(() => {
    const s = localStorage.getItem("pictureSuccessCounts");
    return s ? JSON.parse(s) : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  });
  const [unlockedLevels, setUnlockedLevels] = useState<Set<Level>>(() => {
    const s = localStorage.getItem("pictureUnlockedLevels");
    return s ? new Set(JSON.parse(s) as Level[]) : new Set<Level>([1]);
  });

  useEffect(() => {
    const el = document.querySelector(".phone-frame") as HTMLElement;
    if (!el) return;
    el.style.overflowY = (gameState === "playing" || gameState === "feedback") ? "hidden" : "";
    return () => { el.style.overflowY = ""; };
  }, [gameState]);

  const loadQuestion = useCallback((lvl: Level, shown: string[]) => {
    let pool = ITEMS[lvl].filter(q => !shown.includes(q.word));
    if (pool.length === 0) { pool = ITEMS[lvl]; setShownWords([]); }
    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentItem(q);
    setChoices(generateChoices(q.word, lvl));
    setSelected(null);
    setIsCorrect(false);
    setTimeLeft(LEVEL_CONFIG[lvl].timeLimit);
    setImgLoaded(false);
    setShownWords(prev => [...prev, q.word]);
  }, []);

  const startGame = (lvl: Level) => {
    if (!unlockedLevels.has(lvl)) return;
    setLevel(lvl);
    setShownWords([]);
    setRoundIndex(0);
    setRoundErrors(0);
    setGameState("playing");
    loadQuestion(lvl, []);
  };

  const resetRound = (lvl: Level) => {
    setShownWords([]);
    setRoundIndex(0);
    setRoundErrors(0);
    loadQuestion(lvl, []);
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
    const correct = answer === currentItem?.word;
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
            localStorage.setItem("pictureSuccessCounts", JSON.stringify(next));
            if (n >= LEVEL_CONFIG[level].requiredSuccess && level < 5) {
              const nxt = (level + 1) as Level;
              setUnlockedLevels(pu => {
                const s = new Set([...pu, nxt]);
                localStorage.setItem("pictureUnlockedLevels", JSON.stringify([...s]));
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
        loadQuestion(level, shownWords);
        setGameState("playing");
      }
    }, 1600);
  };

  const config = LEVEL_CONFIG[level];
  const timerPct = (timeLeft / config.timeLimit) * 100;
  const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f97316" : THEME.accent;
  // 시간이 줄수록 더 많이 보임
  const insetPct = Math.round((timeLeft / config.timeLimit) * config.startInset);

  // ── 홈 화면 ──
  if (gameState === "home") return (
    <div style={{ minHeight: "100%", background: THEME.bg, fontFamily: '"Pretendard", -apple-system, system-ui' }}>
      {showResetModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 28, padding: 28, width: 300, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", fontSize: 48 }}>⚠️</div>
            <h2 style={{ textAlign: "center", color: THEME.ink, fontWeight: 900, fontSize: 20, margin: 0 }}>레벨 초기화</h2>
            <p style={{ textAlign: "center", color: THEME.sub, fontSize: 15, margin: 0, lineHeight: 1.6 }}>모든 진행 상황이<br />초기화됩니다.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: 14, borderRadius: 14, background: "#f3f4f6", color: "#374151", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>취소</button>
              <button onClick={() => {
                localStorage.removeItem("pictureSuccessCounts");
                localStorage.removeItem("pictureUnlockedLevels");
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
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.ink, marginTop: 2 }}>부분 그림 맞추기 🖼️</div>
          <div style={{ fontSize: 14, color: THEME.sub, marginTop: 4 }}>그림 일부만 보고 무엇인지 맞춰보세요!</div>
        </div>

        {([1, 2, 3, 4, 5] as Level[]).map(lvl => {
          const unlocked = unlockedLevels.has(lvl);
          const cfg = LEVEL_CONFIG[lvl];
          const count = successCounts[lvl];
          const required = cfg.requiredSuccess === Infinity ? "∞" : cfg.requiredSuccess;
          const displayCount = cfg.requiredSuccess === Infinity ? count : Math.min(count, cfg.requiredSuccess);
          const colors = ["#10b981", "#059669", "#0d9488", "#0891b2", "#0284c7"];
          return (
            <button key={lvl} onClick={() => startGame(lvl)} disabled={!unlocked}
              style={{ background: unlocked ? `linear-gradient(135deg, ${colors[lvl - 1]}, ${colors[Math.min(lvl, 4)]})` : THEME.chipBg, color: unlocked ? "white" : THEME.sub, padding: "16px 20px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: unlocked ? 1 : 0.7, cursor: unlocked ? "pointer" : "not-allowed", boxShadow: unlocked ? THEME.shadow : "inset 0 0 0 1px rgba(0,0,0,0.06)", border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {unlocked ? cfg.stars[0] : "🔒"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{cfg.label}</span>
                  <span style={{ fontSize: 12, opacity: 0.85 }}>
                    {unlocked ? `${cfg.questionsPerRound}문제 세트 · ${cfg.timeLimit}초 · 성공 ${displayCount}/${required}` : "이전 레벨을 클리어하면 해금돼요!"}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.9 }}>{unlocked ? "▶" : "🔒"}</span>
            </button>
          );
        })}

        <button onClick={() => setShowResetModal(true)}
          style={{ marginTop: 4, padding: "12px 24px", borderRadius: 99, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", color: THEME.accent, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, alignSelf: "center" }}>
          🔄 레벨 초기화
        </button>

        <div style={{ textAlign: "center", fontSize: 10, color: THEME.sub, marginTop: 4 }}>
          이미지 제공: OpenMoji (CC BY-SA 4.0)
        </div>
      </div>
    </div>
  );

  // ── 레벨업 ──
  if (gameState === "levelup") {
    const nextLevel = (level + 1) as Level;
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 80 }}>🏆</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>눈이 정말 좋으시네요! ✨</h1>
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
        <p style={{ color: THEME.sub, textAlign: "center", fontSize: 16, margin: 0 }}>모두 맞춰야 성공이에요!</p>
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
          <div style={{ height: 38, padding: "0 14px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6, background: THEME.chipBg, fontSize: 13, fontWeight: 600, color: timeLeft <= 10 ? "#ef4444" : THEME.ink }}>
            ⏱ {timeLeft}초
          </div>
        </div>
        <div style={{ height: 38, padding: "0 14px", borderRadius: 99, background: THEME.chipBg, display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: THEME.accent }}>
          {roundIndex + 1} / {config.questionsPerRound}
        </div>
      </div>

      {/* 타이머 바 */}
      <div style={{ margin: "0 20px", height: 8, borderRadius: 99, background: "rgba(16,185,129,0.1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 99, transition: "width 1s linear" }} />
      </div>

      {/* 성공 카운트 */}
      <div style={{ margin: "8px 20px 0", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ color: THEME.sub, fontSize: 12, fontWeight: 700 }}>
          성공: <span style={{ color: THEME.accent }}>{Math.min(successCounts[level], config.requiredSuccess === Infinity ? successCounts[level] : config.requiredSuccess)}</span> / {config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess}
        </span>
      </div>

      {/* 그림 영역 */}
      <div style={{ flex: 1, padding: "12px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* 카테고리 힌트 */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: THEME.sub, background: "rgba(16,185,129,0.1)", padding: "4px 16px", borderRadius: 99 }}>
            {currentItem?.category} 카테고리
          </span>
        </div>

        {/* 부분 그림 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 220, height: 220,
            borderRadius: 28,
            background: "white",
            boxShadow: "0 12px 32px rgba(16,185,129,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}>
            {!imgLoaded && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>⏳</div>
            )}
            {currentItem && (
              <img
                key={currentItem.code}
                src={CDN(currentItem.code)}
                alt="?"
                onLoad={() => setImgLoaded(true)}
                style={{
                  width: 180, height: 180,
                  clipPath: gameState === "feedback"
                    ? "inset(0% round 0px)"
                    : `inset(${insetPct}% round 12px)`,
                  transition: gameState === "feedback" ? "clip-path 0.5s ease" : "clip-path 1s linear",
                  opacity: imgLoaded ? 1 : 0,
                }}
              />
            )}
            {/* 안 보이는 영역 어둡게 */}
            {gameState === "playing" && imgLoaded && (
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(circle at center, transparent ${(100 - insetPct * 2)}%, rgba(16,185,129,0.15) 100%)`,
                pointerEvents: "none",
              }} />
            )}
          </div>
        </div>

        {/* 안내 문구 */}
        <div style={{ textAlign: "center", color: THEME.sub, fontSize: 13, fontWeight: 600 }}>
          {gameState === "playing" ? "⏰ 시간이 지날수록 그림이 더 보여요!" : ""}
        </div>

        {/* 4지선다 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {choices.map((choice, i) => {
            const isSelected = selected === choice;
            const showResult = gameState === "feedback";
            const isAnswer = choice === currentItem?.word;
            let bg = "white", color = THEME.ink, border = "2px solid rgba(16,185,129,0.15)";
            if (showResult && isAnswer) { bg = "#22c55e"; color = "white"; border = "2px solid #16a34a"; }
            else if (showResult && isSelected && !isAnswer) { bg = "#ef4444"; color = "white"; border = "2px solid #dc2626"; }
            return (
              <button key={i} onClick={() => handleAnswer(choice)}
                disabled={gameState === "feedback"}
                style={{ height: 60, borderRadius: 18, background: bg, color, fontWeight: 800, fontSize: 17, border, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", cursor: "pointer", transition: "all 0.2s" }}>
                {choice}
              </button>
            );
          })}
        </div>

        {/* 피드백 */}
        {gameState === "feedback" && (
          <div style={{ textAlign: "center", padding: "12px", borderRadius: 16, background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: isCorrect ? "#16a34a" : "#dc2626", fontWeight: 700, fontSize: 14 }}>
            {isCorrect ? `✅ 정답! ${feedbackMsg}` : `❌ 정답은 "${currentItem?.word}" 입니다. ${feedbackMsg}`}
          </div>
        )}
      </div>

      {/* 하단 */}
      <div style={{ padding: "8px 20px 20px", display: "flex", gap: 10 }}>
        <button onClick={() => setGameState("home")} style={{ flex: 1, height: 48, borderRadius: 16, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontSize: 14, fontWeight: 700, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
          레벨 선택
        </button>
        <button onClick={() => resetRound(level)} style={{ flex: 1, height: 48, borderRadius: 16, border: "none", cursor: "pointer", background: THEME.ink, color: "#fff", fontSize: 14, fontWeight: 700 }}>
          🔄 다시시작
        </button>
      </div>
    </div>
  );
}
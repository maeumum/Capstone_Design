import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

type GameState = "home" | "playing" | "feedback" | "levelup" | "roundSuccess" | "roundFail";
type Level = 1 | 2 | 3 | 4 | 5;

interface Question {
  word: string;
  chosung: string;
  category: string;
  emoji: string;
}

const QUESTIONS: Record<Level, Question[]> = {
  1: [
    { word: "사과", chosung: "ㅅ ㄱ", category: "과일", emoji: "🍎" },
    { word: "수박", chosung: "ㅅ ㅂ", category: "과일", emoji: "🍉" },
    { word: "포도", chosung: "ㅍ ㄷ", category: "과일", emoji: "🍇" },
    { word: "사자", chosung: "ㅅ ㅈ", category: "동물", emoji: "🦁" },
    { word: "토끼", chosung: "ㅌ ㄲ", category: "동물", emoji: "🐰" },
    { word: "당근", chosung: "ㄷ ㄱ", category: "채소", emoji: "🥕" },
    { word: "라면", chosung: "ㄹ ㅁ", category: "음식", emoji: "🍜" },
    { word: "피자", chosung: "ㅍ ㅈ", category: "음식", emoji: "🍕" },
    { word: "의자", chosung: "ㅇ ㅈ", category: "가구", emoji: "🪑" },
    { word: "사탕", chosung: "ㅅ ㅌ", category: "간식", emoji: "🍬" },
  ],
  2: [
    { word: "강아지", chosung: "ㄱ ㅇ ㅈ", category: "동물", emoji: "🐶" },
    { word: "고양이", chosung: "ㄱ ㅇ ㅇ", category: "동물", emoji: "🐱" },
    { word: "바나나", chosung: "ㅂ ㄴ ㄴ", category: "과일", emoji: "🍌" },
    { word: "자동차", chosung: "ㅈ ㄷ ㅊ", category: "탈것", emoji: "🚗" },
    { word: "비행기", chosung: "ㅂ ㅎ ㄱ", category: "탈것", emoji: "✈️" },
    { word: "자전거", chosung: "ㅈ ㅈ ㄱ", category: "탈것", emoji: "🚲" },
    { word: "원숭이", chosung: "ㅇ ㅅ ㅇ", category: "동물", emoji: "🐒" },
    { word: "호랑이", chosung: "ㅎ ㄹ ㅇ", category: "동물", emoji: "🐯" },
    { word: "초콜릿", chosung: "ㅊ ㅋ ㄹ", category: "간식", emoji: "🍫" },
    { word: "수영복", chosung: "ㅅ ㅇ ㅂ", category: "의류", emoji: "🩱" },
  ],
  3: [
    { word: "코끼리", chosung: "ㅋ ㄲ ㄹ", category: "동물", emoji: "🐘" },
    { word: "독수리", chosung: "ㄷ ㅅ ㄹ", category: "동물", emoji: "🦅" },
    { word: "고릴라", chosung: "ㄱ ㄹ ㄹ", category: "동물", emoji: "🦍" },
    { word: "삼겹살", chosung: "ㅅ ㄱ ㅅ", category: "음식", emoji: "🥩" },
    { word: "불고기", chosung: "ㅂ ㄱ ㄱ", category: "음식", emoji: "🍖" },
    { word: "태권도", chosung: "ㅌ ㄱ ㄷ", category: "스포츠", emoji: "🥋" },
    { word: "수영장", chosung: "ㅅ ㅇ ㅈ", category: "장소", emoji: "🏊" },
    { word: "도서관", chosung: "ㄷ ㅅ ㄱ", category: "장소", emoji: "📚" },
    { word: "경찰관", chosung: "ㄱ ㅊ ㄱ", category: "직업", emoji: "👮" },
    { word: "소방관", chosung: "ㅅ ㅂ ㄱ", category: "직업", emoji: "🧑‍🚒" },
  ],
  4: [
    { word: "김치찌개", chosung: "ㄱ ㅊ ㅉ ㄱ", category: "음식", emoji: "🍲" },
    { word: "된장찌개", chosung: "ㄷ ㅈ ㅉ ㄱ", category: "음식", emoji: "🫕" },
    { word: "해바라기", chosung: "ㅎ ㅂ ㄹ ㄱ", category: "식물", emoji: "🌻" },
    { word: "세탁기", chosung: "ㅅ ㅌ ㄱ", category: "가전", emoji: "👕" },
    { word: "선풍기", chosung: "ㅅ ㅍ ㄱ", category: "가전", emoji: "🌬️" },
    { word: "백화점", chosung: "ㅂ ㅎ ㅈ", category: "건물", emoji: "🏬" },
    { word: "놀이공원", chosung: "ㄴ ㅇ ㄱ ㅇ", category: "장소", emoji: "🎡" },
    { word: "스파게티", chosung: "ㅅ ㅍ ㄱ ㅌ", category: "음식", emoji: "🍝" },
    { word: "아이스크림", chosung: "ㅇ ㅇ ㅅ ㅋ", category: "간식", emoji: "🍦" },
    { word: "텔레비전", chosung: "ㅌ ㄹ ㅂ ㅈ", category: "가전", emoji: "📺" },
  ],
  5: [
    { word: "지하철역", chosung: "ㅈ ㅎ ㅊ ㅇ", category: "장소", emoji: "🚇" },
    { word: "고속도로", chosung: "ㄱ ㅅ ㄷ ㄹ", category: "장소", emoji: "🛣️" },
    { word: "국립공원", chosung: "ㄱ ㄹ ㄱ ㅇ", category: "장소", emoji: "🌲" },
    { word: "피아노", chosung: "ㅍ ㅇ ㄴ", category: "악기", emoji: "🎹" },
    { word: "바이올린", chosung: "ㅂ ㅇ ㅇ ㄹ", category: "악기", emoji: "🎻" },
    { word: "하모니카", chosung: "ㅎ ㅁ ㄴ ㅋ", category: "악기", emoji: "🎵" },
    { word: "무궁화꽃", chosung: "ㅁ ㄱ ㅎ ㄲ", category: "식물", emoji: "🌸" },
    { word: "천문학자", chosung: "ㅊ ㅁ ㅎ ㅈ", category: "직업", emoji: "🔭" },
    { word: "대통령", chosung: "ㄷ ㅌ ㄹ", category: "직책", emoji: "🏛️" },
    { word: "청와대", chosung: "ㅊ ㅇ ㄷ", category: "장소", emoji: "🏯" },
  ],
};

const LEVEL_CONFIG: Record<Level, { requiredSuccess: number; timeLimit: number; label: string; stars: string; questionsPerRound: number }> = {
  1: { requiredSuccess: 3,        timeLimit: 30, label: "레벨 1", stars: "⭐",          questionsPerRound: 3 },
  2: { requiredSuccess: 5,        timeLimit: 25, label: "레벨 2", stars: "⭐⭐",         questionsPerRound: 4 },
  3: { requiredSuccess: 7,        timeLimit: 20, label: "레벨 3", stars: "⭐⭐⭐",        questionsPerRound: 5 },
  4: { requiredSuccess: 10,       timeLimit: 20, label: "레벨 4", stars: "⭐⭐⭐⭐",       questionsPerRound: 5 },
  5: { requiredSuccess: Infinity, timeLimit: 15, label: "레벨 5", stars: "⭐⭐⭐⭐⭐",      questionsPerRound: 5 },
};

const THEME = {
  bg: "linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 100%)",
  accent: "#6366f1",
  accent2: "#818cf8",
  ink: "#1e1b4b",
  sub: "rgba(30,27,75,0.55)",
  chipBg: "rgba(255,255,255,0.7)",
  surface: "#ffffff",
  shadow: "0 10px 24px -12px rgba(99,102,241,0.45)",
};

const SUCCESS_MESSAGES = ["최고예요! 🏆", "두뇌가 10년 젊어졌어요! ✨", "정말 대단해요! 🎊", "두뇌가 건강해졌어요! 💪"];
const WRONG_MESSAGES = ["아쉬워요! 다시 도전해봐요 💪", "괜찮아요, 다음엔 맞출 수 있어요! 😊", "익숙해지면 잘 할거에요! 🔥"];

function generateChoices(correctWord: string, level: Level): string[] {
  const allWords: string[] = [];
  ([1, 2, 3, 4, 5] as Level[]).forEach(l => {
    QUESTIONS[l].forEach(q => {
      if (q.word !== correctWord && !allWords.includes(q.word)) allWords.push(q.word);
    });
  });
  const wrong = allWords.sort(() => Math.random() - 0.5).slice(0, 3);
  return [...wrong, correctWord].sort(() => Math.random() - 0.5);
}

export default function ChosungGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("home");
  const [level, setLevel] = useState<Level>(1);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [eliminatedChoice, setEliminatedChoice] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [shownWords, setShownWords] = useState<string[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);

  const [successCounts, setSuccessCounts] = useState<Record<Level, number>>(() => {
    const saved = localStorage.getItem("chosungSuccessCounts");
    return saved ? JSON.parse(saved) : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  });

  const [unlockedLevels, setUnlockedLevels] = useState<Set<Level>>(() => {
    const saved = localStorage.getItem("chosungUnlockedLevels");
    return saved ? new Set(JSON.parse(saved) as Level[]) : new Set<Level>([1]);
  });

  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const phoneFrame = document.querySelector(".phone-frame") as HTMLElement;
    if (!phoneFrame) return;
    phoneFrame.style.overflowY = (gameState === "playing" || gameState === "feedback") ? "hidden" : "";
    return () => { phoneFrame.style.overflowY = ""; };
  }, [gameState]);

  const loadQuestion = useCallback((lvl: Level, currentShown: string[]) => {
    let pool = QUESTIONS[lvl].filter(q => !currentShown.includes(q.word));
    if (pool.length === 0) {
      pool = QUESTIONS[lvl];
      setShownWords([]);
    }
    const q = pool[Math.floor(Math.random() * pool.length)];
    const c = generateChoices(q.word, lvl);
    setCurrentQ(q);
    setChoices(c);
    setSelected(null);
    setIsCorrect(false);
    setHintUsed(false);
    setEliminatedChoice(null);
    setTimeLeft(LEVEL_CONFIG[lvl].timeLimit);
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
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const handleAnswer = (answer: string | null) => {
    if (gameState !== "playing" || selected !== null) return;
    const correct = answer === currentQ?.word;
    setSelected(answer ?? "");
    setIsCorrect(correct);
    setGameState("feedback");

    const newErrors = correct ? roundErrors : roundErrors + 1;
    const newIndex = roundIndex + 1;
    const isRoundDone = newIndex >= LEVEL_CONFIG[level].questionsPerRound;

    if (correct) {
      setFeedbackMsg(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
    } else {
      setRoundErrors(newErrors);
      setFeedbackMsg(WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]);
    }

    setTimeout(() => {
      if (isRoundDone) {
        if (newErrors === 0) {
          // 라운드 성공!
          setSuccessCounts(prev => {
            const newCount = prev[level] + 1;
            const newCounts = { ...prev, [level]: newCount };
            localStorage.setItem("chosungSuccessCounts", JSON.stringify(newCounts));
            if (newCount >= LEVEL_CONFIG[level].requiredSuccess && level < 5) {
              const nextLevel = (level + 1) as Level;
              setUnlockedLevels(prevU => {
                const next = new Set([...prevU, nextLevel]);
                localStorage.setItem("chosungUnlockedLevels", JSON.stringify([...next]));
                return next;
              });
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              setGameState("levelup");
            } else {
              setGameState("roundSuccess");
            }
            return newCounts;
          });
        } else {
          setGameState("roundFail");
        }
        setRoundIndex(0);
        setRoundErrors(0);
      } else {
        setRoundIndex(newIndex);
        loadQuestion(level, shownWords);
        setGameState("playing");
      }
    }, 1500);
  };

  const useHint = () => {
    if (hintUsed || gameState !== "playing") return;
    setHintUsed(true);
    const wrong = choices.filter(c => c !== currentQ?.word && c !== eliminatedChoice);
    if (wrong.length > 0) setEliminatedChoice(wrong[Math.floor(Math.random() * wrong.length)]);
  };

  const config = LEVEL_CONFIG[level];
  const timerPct = (timeLeft / config.timeLimit) * 100;
  const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f97316" : THEME.accent;

  // 홈 화면
  if (gameState === "home") {
    return (
      <div style={{ minHeight: "100%", background: THEME.bg, fontFamily: '"Pretendard", -apple-system, system-ui' }}>
        {showResetModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: 28, padding: 28, width: 300, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", fontSize: 48 }}>⚠️</div>
              <h2 style={{ textAlign: "center", color: THEME.ink, fontWeight: 900, fontSize: 20, margin: 0 }}>레벨 초기화</h2>
              <p style={{ textAlign: "center", color: THEME.sub, fontSize: 15, margin: 0, lineHeight: 1.6 }}>모든 진행 상황이<br/>초기화됩니다.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: 14, borderRadius: 14, background: "#f3f4f6", color: "#374151", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>취소</button>
                <button onClick={() => { localStorage.removeItem("chosungSuccessCounts"); localStorage.removeItem("chosungUnlockedLevels"); setSuccessCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }); setUnlockedLevels(new Set([1])); setShowResetModal(false); }} style={{ flex: 1, padding: 14, borderRadius: 14, background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>초기화</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => navigate("/game")} style={{ alignSelf: "flex-start", background: THEME.chipBg, color: THEME.ink, fontWeight: 700, padding: "8px 16px", borderRadius: 99, fontSize: 14, border: "none", cursor: "pointer" }}>← 뒤로가기</button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: THEME.sub }}>BRAIN GAME</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: THEME.ink, marginTop: 2 }}>초성 게임 💬</div>
            <div style={{ fontSize: 14, color: THEME.sub, marginTop: 4 }}>초성을 보고 단어를 맞춰보세요!</div>
          </div>
          {([1, 2, 3, 4, 5] as Level[]).map(lvl => {
            const unlocked = unlockedLevels.has(lvl);
            const cfg = LEVEL_CONFIG[lvl];
            const count = successCounts[lvl];
            const required = cfg.requiredSuccess === Infinity ? "∞" : cfg.requiredSuccess;
            const displayCount = cfg.requiredSuccess === Infinity ? count : Math.min(count, cfg.requiredSuccess);
            const colors = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f43f5e"];
            return (
              <button key={lvl} onClick={() => startGame(lvl)} disabled={!unlocked}
                style={{ background: unlocked ? `linear-gradient(135deg, ${colors[lvl-1]}, ${colors[Math.min(lvl, 4)]})` : THEME.chipBg, color: unlocked ? "white" : THEME.sub, padding: "16px 20px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: unlocked ? 1 : 0.7, cursor: unlocked ? "pointer" : "not-allowed", boxShadow: unlocked ? THEME.shadow : "inset 0 0 0 1px rgba(0,0,0,0.06)", border: "none" }}>
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
            style={{ marginTop: 4, padding: "12px 24px", borderRadius: 99, background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", color: THEME.accent, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, alignSelf: "center" }}>
            🔄 레벨 초기화
          </button>
        </div>
      </div>
    );
  }

  // 레벨업
  if (gameState === "levelup") {
    const nextLevel = (level + 1) as Level;
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: '"Pretendard", system-ui' }}>
        <div style={{ fontSize: 80 }}>🏆</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>두뇌가 10년 젊어졌어요! ✨</h1>
        <div style={{ background: THEME.accent, color: "white", padding: "12px 28px", borderRadius: 20, fontSize: 22, fontWeight: 800, boxShadow: THEME.shadow }}>🎊 레벨 {level} 클리어!</div>
        <div style={{ background: "rgba(255,255,255,0.8)", border: `2px solid ${THEME.accent2}`, color: THEME.ink, padding: "12px 24px", borderRadius: 16, fontSize: 16, fontWeight: 700, textAlign: "center" }}>🔓 레벨 {nextLevel} 해금됐어요!</div>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button onClick={() => startGame(nextLevel)} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, boxShadow: THEME.shadow }}>레벨 {nextLevel} 도전! →</button>
          <button onClick={() => setGameState("home")} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontWeight: 700, fontSize: 16 }}>처음으로</button>
        </div>
      </div>
    );
  }

  // 라운드 성공
  if (gameState === "roundSuccess") {
    const required = config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess;
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: '"Pretendard", system-ui' }}>
        <div style={{ fontSize: 80 }}>🎉</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>완벽해요!</h1>
        <p style={{ color: THEME.sub, textAlign: "center", fontSize: 16, margin: 0 }}>
          누적 성공: {Math.min(successCounts[level], config.requiredSuccess === Infinity ? successCounts[level] : config.requiredSuccess)} / {required}
        </p>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button onClick={() => resetRound(level)} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, boxShadow: THEME.shadow }}>다음 라운드 →</button>
          <button onClick={() => setGameState("home")} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontWeight: 700, fontSize: 16 }}>레벨 선택</button>
        </div>
      </div>
    );
  }

  // 라운드 실패
  if (gameState === "roundFail") {
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: '"Pretendard", system-ui' }}>
        <div style={{ fontSize: 80 }}>💪</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>다시 도전해봐요!</h1>
        <p style={{ color: THEME.sub, textAlign: "center", fontSize: 16, margin: 0 }}>모두 맞춰야 성공이에요!</p>
        <button onClick={() => resetRound(level)} style={{ width: "100%", height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 18, boxShadow: THEME.shadow }}>다시 도전하기!</button>
        <button onClick={() => setGameState("home")} style={{ color: THEME.sub, fontSize: 16, background: "transparent", border: "none", cursor: "pointer" }}>← 레벨 선택으로</button>
      </div>
    );
  }

  // 게임 화면
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
        <button onClick={useHint} disabled={hintUsed || gameState === "feedback"}
          style={{ height: 38, padding: "0 16px", borderRadius: 99, border: "none", cursor: hintUsed ? "default" : "pointer", background: hintUsed ? THEME.chipBg : THEME.accent, color: hintUsed ? THEME.sub : "white", fontWeight: 700, fontSize: 14, boxShadow: hintUsed ? "none" : THEME.shadow }}>
          💡 {hintUsed ? "사용됨" : "힌트"}
        </button>
      </div>

      {/* 타이머 바 */}
      <div style={{ margin: "0 20px", height: 8, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 99, transition: "width 1s linear" }} />
      </div>

      {/* 라운드 진행 + 성공 카운트 */}
      <div style={{ margin: "8px 20px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: THEME.sub, fontSize: 12, fontWeight: 700 }}>
          문제: <span style={{ color: THEME.accent }}>{roundIndex + 1}</span> / {config.questionsPerRound}
        </span>
        <span style={{ color: THEME.sub, fontSize: 12, fontWeight: 700 }}>
          성공: <span style={{ color: THEME.accent }}>{Math.min(successCounts[level], config.requiredSuccess === Infinity ? successCounts[level] : config.requiredSuccess)}</span> / {config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess}
        </span>
      </div>

      {/* 문제 카드 */}
      <div style={{ flex: 1, padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* 카테고리 + 이모지 */}
        <div style={{ background: "white", borderRadius: 24, padding: "20px", textAlign: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.12)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 64 }}>{currentQ?.emoji}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: THEME.sub, background: "rgba(99,102,241,0.08)", padding: "4px 16px", borderRadius: 99 }}>
            {currentQ?.category}
          </div>
        </div>

        {/* 초성 */}
        <div style={{ background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accent2})`, borderRadius: 24, padding: "20px", textAlign: "center", boxShadow: THEME.shadow }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em", marginBottom: 8 }}>초성을 보고 단어를 맞춰보세요!</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "white", letterSpacing: "0.3em", lineHeight: 1 }}>
            {currentQ?.chosung}
          </div>
        </div>

        {/* 보기 4개 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {choices.map((choice, i) => {
            const isEliminated = choice === eliminatedChoice;
            const isSelected = selected === choice;
            const showResult = gameState === "feedback";
            const isAnswer = choice === currentQ?.word;
            let bg = "white", color = THEME.ink, border = "2px solid rgba(99,102,241,0.1)", opacity = 1;
            if (isEliminated) { opacity = 0.3; }
            else if (showResult && isAnswer) { bg = "#22c55e"; color = "white"; border = "2px solid #16a34a"; }
            else if (showResult && isSelected && !isAnswer) { bg = "#ef4444"; color = "white"; border = "2px solid #dc2626"; }
            return (
              <button key={i} onClick={() => !isEliminated && handleAnswer(choice)}
                disabled={isEliminated || gameState === "feedback"}
                style={{ height: 64, borderRadius: 18, background: bg, color, fontWeight: 800, fontSize: 18, border, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", cursor: isEliminated ? "default" : "pointer", opacity, transition: "all 0.2s" }}>
                {choice}
              </button>
            );
          })}
        </div>

        {/* 피드백 */}
        {gameState === "feedback" && (
          <div style={{ textAlign: "center", padding: "12px", borderRadius: 16, background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: isCorrect ? "#16a34a" : "#dc2626", fontWeight: 700, fontSize: 15 }}>
            {isCorrect ? `✅ 정답! ${feedbackMsg}` : `❌ 정답은 "${currentQ?.word}" 입니다. ${feedbackMsg}`}
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
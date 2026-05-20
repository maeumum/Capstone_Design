import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

type GameState = "home" | "playing" | "success" | "levelup" | "fail";
type Level = 1 | 2 | 3 | 4 | 5;

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const LEVEL_CONFIG: Record<Level, { pairs: number; timeLimit: number; requiredSuccess: number; label: string }> = {
  1: { pairs: 2, timeLimit: 90,  requiredSuccess: 3,        label: "⭐" },
  2: { pairs: 3, timeLimit: 75,  requiredSuccess: 5,        label: "⭐⭐" },
  3: { pairs: 4, timeLimit: 60,  requiredSuccess: 7,        label: "⭐⭐⭐" },
  4: { pairs: 5, timeLimit: 50,  requiredSuccess: 10,       label: "⭐⭐⭐⭐" },
  5: { pairs: 6, timeLimit: 40,  requiredSuccess: Infinity, label: "⭐⭐⭐⭐⭐" },
};

const EMOJIS = ["🍎","🍌","🍇","🍓","🍑","🍊","🍋","🍍","🥝","🍒"];
const SUCCESS_MESSAGES = ["최고예요! 🏆","두뇌가 10년 젊어졌어요! ✨","두뇌가 건강해졌어요! 💪","정말 대단해요! 🎊"];
const FAIL_MESSAGES = ["다시 도전해볼까요? 💪","익숙해지면 잘 할거에요! 😊","다시 연습해 봅시다! 🔥"];

export default function GamePage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("home");
  const [level, setLevel] = useState<Level>(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [message, setMessage] = useState("");
  const [hintUsed, setHintUsed] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const [successCounts, setSuccessCounts] = useState<Record<Level, number>>(() => {
    const saved = localStorage.getItem("successCounts");
    return saved ? JSON.parse(saved) : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  });

  const [unlockedLevels, setUnlockedLevels] = useState<Set<Level>>(() => {
    const saved = localStorage.getItem("unlockedLevels");
    return saved ? new Set(JSON.parse(saved) as Level[]) : new Set<Level>([1]);
  });

  // 게임 플레이 중 PhoneFrame 스크롤 막기
  useEffect(() => {
    const phoneFrame = document.querySelector(".phone-frame") as HTMLElement;
    if (!phoneFrame) return;
    if (gameState === "playing") {
      phoneFrame.style.overflowY = "hidden";
    } else {
      phoneFrame.style.overflowY = "";
    }
    return () => { phoneFrame.style.overflowY = ""; };
  }, [gameState]);

  const initCards = useCallback((lvl: Level): Card[] => {
    const { pairs } = LEVEL_CONFIG[lvl];
    const selected = EMOJIS.slice(0, pairs);
    const doubled = [...selected, ...selected];
    const shuffled = doubled.sort(() => Math.random() - 0.5);
    return shuffled.map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }));
  }, []);

  const startGame = (lvl: Level) => {
    if (!unlockedLevels.has(lvl)) return;
    setLevel(lvl);
    setCards(initCards(lvl));
    setFlippedCards([]);
    setMatchedPairs(0);
    setTimeLeft(LEVEL_CONFIG[lvl].timeLimit);
    setHintUsed(false);
    setIsHinting(false);
    setIsChecking(false);
    setGameState("playing");
  };

  // 타이머
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setMessage(FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]);
      setGameState("fail");
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const handleSuccess = useCallback(() => {
    const msg = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
    setMessage(msg);
    setSuccessCounts(prev => {
      const newCount = prev[level] + 1;
      const newCounts = { ...prev, [level]: newCount };
      localStorage.setItem("successCounts", JSON.stringify(newCounts));
      if (newCount >= LEVEL_CONFIG[level].requiredSuccess && level < 5) {
        const nextLevel = (level + 1) as Level;
        setUnlockedLevels(prevU => {
          const next = new Set([...prevU, nextLevel]);
          localStorage.setItem("unlockedLevels", JSON.stringify([...next]));
          return next;
        });
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setGameState("levelup");
      } else {
        setGameState("success");
      }
      return newCounts;
    });
  }, [level]);

  const handleCardClick = (id: number) => {
    if (isChecking || isHinting || gameState !== "playing") return;
    const card = cards[id];
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;
    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(p => {
            const next = p + 1;
            if (next === LEVEL_CONFIG[level].pairs) handleSuccess();
            return next;
          });
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const useHint = () => {
    if (hintUsed || isHinting) return;
    setHintUsed(true);
    setIsHinting(true);
    const hintPairs = level <= 2 ? 1 : 2;
    setCards(prev => {
      const unmatched = prev.filter(c => !c.isMatched);
      const emojis = [...new Set(unmatched.map(c => c.emoji))];
      const selected = new Set(emojis.sort(() => Math.random() - 0.5).slice(0, hintPairs));
      return prev.map(c => selected.has(c.emoji) && !c.isMatched ? { ...c, isFlipped: true } : c);
    });
    setTimeout(() => {
      setCards(prev => prev.map(c => c.isMatched ? c : { ...c, isFlipped: false }));
      setFlippedCards([]);
      setIsHinting(false);
    }, 2000);
  };

  const config = LEVEL_CONFIG[level];
  const cols = config.pairs <= 4 ? 2 : 3;
  const rows = Math.ceil((config.pairs * 2) / cols);

  // 홈 화면
  if (gameState === "home") {
    return (
      <div style={{ minHeight: "100%", background: "linear-gradient(to bottom, #f3e8ff, #e9d5ff)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => navigate("/")} style={{ alignSelf: "flex-start", background: "white", color: "#6d28d9", fontWeight: 700, padding: "8px 16px", borderRadius: 12, fontSize: 16 }}>
          ← 뒤로가기
        </button>
        <div style={{ textAlign: "center", fontSize: 48 }}>🃏</div>
        <h1 style={{ textAlign: "center", color: "#4c1d95", fontWeight: 900, fontSize: 26, margin: 0 }}>카드 짝 맞추기</h1>
        <p style={{ textAlign: "center", color: "#7c3aed", fontSize: 14, margin: 0 }}>같은 카드를 찾아 짝을 맞춰보세요!</p>
        {([1, 2, 3, 4, 5] as Level[]).map(lvl => {
          const unlocked = unlockedLevels.has(lvl);
          const cfg = LEVEL_CONFIG[lvl];
          const count = successCounts[lvl];
          const required = cfg.requiredSuccess === Infinity ? "∞" : cfg.requiredSuccess;
          const colors = ["#22c55e","#3b82f6","#f97316","#ef4444","#7c3aed"];
          return (
            <button key={lvl} onClick={() => startGame(lvl)} disabled={!unlocked}
              style={{ background: unlocked ? colors[lvl-1] : "#9ca3af", color: "white", padding: "14px 20px", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: unlocked ? 1 : 0.6, cursor: unlocked ? "pointer" : "not-allowed", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{unlocked ? cfg.label : "🔒"} 레벨 {lvl}</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>
                  {unlocked ? `카드 ${cfg.pairs*2}장 · ${cfg.timeLimit}초 · 성공 ${count}/${required}` : "이전 레벨을 클리어하면 해금돼요!"}
                </span>
              </div>
              <span style={{ fontSize: 24 }}>{unlocked ? "▶" : "🔒"}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 성공 화면
  if (gameState === "success") {
    const required = config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess;
    return (
      <div style={{ height: "100%", background: "linear-gradient(to bottom, #fefce8, #fef9c3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 80 }}>🎉</div>
        <h1 style={{ color: "#ca8a04", textAlign: "center", fontWeight: 900, fontSize: 34, margin: 0 }}>{message}</h1>
        <p style={{ color: "#6b7280", textAlign: "center", fontSize: 18, margin: 0 }}>레벨 {level} 성공: {successCounts[level]} / {required}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={() => startGame(level)} style={{ background: "#22c55e", color: "white", padding: "16px 22px", borderRadius: 16, fontSize: 18, fontWeight: 700 }}>🔄 다시 하기</button>
          <button onClick={() => setGameState("home")} style={{ background: "#7c3aed", color: "white", padding: "16px 22px", borderRadius: 16, fontSize: 18, fontWeight: 700 }}>레벨 선택</button>
        </div>
      </div>
    );
  }

  // 레벨업 화면
  if (gameState === "levelup") {
    const nextLevel = (level + 1) as Level;
    return (
      <div style={{ height: "100%", background: "linear-gradient(to bottom, #f3e8ff, #fce7f3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>
        <div style={{ fontSize: 80 }}>🏆</div>
        <h1 style={{ color: "#6d28d9", textAlign: "center", fontWeight: 900, fontSize: 34, margin: 0 }}>{message}</h1>
        <div style={{ background: "#7c3aed", color: "white", padding: "12px 28px", borderRadius: 16, fontSize: 24, fontWeight: 800 }}>🎊 레벨 {level} 클리어!</div>
        <div style={{ background: "#fef9c3", border: "2px solid #fbbf24", color: "#b45309", padding: "10px 20px", borderRadius: 14, fontSize: 18, fontWeight: 700, textAlign: "center" }}>🔓 레벨 {nextLevel} 해금됐어요!</div>
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button onClick={() => startGame(nextLevel)} style={{ background: "#7c3aed", color: "white", padding: "16px 22px", borderRadius: 16, fontSize: 18, fontWeight: 700 }}>레벨 {nextLevel} 도전! →</button>
          <button onClick={() => setGameState("home")} style={{ background: "#9ca3af", color: "white", padding: "16px 22px", borderRadius: 16, fontSize: 18, fontWeight: 700 }}>처음으로</button>
        </div>
      </div>
    );
  }

  // 실패 화면
  if (gameState === "fail") {
    return (
      <div style={{ height: "100%", background: "linear-gradient(to bottom, #eff6ff, #dbeafe)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 80 }}>💪</div>
        <h1 style={{ color: "#2563eb", textAlign: "center", fontWeight: 900, fontSize: 34, margin: 0 }}>{message}</h1>
        <button onClick={() => startGame(level)} style={{ background: "#3b82f6", color: "white", padding: "16px 32px", borderRadius: 16, fontSize: 20, fontWeight: 700 }}>다시 도전하기!</button>
        <button onClick={() => setGameState("home")} style={{ color: "#6b7280", fontSize: 18, background: "transparent" }}>← 레벨 선택으로</button>
      </div>
    );
  }

  // 게임 화면
  return (
    <div style={{ height: 844, display: "flex", flexDirection: "column", background: "linear-gradient(to bottom, #f3e8ff, #e9d5ff)" }}>

      {/* 헤더 */}
      <div style={{ background: "#7c3aed", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 17 }}>🃏 레벨 {level} {config.label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: timeLeft <= 10 ? "#fca5a5" : "white" }}>⏱ {timeLeft}초</span>
          <button onClick={useHint} disabled={hintUsed}
            style={{ padding: "6px 12px", borderRadius: 10, fontWeight: 700, fontSize: 14, background: hintUsed ? "#6b7280" : "#facc15", color: hintUsed ? "#d1d5db" : "#111" }}>
            {hintUsed ? "사용됨" : "💡 힌트"}
          </button>
        </div>
      </div>

      {/* 진행상황 */}
      <div style={{ background: "#6d28d9", padding: "5px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ color: "#ddd6fe", fontSize: 13 }}>누적 성공: {successCounts[level]} / {config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess}</span>
        <span style={{ color: "#ddd6fe", fontSize: 13 }}>짝 맞춤: {matchedPairs} / {config.pairs}</span>
      </div>

      {/* 카드 영역 */}
      <div style={{ flex: 1, minHeight: 0, padding: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 10, width: "100%", height: "100%" }}>
          {cards.map(card => (
            <button key={card.id} onClick={() => handleCardClick(card.id)}
              style={{ borderRadius: 16, fontSize: cols === 2 ? 48 : 34, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "all 0.2s", background: card.isMatched ? "#bbf7d0" : card.isFlipped ? "white" : "#7c3aed", cursor: card.isMatched ? "default" : "pointer", width: "100%", height: "100%", minHeight: 0 }}>
              {card.isFlipped || card.isMatched ? card.emoji : "❓"}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 */}
      <div style={{ background: "#374151", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => setGameState("home")} style={{ background: "#6b7280", color: "white", padding: "8px 18px", borderRadius: 10, fontSize: 15 }}>← 레벨 선택</button>
        <button onClick={() => startGame(level)} style={{ background: "#ef4444", color: "white", padding: "8px 18px", borderRadius: 10, fontSize: 15 }}>🔄 다시시작</button>
      </div>
    </div>
  );
}
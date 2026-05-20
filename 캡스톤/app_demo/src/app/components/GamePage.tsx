import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

type GameState = "home" | "playing" | "success" | "levelup" | "fail";
type Level = 1 | 2 | 3 | 4 | 5;
interface Card { id: number; emoji: string; isFlipped: boolean; isMatched: boolean; }

const THEME = {
  bg: 'linear-gradient(180deg, #FFF1E0 0%, #FFE0E8 60%, #F5D9FF 100%)',
  ink: '#2A1E18', sub: 'rgba(42,30,24,0.55)',
  accent: '#FF6F5C', accent2: '#FFB347',
  cardBack: 'linear-gradient(135deg, #FF6F5C 0%, #FF9A6E 50%, #FFC36B 100%)',
  cardFront: '#FFFFFF',
  cardMatched: 'linear-gradient(135deg, #E9F8E5 0%, #D8F0E0 100%)',
  progressTrack: 'rgba(42,30,24,0.08)',
  progressFill: 'linear-gradient(90deg, #FF6F5C, #FFB347)',
  shadow: '0 10px 24px -12px rgba(255,111,92,0.45)',
  chipBg: 'rgba(255,255,255,0.7)',
  surface: '#FFFBF5',
};

const LEVEL_CONFIG: Record<Level, { pairs: number; timeLimit: number; requiredSuccess: number; label: string; stars: string; cols: number }> = {
  1: { pairs: 2, timeLimit: 90,  requiredSuccess: 3,        label: "레벨 1", stars: "⭐",     cols: 2 },
  2: { pairs: 3, timeLimit: 75,  requiredSuccess: 5,        label: "레벨 2", stars: "⭐⭐",    cols: 3 },
  3: { pairs: 4, timeLimit: 60,  requiredSuccess: 7,        label: "레벨 3", stars: "⭐⭐⭐",   cols: 3 },
  4: { pairs: 6, timeLimit: 90,  requiredSuccess: 10,       label: "레벨 4", stars: "⭐⭐⭐⭐",  cols: 3 },
  5: { pairs: 8, timeLimit: 120, requiredSuccess: Infinity, label: "레벨 5", stars: "⭐⭐⭐⭐⭐", cols: 4 },
};

const EMOJIS = ["🍓","🍊","🍋","🍉","🍇","🥝","🍑","🥥","🍎","🍌","🫐","🍒","🍍","🥭","🍐","🍈"];
const SUCCESS_MESSAGES = ["최고예요! 🏆","두뇌가 10년 젊어졌어요! ✨","두뇌가 건강해졌어요! 💪","정말 대단해요! 🎊"];
const FAIL_MESSAGES = ["다시 도전해볼까요? 💪","익숙해지면 잘 할거에요! 😊","다시 연습해 봅시다! 🔥"];

function fmtTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return `${m}:${r}`;
}

function CardBackPattern({ kind }: { kind: string }) {
  const color = 'rgba(255,255,255,0.22)';
  if (kind === 'dots') return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <defs><pattern id="dp" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="1.6" fill={color} />
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#dp)" />
    </svg>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="38%" height="38%" viewBox="0 0 24 24">
        <path d="M12 2 L14.4 9.4 L22 9.4 L15.8 14 L18.2 21.4 L12 16.8 L5.8 21.4 L8.2 14 L2 9.4 L9.6 9.4 Z" fill={color} />
      </svg>
    </div>
  );
}

function GameCard({ emoji, state, onClick, size }: { emoji: string; state: 'back' | 'front' | 'matched'; onClick: () => void; size: number }) {
  const flipped = state !== 'back';
  const matched = state === 'matched';
  return (
    <button onClick={onClick} style={{ width: size, height: size, padding: 0, border: 'none', background: 'transparent', perspective: 800, cursor: 'pointer', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 460ms cubic-bezier(.2,.9,.25,1.2)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: THEME.cardBack, boxShadow: THEME.shadow + ', inset 0 1px 0 rgba(255,255,255,0.35)', overflow: 'hidden', backfaceVisibility: 'hidden' }}>
          <CardBackPattern kind="dots" />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: matched ? THEME.cardMatched : THEME.cardFront, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.48, lineHeight: 1, boxShadow: matched ? `inset 0 0 0 1.5px ${THEME.accent2}` : '0 6px 14px -8px rgba(0,0,0,0.18)', transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', transition: 'background 280ms' }}>
          <span style={{ transform: matched ? 'scale(0.78)' : 'scale(1)', transition: 'transform 320ms cubic-bezier(.2,.9,.25,1.2)', opacity: matched ? 0.55 : 1 }}>{emoji}</span>
          {matched && (
            <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 99, background: THEME.accent2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5 10 17.5 19 7.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function GamePage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("home");
  const [level, setLevel] = useState<Level>(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState("");
  const [hintUsed, setHintUsed] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [successCounts, setSuccessCounts] = useState<Record<Level, number>>(() => {
    const saved = localStorage.getItem("successCounts");
    return saved ? JSON.parse(saved) : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  });

  const [unlockedLevels, setUnlockedLevels] = useState<Set<Level>>(() => {
    const saved = localStorage.getItem("unlockedLevels");
    return saved ? new Set(JSON.parse(saved) as Level[]) : new Set<Level>([1]);
  });

  useEffect(() => {
    const phoneFrame = document.querySelector(".phone-frame") as HTMLElement;
    if (!phoneFrame) return;
    phoneFrame.style.overflowY = gameState === "playing" ? "hidden" : "";
    return () => { phoneFrame.style.overflowY = ""; };
  }, [gameState]);

  const initCards = useCallback((lvl: Level): Card[] => {
    const { pairs } = LEVEL_CONFIG[lvl];
    const selected = EMOJIS.slice(0, pairs);
    const doubled = [...selected, ...selected];
    return doubled.sort(() => Math.random() - 0.5).map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }));
  }, []);

  const startGame = (lvl: Level) => {
    if (!unlockedLevels.has(lvl)) return;
    setLevel(lvl);
    setCards(initCards(lvl));
    setFlippedCards([]);
    setMatchedPairs(0);
    setTimeLeft(LEVEL_CONFIG[lvl].timeLimit);
    setElapsed(0);
    setHintUsed(false);
    setIsHinting(false);
    setIsChecking(false);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setMessage(FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]);
      setGameState("fail");
      return;
    }
    const timer = setTimeout(() => { setTimeLeft(t => t - 1); setElapsed(e => e + 1); }, 1000);
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
          setCards(prev => prev.map(c => c.id === first || c.id === second ? { ...c, isMatched: true } : c));
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
          setCards(prev => prev.map(c => c.id === first || c.id === second ? { ...c, isFlipped: false } : c));
          setFlippedCards([]);
          setIsChecking(false);
        }, 750);
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
  const cols = config.cols;
  const gap = 12;
  const boardW = 390 - 48;
  const cardSize = (boardW - gap * (cols - 1)) / cols;

  // 레벨3 특수 배치 포지션 (4x4 격자, 대각선 + 가운데)
  const level3Positions = [
    { col: 1, row: 1 }, { col: 4, row: 1 },
    { col: 2, row: 2 }, { col: 3, row: 2 },
    { col: 2, row: 3 }, { col: 3, row: 3 },
    { col: 1, row: 4 }, { col: 4, row: 4 },
  ];
  const level3CardSize = (boardW - gap * 3) / 4;

  // 홈 화면
  if (gameState === "home") {
    return (
      <div style={{ minHeight: "100%", background: THEME.bg, fontFamily: '"Pretendard", -apple-system, system-ui, sans-serif' }}>
        <style>{`@keyframes sheetIn { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {showResetModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: 28, padding: 28, width: 300, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 16, animation: "sheetIn 320ms cubic-bezier(.2,.9,.25,1.2)" }}>
              <div style={{ textAlign: "center", fontSize: 48 }}>⚠️</div>
              <h2 style={{ textAlign: "center", color: THEME.ink, fontWeight: 900, fontSize: 20, margin: 0 }}>레벨 초기화</h2>
              <p style={{ textAlign: "center", color: THEME.sub, fontSize: 15, margin: 0, lineHeight: 1.6 }}>모든 레벨 진행 상황이<br/>초기화됩니다.<br/>정말 초기화하시겠습니까?</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: 14, borderRadius: 14, background: "#f3f4f6", color: "#374151", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>취소</button>
                <button onClick={() => { localStorage.removeItem("successCounts"); localStorage.removeItem("unlockedLevels"); setSuccessCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }); setUnlockedLevels(new Set([1])); setShowResetModal(false); }} style={{ flex: 1, padding: 14, borderRadius: 14, background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: THEME.shadow }}>초기화</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => navigate("/")} style={{ alignSelf: "flex-start", background: THEME.chipBg, color: THEME.ink, fontWeight: 700, padding: "8px 16px", borderRadius: 99, fontSize: 14, border: "none", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)", backdropFilter: "blur(14px)" }}>← 뒤로가기</button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: THEME.sub }}>BRAIN GAME</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: THEME.ink, marginTop: 2 }}>카드 짝 맞추기 🃏</div>
          </div>

          {([1, 2, 3, 4, 5] as Level[]).map(lvl => {
            const unlocked = unlockedLevels.has(lvl);
            const cfg = LEVEL_CONFIG[lvl];
            const count = successCounts[lvl];
            const required = cfg.requiredSuccess === Infinity ? "∞" : cfg.requiredSuccess;
            const displayCount = cfg.requiredSuccess === Infinity ? count : Math.min(count, cfg.requiredSuccess);
            const colors = ["#FF6F5C","#FF9A6E","#FFB347","#36C9B5","#5B6CFF"];
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
                      {unlocked ? `카드 ${cfg.pairs*2}장 · ${cfg.timeLimit}초 · 성공 ${displayCount}/${required}` : "이전 레벨을 클리어하면 해금돼요!"}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 20, opacity: 0.9 }}>{unlocked ? "▶" : "🔒"}</span>
              </button>
            );
          })}

          <button onClick={() => setShowResetModal(true)}
            style={{ marginTop: 4, padding: "12px 24px", borderRadius: 99, background: "linear-gradient(135deg, #fff1f0, #ffe4e1)", color: "#ef4444", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "inset 0 0 0 1px rgba(239,68,68,0.15)", alignSelf: "center" }}>
            🔄 레벨 초기화
          </button>
        </div>
      </div>
    );
  }

  // 성공 화면
  if (gameState === "success") {
    const required = config.requiredSuccess === Infinity ? "∞" : config.requiredSuccess;
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: '"Pretendard", system-ui' }}>
        <div style={{ fontSize: 80 }}>🎉</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>{message}</h1>
        <p style={{ color: THEME.sub, textAlign: "center", fontSize: 16, margin: 0 }}>레벨 {level} 성공: {successCounts[level]} / {required}</p>
        <p style={{ color: THEME.sub, textAlign: "center", fontSize: 14, margin: 0 }}>⏱ {fmtTime(elapsed)}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 8, width: "100%" }}>
          <button onClick={() => startGame(level)} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontWeight: 700, fontSize: 16, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>🔄 다시 하기</button>
          <button onClick={() => setGameState("home")} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, boxShadow: THEME.shadow }}>레벨 선택</button>
        </div>
      </div>
    );
  }

  // 레벨업 화면
  if (gameState === "levelup") {
    const nextLevel = (level + 1) as Level;
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: '"Pretendard", system-ui' }}>
        <div style={{ fontSize: 80 }}>🏆</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>{message}</h1>
        <div style={{ background: THEME.accent, color: "white", padding: "12px 28px", borderRadius: 20, fontSize: 22, fontWeight: 800, boxShadow: THEME.shadow }}>🎊 레벨 {level} 클리어!</div>
        <div style={{ background: "rgba(255,255,255,0.8)", border: `2px solid ${THEME.accent2}`, color: THEME.ink, padding: "12px 24px", borderRadius: 16, fontSize: 16, fontWeight: 700, textAlign: "center" }}>🔓 레벨 {nextLevel} 해금됐어요!</div>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button onClick={() => startGame(nextLevel)} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 16, boxShadow: THEME.shadow }}>레벨 {nextLevel} 도전! →</button>
          <button onClick={() => setGameState("home")} style={{ flex: 1, height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontWeight: 700, fontSize: 16 }}>처음으로</button>
        </div>
      </div>
    );
  }

  // 실패 화면
  if (gameState === "fail") {
    return (
      <div style={{ height: "100%", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: '"Pretendard", system-ui' }}>
        <div style={{ fontSize: 80 }}>💪</div>
        <h1 style={{ color: THEME.ink, textAlign: "center", fontWeight: 900, fontSize: 32, margin: 0 }}>{message}</h1>
        <button onClick={() => startGame(level)} style={{ width: "100%", height: 52, borderRadius: 18, border: "none", cursor: "pointer", background: THEME.accent, color: "white", fontWeight: 700, fontSize: 18, boxShadow: THEME.shadow }}>다시 도전하기!</button>
        <button onClick={() => setGameState("home")} style={{ color: THEME.sub, fontSize: 16, background: "transparent", border: "none", cursor: "pointer" }}>← 레벨 선택으로</button>
      </div>
    );
  }

  // 게임 화면
  const pct = Math.round((matchedPairs / config.pairs) * 100);

  return (
    <div style={{ height: 844, display: "flex", flexDirection: "column", background: THEME.bg, fontFamily: '"Pretendard", -apple-system, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* 상단 타이틀 */}
      <div style={{ padding: "16px 24px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: THEME.sub }}>MEMORY MATCH</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.ink, marginTop: 1 }}>카드를 짝지어 봐요</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 99, background: THEME.chipBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏆</div>
      </div>

      {/* 칩 헤더 */}
      <div style={{ padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ height: 38, padding: "0 14px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6, background: THEME.chipBg, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, color: THEME.accent }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: THEME.accent }} />
            {config.label}
          </div>
          <div style={{ height: 38, padding: "0 14px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6, background: THEME.chipBg, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, color: timeLeft <= 10 ? "#ef4444" : THEME.ink }}>
            ⏱ {fmtTime(timeLeft)}
          </div>
        </div>
        <button onClick={useHint} disabled={hintUsed} style={{ height: 44, padding: "0 16px", borderRadius: 99, border: "none", cursor: hintUsed ? "default" : "pointer", background: hintUsed ? THEME.chipBg : THEME.accent, color: hintUsed ? THEME.sub : "white", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, boxShadow: hintUsed ? "none" : THEME.shadow }}>
          💡 {hintUsed ? "사용됨" : "힌트"}
        </button>
      </div>

      {/* 프로그레스 */}
      <div style={{ padding: "14px 24px 6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: THEME.sub, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>MATCHED</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: THEME.accent }}>{matchedPairs}</span>
            <span style={{ color: THEME.sub }}> / {config.pairs}</span>
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 99, background: THEME.progressTrack, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: THEME.progressFill, borderRadius: 99, transition: "width 480ms cubic-bezier(.2,.9,.25,1.2)" }} />
        </div>
      </div>

      {/* 카드 보드 */}
      <div style={{ flex: 1, minHeight: 0, padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {level === 3 ? (
          // 레벨3 특수 배치: 대각선 4개 + 가운데 4개
          <div style={{ display: "grid", gridTemplateColumns: `repeat(4, ${level3CardSize}px)`, gridTemplateRows: `repeat(4, ${level3CardSize}px)`, gap, width: boardW }}>
            {cards.map((card, i) => (
              <div key={card.id} style={{ gridColumn: level3Positions[i].col, gridRow: level3Positions[i].row }}>
                <GameCard
                  emoji={card.emoji}
                  state={card.isMatched ? 'matched' : card.isFlipped ? 'front' : 'back'}
                  onClick={() => handleCardClick(card.id)}
                  size={level3CardSize}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, width: boardW }}>
            {cards.map(card => (
              <GameCard
                key={card.id}
                emoji={card.emoji}
                state={card.isMatched ? 'matched' : card.isFlipped ? 'front' : 'back'}
                onClick={() => handleCardClick(card.id)}
                size={cardSize}
              />
            ))}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div style={{ padding: "8px 20px 20px", display: "flex", gap: 10 }}>
        <button onClick={() => setGameState("home")} style={{ flex: 1, height: 52, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: "pointer", background: THEME.surface, color: THEME.ink, fontSize: 15, fontWeight: 700, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
          레벨 선택
        </button>
        <button onClick={() => startGame(level)} style={{ flex: 1, height: 52, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: "pointer", background: THEME.ink, color: "#fff", fontSize: 15, fontWeight: 700, boxShadow: "0 10px 24px -14px rgba(0,0,0,0.4)" }}>
          🔄 다시 시작
        </button>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

type GameState = "home" | "playing" | "feedback" | "levelup" | "roundSuccess" | "roundFail";
type Level = 1 | 2 | 3 | 4 | 5;

interface QuizItem {
  word: string; code: string; category: string; difficulty: 1|2|3|4|5;
}

const CDN = (code: string) =>
  `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code.toLowerCase()}.svg`;

const ALL_ITEMS: QuizItem[] = [
  { word:"사과",      code:"1F34E", category:"과일", difficulty:1 },
  { word:"바나나",    code:"1F34C", category:"과일", difficulty:1 },
  { word:"수박",      code:"1F349", category:"과일", difficulty:1 },
  { word:"오렌지",    code:"1F34A", category:"과일", difficulty:1 },
  { word:"딸기",      code:"1F353", category:"과일", difficulty:2 },
  { word:"포도",      code:"1F347", category:"과일", difficulty:2 },
  { word:"레몬",      code:"1F34B", category:"과일", difficulty:2 },
  { word:"체리",      code:"1F352", category:"과일", difficulty:3 },
  { word:"파인애플",  code:"1F34D", category:"과일", difficulty:3 },
  { word:"복숭아",    code:"1F351", category:"과일", difficulty:3 },
  { word:"키위",      code:"1F95D", category:"과일", difficulty:4 },
  { word:"망고",      code:"1F96D", category:"과일", difficulty:4 },
  { word:"멜론",      code:"1F348", category:"과일", difficulty:4 },
  { word:"강아지",    code:"1F436", category:"동물", difficulty:1 },
  { word:"고양이",    code:"1F431", category:"동물", difficulty:1 },
  { word:"코끼리",    code:"1F418", category:"동물", difficulty:1 },
  { word:"토끼",      code:"1F430", category:"동물", difficulty:1 },
  { word:"곰",        code:"1F43B", category:"동물", difficulty:2 },
  { word:"사자",      code:"1F981", category:"동물", difficulty:2 },
  { word:"펭귄",      code:"1F427", category:"동물", difficulty:2 },
  { word:"나비",      code:"1F98B", category:"동물", difficulty:2 },
  { word:"소",        code:"1F404", category:"동물", difficulty:2 },
  { word:"말",        code:"1F434", category:"동물", difficulty:2 },
  { word:"여우",      code:"1F98A", category:"동물", difficulty:3 },
  { word:"기린",      code:"1F992", category:"동물", difficulty:3 },
  { word:"상어",      code:"1F988", category:"동물", difficulty:3 },
  { word:"고래",      code:"1F40B", category:"동물", difficulty:3 },
  { word:"거북이",    code:"1F422", category:"동물", difficulty:3 },
  { word:"악어",      code:"1F40A", category:"동물", difficulty:4 },
  { word:"낙타",      code:"1F42A", category:"동물", difficulty:4 },
  { word:"하마",      code:"1F99B", category:"동물", difficulty:4 },
  { word:"플라밍고",  code:"1F9A9", category:"동물", difficulty:5 },
  { word:"앵무새",    code:"1F99C", category:"동물", difficulty:5 },
  { word:"독수리",    code:"1F985", category:"동물", difficulty:5 },
  { word:"자동차",    code:"1F697", category:"탈것", difficulty:1 },
  { word:"버스",      code:"1F68C", category:"탈것", difficulty:1 },
  { word:"비행기",    code:"2708-FE0F",  category:"탈것", difficulty:2 },
  { word:"자전거",    code:"1F6B2", category:"탈것", difficulty:2 },
  { word:"트럭",      code:"1F69A", category:"탈것", difficulty:2 },
  { word:"기차",      code:"1F686", category:"탈것", difficulty:3 },
  { word:"헬리콥터",  code:"1F681", category:"탈것", difficulty:3 },
  { word:"배",        code:"1F6A2", category:"탈것", difficulty:4 },
  { word:"오토바이",  code:"1F3CD-FE0F", category:"탈것", difficulty:4 },
  { word:"로켓",      code:"1F680", category:"탈것", difficulty:5 },
  { word:"피자",      code:"1F355", category:"음식", difficulty:1 },
  { word:"햄버거",    code:"1F354", category:"음식", difficulty:1 },
  { word:"빵",        code:"1F35E", category:"음식", difficulty:1 },
  { word:"치킨",      code:"1F357", category:"음식", difficulty:2 },
  { word:"초밥",      code:"1F363", category:"음식", difficulty:2 },
  { word:"라면",      code:"1F35C", category:"음식", difficulty:2 },
  { word:"케이크",    code:"1F382", category:"음식", difficulty:3 },
  { word:"도넛",      code:"1F369", category:"음식", difficulty:3 },
  { word:"아이스크림",code:"1F366", category:"음식", difficulty:3 },
  { word:"주먹밥",    code:"1F359", category:"음식", difficulty:4 },
  { word:"타코",      code:"1F32E", category:"음식", difficulty:4 },
  { word:"팝콘",      code:"1F37F", category:"음식", difficulty:4 },
  { word:"무지개",    code:"1F308", category:"자연", difficulty:2 },
  { word:"태양",      code:"2600-FE0F",  category:"자연", difficulty:2 },
  { word:"구름",      code:"2601-FE0F",  category:"자연", difficulty:2 },
  { word:"번개",      code:"26A1",  category:"자연", difficulty:3 },
  { word:"눈사람",    code:"26C4",  category:"자연", difficulty:3 },
  { word:"화산",      code:"1F30B", category:"자연", difficulty:4 },
  { word:"달",        code:"1F319", category:"자연", difficulty:4 },
  { word:"별",        code:"2B50",  category:"자연", difficulty:4 },
  { word:"해바라기",  code:"1F33B", category:"식물", difficulty:3 },
  { word:"장미",      code:"1F339", category:"식물", difficulty:3 },
  { word:"나무",      code:"1F333", category:"식물", difficulty:3 },
  { word:"버섯",      code:"1F344", category:"식물", difficulty:3 },
  { word:"선인장",    code:"1F335", category:"식물", difficulty:4 },
  { word:"튤립",      code:"1F337", category:"식물", difficulty:4 },
  { word:"클로버",    code:"1F340", category:"식물", difficulty:4 },
  { word:"기타",      code:"1F3B8", category:"악기", difficulty:4 },
  { word:"트럼펫",    code:"1F3BA", category:"악기", difficulty:4 },
  { word:"바이올린",  code:"1F3BB", category:"악기", difficulty:5 },
  { word:"드럼",      code:"1F941", category:"악기", difficulty:5 },
  { word:"피아노",    code:"1F3B9", category:"악기", difficulty:5 },
  { word:"색소폰",    code:"1F3B7", category:"악기", difficulty:5 },
];

const LEVEL_CONFIG: Record<Level, {
  requiredSuccess:number; timeLimit:number; label:string; stars:string;
  questionsPerRound:number; startBlur:number; difficulties:number[];
}> = {
  1: { requiredSuccess:3,        timeLimit:40, label:"레벨 1", stars:"⭐",          questionsPerRound:3, startBlur:12, difficulties:[1] },
  2: { requiredSuccess:5,        timeLimit:35, label:"레벨 2", stars:"⭐⭐",         questionsPerRound:4, startBlur:16, difficulties:[1,2] },
  3: { requiredSuccess:7,        timeLimit:30, label:"레벨 3", stars:"⭐⭐⭐",        questionsPerRound:5, startBlur:20, difficulties:[2,3] },
  4: { requiredSuccess:10,       timeLimit:25, label:"레벨 4", stars:"⭐⭐⭐⭐",       questionsPerRound:5, startBlur:24, difficulties:[3,4] },
  5: { requiredSuccess:Infinity, timeLimit:20, label:"레벨 5", stars:"⭐⭐⭐⭐⭐",      questionsPerRound:5, startBlur:28, difficulties:[4,5] },
};

const THEME = {
  bg:"linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)",
  accent:"#3b82f6", accent2:"#60a5fa",
  ink:"#1e3a5f", sub:"rgba(30,58,95,0.55)",
  chipBg:"rgba(255,255,255,0.7)", surface:"#ffffff",
  shadow:"0 10px 24px -12px rgba(59,130,246,0.45)",
};

const SUCCESS_MESSAGES = ["최고예요! 🏆","눈이 정말 좋으시네요! ✨","정말 대단해요! 🎊","두뇌가 건강해졌어요! 💪"];
const WRONG_MESSAGES = ["아쉬워요! 다시 도전해봐요 💪","괜찮아요, 다음엔 맞출 수 있어요! 😊","조금만 더 집중해봐요! 🔥"];

function generateChoices(correct: QuizItem): string[] {
  const sameCategory = ALL_ITEMS.filter(
    item => item.category === correct.category && item.word !== correct.word
  );
  const pool = sameCategory.length >= 3 ? sameCategory
    : ALL_ITEMS.filter(item => item.word !== correct.word);
  const wrong = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  return [...wrong.map(i => i.word), correct.word].sort(() => Math.random() - 0.5);
}

function getBlur(startBlur: number, hintLevel: number): string {
  const scale = hintLevel === 0 ? 1 : hintLevel === 1 ? 0.4 : 0.08;
  return `blur(${(startBlur * scale).toFixed(1)}px)`;
}

export default function BlurryGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("home");
  const [level, setLevel] = useState<Level>(1);
  const [currentItem, setCurrentItem] = useState<QuizItem|null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(40);
  const [selected, setSelected] = useState<string|null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [shownWords, setShownWords] = useState<string[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [successCounts, setSuccessCounts] = useState<Record<Level,number>>(() => {
    const s = localStorage.getItem("blurrySuccessCounts");
    return s ? JSON.parse(s) : {1:0,2:0,3:0,4:0,5:0};
  });
  const [unlockedLevels, setUnlockedLevels] = useState<Set<Level>>(() => {
    const s = localStorage.getItem("blurryUnlockedLevels");
    return s ? new Set(JSON.parse(s) as Level[]) : new Set<Level>([1]);
  });

  useEffect(() => {
    const el = document.querySelector(".phone-frame") as HTMLElement;
    if (!el) return;
    el.style.overflowY = (gameState==="playing"||gameState==="feedback") ? "hidden" : "";
    return () => { el.style.overflowY=""; };
  }, [gameState]);

  const loadQuestion = useCallback((lvl: Level, shown: string[]) => {
    const { difficulties } = LEVEL_CONFIG[lvl];
    let pool = ALL_ITEMS.filter(
      item => difficulties.includes(item.difficulty) && !shown.includes(item.word)
    );
    if (pool.length === 0) {
      pool = ALL_ITEMS.filter(item => difficulties.includes(item.difficulty));
      setShownWords([]);
    }
    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentItem(q);
    setChoices(generateChoices(q));
    setSelected(null);
    setIsCorrect(false);
    setTimeLeft(LEVEL_CONFIG[lvl].timeLimit);
    setHintLevel(0);
    setHintsLeft(2);
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
    const t = setTimeout(() => setTimeLeft(p => p-1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState]);

  const handleAnswer = (answer: string|null) => {
    if (gameState !== "playing" || selected !== null) return;
    const correct = answer === currentItem?.word;
    setSelected(answer ?? "");
    setIsCorrect(correct);
    setGameState("feedback");
    const newErrors = correct ? roundErrors : roundErrors+1;
    const newIndex = roundIndex+1;
    const isRoundDone = newIndex >= LEVEL_CONFIG[level].questionsPerRound;
    setFeedbackMsg(correct
      ? SUCCESS_MESSAGES[Math.floor(Math.random()*SUCCESS_MESSAGES.length)]
      : WRONG_MESSAGES[Math.floor(Math.random()*WRONG_MESSAGES.length)]
    );
    if (!correct) setRoundErrors(newErrors);
    setTimeout(() => {
      if (isRoundDone) {
        if (newErrors === 0) {
          setSuccessCounts(prev => {
            const n = prev[level]+1;
            const next = {...prev, [level]:n};
            localStorage.setItem("blurrySuccessCounts", JSON.stringify(next));
            if (n >= LEVEL_CONFIG[level].requiredSuccess && level < 5) {
              const nxt = (level+1) as Level;
              setUnlockedLevels(pu => {
                const s = new Set([...pu, nxt]);
                localStorage.setItem("blurryUnlockedLevels", JSON.stringify([...s]));
                return s;
              });
              if (navigator.vibrate) navigator.vibrate([200,100,200]);
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

  const useHint = () => {
    if (hintsLeft <= 0 || gameState !== "playing") return;
    setHintLevel(prev => Math.min(prev+1, 2));
    setHintsLeft(prev => prev-1);
  };

  const config = LEVEL_CONFIG[level];
  const timerPct = (timeLeft / config.timeLimit) * 100;
  const timerColor = timeLeft<=5?"#ef4444":timeLeft<=10?"#f97316":THEME.accent;
  const blurFilter = currentItem ? getBlur(config.startBlur, hintLevel) : "none";

  // ── 홈 화면 ──
  if (gameState === "home") return (
    <div style={{ height:"844px", overflowY:"auto", overflowX:"hidden", background:THEME.bg, fontFamily:'"Pretendard", -apple-system, system-ui' }}>
      {showResetModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"white", borderRadius:28, padding:28, width:300, boxShadow:"0 20px 60px rgba(0,0,0,0.3)", display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ textAlign:"center", fontSize:48 }}>⚠️</div>
            <h2 style={{ textAlign:"center", color:THEME.ink, fontWeight:900, fontSize:20, margin:0 }}>레벨 초기화</h2>
            <p style={{ textAlign:"center", color:THEME.sub, fontSize:15, margin:0, lineHeight:1.6 }}>모든 진행 상황이<br/>초기화됩니다.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowResetModal(false)} style={{ flex:1, padding:14, borderRadius:14, background:"#f3f4f6", color:"#374151", fontWeight:700, fontSize:16, border:"none", cursor:"pointer" }}>취소</button>
              <button onClick={() => {
                localStorage.removeItem("blurrySuccessCounts");
                localStorage.removeItem("blurryUnlockedLevels");
                setSuccessCounts({1:0,2:0,3:0,4:0,5:0});
                setUnlockedLevels(new Set([1]));
                setShowResetModal(false);
              }} style={{ flex:1, padding:14, borderRadius:14, background:THEME.accent, color:"white", fontWeight:700, fontSize:16, border:"none", cursor:"pointer" }}>초기화</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ padding:"20px 20px 28px", display:"flex", flexDirection:"column", gap:12 }}>
        <button onClick={() => navigate("/game")} style={{ alignSelf:"flex-start", background:THEME.chipBg, color:THEME.ink, fontWeight:700, padding:"8px 16px", borderRadius:99, fontSize:14, border:"none", cursor:"pointer" }}>← 뒤로가기</button>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.18em", color:THEME.sub }}>BRAIN GAME</div>
          <div style={{ fontSize:26, fontWeight:800, color:THEME.ink, marginTop:2 }}>흐릿한 그림 맞추기 🌫️</div>
          <div style={{ fontSize:14, color:THEME.sub, marginTop:4 }}>흐릿한 그림을 보고 무엇인지 맞춰보세요!</div>
        </div>
        {([1,2,3,4,5] as Level[]).map(lvl => {
          const unlocked = unlockedLevels.has(lvl);
          const cfg = LEVEL_CONFIG[lvl];
          const count = successCounts[lvl];
          const required = cfg.requiredSuccess===Infinity?"∞":cfg.requiredSuccess;
          const displayCount = cfg.requiredSuccess===Infinity?count:Math.min(count,cfg.requiredSuccess);
          const colors = ["#3b82f6","#2563eb","#1d4ed8","#1e40af","#1e3a8a"];
          return (
            <button key={lvl} onClick={() => startGame(lvl)} disabled={!unlocked}
              style={{ background:unlocked?`linear-gradient(135deg,${colors[lvl-1]},${colors[Math.min(lvl,4)]})`:THEME.chipBg, color:unlocked?"white":THEME.sub, padding:"16px 20px", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"space-between", opacity:unlocked?1:0.7, cursor:unlocked?"pointer":"not-allowed", boxShadow:unlocked?THEME.shadow:"inset 0 0 0 1px rgba(0,0,0,0.06)", border:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                  {unlocked?cfg.stars[0]:"🔒"}
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:3 }}>
                  <span style={{ fontSize:17, fontWeight:800 }}>{cfg.label}</span>
                  <span style={{ fontSize:12, opacity:0.85 }}>
                    {unlocked?`${cfg.questionsPerRound}문제 세트 · ${cfg.timeLimit}초 · 성공 ${displayCount}/${required}`:"이전 레벨을 클리어하면 해금돼요!"}
                  </span>
                </div>
              </div>
              <span style={{ fontSize:20, opacity:0.9 }}>{unlocked?"▶":"🔒"}</span>
            </button>
          );
        })}
        <button onClick={() => setShowResetModal(true)}
          style={{ marginTop:4, padding:"12px 24px", borderRadius:99, background:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:THEME.accent, fontWeight:700, fontSize:14, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8, alignSelf:"center" }}>
          🔄 레벨 초기화
        </button>
        <div style={{ textAlign:"center", fontSize:10, color:THEME.sub }}>이미지: Twemoji (Apache 2.0, Twitter)</div>
      </div>
    </div>
  );

  // ── 레벨업 ──
  if (gameState === "levelup") {
    const nextLevel = (level+1) as Level;
    return (
      <div style={{ height:"100%", background:THEME.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24 }}>
        <div style={{ fontSize:80 }}>🏆</div>
        <h1 style={{ color:THEME.ink, textAlign:"center", fontWeight:900, fontSize:32, margin:0 }}>눈이 정말 좋으시네요! ✨</h1>
        <div style={{ background:THEME.accent, color:"white", padding:"12px 28px", borderRadius:20, fontSize:22, fontWeight:800, boxShadow:THEME.shadow }}>🎊 레벨 {level} 클리어!</div>
        <div style={{ background:"rgba(255,255,255,0.8)", border:`2px solid ${THEME.accent2}`, color:THEME.ink, padding:"12px 24px", borderRadius:16, fontSize:16, fontWeight:700, textAlign:"center" }}>🔓 레벨 {nextLevel} 해금됐어요!</div>
        <div style={{ display:"flex", gap:12, width:"100%" }}>
          <button onClick={() => startGame(nextLevel)} style={{ flex:1, height:52, borderRadius:18, border:"none", cursor:"pointer", background:THEME.accent, color:"white", fontWeight:700, fontSize:16, boxShadow:THEME.shadow }}>레벨 {nextLevel} 도전! →</button>
          <button onClick={() => setGameState("home")} style={{ flex:1, height:52, borderRadius:18, border:"none", cursor:"pointer", background:THEME.surface, color:THEME.ink, fontWeight:700, fontSize:16 }}>처음으로</button>
        </div>
      </div>
    );
  }

  // ── 라운드 성공 ──
  if (gameState === "roundSuccess") {
    const required = config.requiredSuccess===Infinity?"∞":config.requiredSuccess;
    return (
      <div style={{ height:"100%", background:THEME.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24 }}>
        <div style={{ fontSize:80 }}>🎉</div>
        <h1 style={{ color:THEME.ink, textAlign:"center", fontWeight:900, fontSize:32, margin:0 }}>완벽해요!</h1>
        <p style={{ color:THEME.sub, textAlign:"center", fontSize:16, margin:0 }}>누적 성공: {Math.min(successCounts[level], config.requiredSuccess===Infinity?successCounts[level]:config.requiredSuccess)} / {required}</p>
        <div style={{ display:"flex", gap:12, width:"100%" }}>
          <button onClick={() => resetRound(level)} style={{ flex:1, height:52, borderRadius:18, border:"none", cursor:"pointer", background:THEME.accent, color:"white", fontWeight:700, fontSize:16, boxShadow:THEME.shadow }}>다음 라운드 →</button>
          <button onClick={() => setGameState("home")} style={{ flex:1, height:52, borderRadius:18, border:"none", cursor:"pointer", background:THEME.surface, color:THEME.ink, fontWeight:700, fontSize:16 }}>레벨 선택</button>
        </div>
      </div>
    );
  }

  // ── 라운드 실패 ──
  if (gameState === "roundFail") {
    return (
      <div style={{ height:"100%", background:THEME.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24 }}>
        <div style={{ fontSize:80 }}>💪</div>
        <h1 style={{ color:THEME.ink, textAlign:"center", fontWeight:900, fontSize:32, margin:0 }}>다시 도전해봐요!</h1>
        <p style={{ color:THEME.sub, textAlign:"center", fontSize:16, margin:0 }}>모두 맞춰야 성공이에요!</p>
        <button onClick={() => resetRound(level)} style={{ width:"100%", height:52, borderRadius:18, border:"none", cursor:"pointer", background:THEME.accent, color:"white", fontWeight:700, fontSize:18, boxShadow:THEME.shadow }}>다시 도전하기!</button>
        <button onClick={() => setGameState("home")} style={{ color:THEME.sub, fontSize:16, background:"transparent", border:"none", cursor:"pointer" }}>← 레벨 선택으로</button>
      </div>
    );
  }

  // ── 게임 화면 ──
  return (
    <div style={{ height:844, display:"flex", flexDirection:"column", background:THEME.bg, fontFamily:'"Pretendard", -apple-system, system-ui' }}>

      {/* 헤더 */}
      <div style={{ padding:"12px 20px 8px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ height:38, padding:"0 14px", borderRadius:99, display:"flex", alignItems:"center", gap:6, background:THEME.chipBg, fontSize:13, fontWeight:600, color:THEME.accent }}>
            <div style={{ width:8, height:8, borderRadius:99, background:THEME.accent }} />
            {config.label}
          </div>
          <div style={{ height:38, padding:"0 14px", borderRadius:99, display:"flex", alignItems:"center", gap:6, background:THEME.chipBg, fontSize:13, fontWeight:600, color:timeLeft<=10?"#ef4444":THEME.ink }}>
            ⏱ {timeLeft}초
          </div>
        </div>
        <div style={{ height:38, padding:"0 14px", borderRadius:99, background:THEME.chipBg, display:"flex", alignItems:"center", fontSize:13, fontWeight:600, color:THEME.accent }}>
          {roundIndex+1} / {config.questionsPerRound}
        </div>
      </div>

      {/* 타이머 바 */}
      <div style={{ margin:"0 20px", height:8, borderRadius:99, background:"rgba(59,130,246,0.1)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${timerPct}%`, background:timerColor, borderRadius:99, transition:"width 1s linear" }} />
      </div>

      {/* 성공 카운트 */}
      <div style={{ margin:"8px 20px 0", display:"flex", justifyContent:"flex-end" }}>
        <span style={{ color:THEME.sub, fontSize:12, fontWeight:700 }}>
          성공: <span style={{ color:THEME.accent }}>{Math.min(successCounts[level], config.requiredSuccess===Infinity?successCounts[level]:config.requiredSuccess)}</span> / {config.requiredSuccess===Infinity?"∞":config.requiredSuccess}
        </span>
      </div>

      {/* 문제 영역 */}
      <div style={{ flex:1, padding:"10px 20px", display:"flex", flexDirection:"column", gap:12 }}>

        {/* 카테고리 + 힌트 */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:13, fontWeight:700, color:THEME.sub, background:"rgba(59,130,246,0.1)", padding:"4px 16px", borderRadius:99 }}>
            {currentItem?.category} 카테고리
          </span>
          <button onClick={useHint} disabled={hintsLeft<=0||gameState==="feedback"}
            style={{ height:36, padding:"0 16px", borderRadius:99, border:"none", cursor:hintsLeft>0?"pointer":"default", background:hintsLeft>0?THEME.accent:THEME.chipBg, color:hintsLeft>0?"white":THEME.sub, fontWeight:700, fontSize:13, boxShadow:hintsLeft>0?THEME.shadow:"none" }}>
            💡 힌트 ({hintsLeft}회)
          </button>
        </div>

        {/* 흐릿한 그림 */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:240, height:240, borderRadius:28, background:"white", boxShadow:"0 12px 32px rgba(59,130,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
            {!imgLoaded && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>⏳</div>
            )}
            {currentItem && (
              <img
                key={currentItem.code}
                src={CDN(currentItem.code)}
                alt="?"
                onLoad={() => setImgLoaded(true)}
                style={{
                  width:200, height:200,
                  filter: gameState==="feedback" ? "blur(0px)" : blurFilter,
                  transition:"filter 0.5s ease",
                  opacity:imgLoaded?1:0,
                }}
              />
            )}
          </div>
        </div>

        {/* 흐림 단계 표시 */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width:10, height:10, borderRadius:99, background:i<=hintLevel?THEME.accent:"rgba(59,130,246,0.2)", transition:"background 0.3s" }} />
          ))}
          <span style={{ fontSize:12, color:THEME.sub, marginLeft:6 }}>
            {hintLevel===0?"힌트를 눌러 더 선명하게":hintLevel===1?"조금 더 선명해졌어요!":"거의 다 보여요!"}
          </span>
        </div>

        {/* 4지선다 */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {choices.map((choice, i) => {
            const showResult = gameState==="feedback";
            const isAnswer = choice===currentItem?.word;
            const isSelected = selected===choice;
            let bg="white", color=THEME.ink, border="2px solid rgba(59,130,246,0.15)";
            if (showResult&&isAnswer) { bg="#22c55e"; color="white"; border="2px solid #16a34a"; }
            else if (showResult&&isSelected&&!isAnswer) { bg="#ef4444"; color="white"; border="2px solid #dc2626"; }
            return (
              <button key={i} onClick={() => handleAnswer(choice)}
                disabled={gameState==="feedback"}
                style={{ height:60, borderRadius:18, background:bg, color, fontWeight:800, fontSize:17, border, boxShadow:"0 4px 12px rgba(0,0,0,0.06)", cursor:"pointer", transition:"all 0.2s" }}>
                {choice}
              </button>
            );
          })}
        </div>

        {/* 피드백 */}
        {gameState==="feedback" && (
          <div style={{ textAlign:"center", padding:"10px", borderRadius:16, background:isCorrect?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)", color:isCorrect?"#16a34a":"#dc2626", fontWeight:700, fontSize:14 }}>
            {isCorrect?`✅ 정답! ${feedbackMsg}`:`❌ 정답은 "${currentItem?.word}" 입니다. ${feedbackMsg}`}
          </div>
        )}
      </div>

      {/* 하단 */}
      <div style={{ padding:"8px 20px 20px", display:"flex", gap:10 }}>
        <button onClick={() => setGameState("home")} style={{ flex:1, height:48, borderRadius:16, border:"none", cursor:"pointer", background:THEME.surface, color:THEME.ink, fontSize:14, fontWeight:700, boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
          레벨 선택
        </button>
        <button onClick={() => resetRound(level)} style={{ flex:1, height:48, borderRadius:16, border:"none", cursor:"pointer", background:THEME.ink, color:"#fff", fontSize:14, fontWeight:700 }}>
          🔄 다시시작
        </button>
      </div>
    </div>
  );
}
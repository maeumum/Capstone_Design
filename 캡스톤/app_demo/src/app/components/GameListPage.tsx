import { useNavigate } from "react-router";

const GAMES = [
  {
    id: "card", path: "/game/card",
    title: "카드 짝 맞추기", category: "기억력",
    description: "같은 카드를 찾아 짝을 맞춰보세요",
    emoji: "🃏", grad: ["#FF9A6E", "#FF6F5C"],
    ready: true, tag: "NEW",
  },
  {
  id: "chosung", path: "/game/chosung",
  title: "초성 게임", category: "언어력",
  description: "초성을 보고 단어를 맞춰보세요",
  emoji: "💬", grad: ["#7EB8F7", "#4D96FF"],
  ready: true,  
  tag: "NEW",
  },
  {
    id: "partial", path: "/game/partial",
    title: "부분 그림 맞추기", category: "판단력",
    description: "부분만 보고 어떤 그림인지 맞춰보세요",
    emoji: "🖼️", grad: ["#A8D5BA", "#5DBB89"],
    ready: true, tag: "NEW",
  },
  {
    id: "blurry", path: "/game/blurry",
    title: "흐릿한 그림 맞추기", category: "집중력",
    description: "흐릿한 그림을 보고 정답을 맞춰보세요",
    emoji: "🌫️", grad: ["#C9B8F7", "#9F8AD8"],
    ready: true, tag: "NEW",
  },
  {
    id: "color", path: "/game/color",
    title: "색깔 맞추기", category: "순발력",
    description: "글자 색깔을 빠르게 맞춰보세요",
    emoji: "🎨", grad: ["#F8A0B4", "#F25C7A"],
    ready: true, tag: "NEW",
  },
];

export default function GameListPage() {
  const navigate = useNavigate();

  return (
    <div style={{ height: "844px", overflowY: "auto", overflowX: "hidden", background: "linear-gradient(180deg, #FFF1E8 0%, #FFE5D9 100%)", fontFamily: '"Pretendard", -apple-system, system-ui, sans-serif' }}>

      {/* 헤더 */}
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/")}
          style={{ background: "rgba(255,255,255,0.7)", border: "none", borderRadius: 99, padding: "8px 16px", fontSize: 14, fontWeight: 700, color: "#2A1810", backdropFilter: "blur(14px)", cursor: "pointer" }}>
          ← 뒤로가기
        </button>
      </div>

      {/* 타이틀 */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(42,24,16,0.55)", marginBottom: 4 }}>BRAIN TRAINING</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#2A1810" }}>
          두뇌 <span style={{ background: "linear-gradient(135deg, #FF7A59, #FFB088)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>트레이닝</span>
        </div>
        <div style={{ fontSize: 14, color: "rgba(42,24,16,0.55)", marginTop: 4 }}>게임을 선택해서 두뇌를 깨워봐요!</div>
      </div>

      {/* 오늘의 상태 카드 */}
      <div style={{ margin: "0 20px 24px", borderRadius: 24, padding: "20px 22px", background: "linear-gradient(135deg, #FF7A59, #FFB088)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 12px 28px -6px rgba(255,122,89,0.45)" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", opacity: 0.85, marginBottom: 6 }}>오늘의 두뇌 활동</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>두뇌를 깨워봐요! ✨</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>5개 게임 중 도전해보세요</div>
        </div>
        <div style={{ fontSize: 48 }}>🧠</div>
      </div>

      {/* 게임 목록 */}
      <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#2A1810" }}>두뇌 게임</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(42,24,16,0.55)", background: "rgba(42,24,16,0.05)", padding: "2px 10px", borderRadius: 99 }}>{GAMES.length}</span>
        </div>

        {GAMES.map(game => (
          <button key={game.id}
            onClick={() => game.ready ? navigate(game.path) : null}
            style={{ background: "white", border: "1px solid rgba(42,24,16,0.06)", borderRadius: 24, overflow: "hidden", textAlign: "left", width: "100%", cursor: game.ready ? "pointer" : "default", boxShadow: "0 6px 18px -8px rgba(42,24,16,0.18)", opacity: game.ready ? 1 : 0.75 }}>

            {/* 썸네일 */}
<div style={{ height: 140, background: `linear-gradient(135deg, ${game.grad[0]}, ${game.grad[1]})`, position: "relative", overflow: "hidden" }}>
  {game.id === "card" ? (
    // 카드 짝 맞추기 전용 썸네일
    <>
      {/* 배경 빛 효과 */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.25), transparent 50%)" }} />
      {/* 카드들 */}
      {[
        { emoji: "🍓", x: 8,  y: 12, rotate: -12, scale: 1.0 },
        { emoji: "🍊", x: 28, y: 5,  rotate: 6,   scale: 0.85 },
        { emoji: "🍋", x: 52, y: 10, rotate: -5,  scale: 0.9 },
        { emoji: "🍇", x: 72, y: 6,  rotate: 10,  scale: 0.85 },
        { emoji: "🍓", x: 82, y: 18, rotate: -8,  scale: 0.8 },
        { emoji: "🍊", x: 5,  y: 52, rotate: 8,   scale: 0.85 },
        { emoji: "🍋", x: 22, y: 58, rotate: -6,  scale: 1.0 },
        { emoji: "🍇", x: 48, y: 52, rotate: 4,   scale: 0.9 },
        { emoji: "🥝", x: 68, y: 55, rotate: -10, scale: 0.85 },
        { emoji: "🍑", x: 85, y: 50, rotate: 7,   scale: 0.9 },
      ].map((card, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${card.x}%`,
          top: `${card.y}%`,
          width: 48 * card.scale,
          height: 48 * card.scale,
          borderRadius: 10 * card.scale,
          background: i % 2 === 0 ? "white" : "linear-gradient(135deg, #FF9A6E, #FF6F5C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22 * card.scale,
          transform: `rotate(${card.rotate}deg)`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          {i % 2 === 0 ? card.emoji : "❓"}
        </div>
      ))}
      
    </>
  ) : game.id === "chosung" ? (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${game.grad[0]}, ${game.grad[1]})` }} />
      {["ㅅㄱ", "ㅂㄴㄴ", "ㄱㅇㅈ", "ㅎㄹㅇ", "ㅍㅈ", "ㄷㄱ"].map((cho, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${[8, 35, 62, 18, 50, 75][i]}%`,
          top: `${[15, 8, 18, 55, 52, 48][i]}%`,
          background: i % 2 === 0 ? "white" : "rgba(255,255,255,0.3)",
          borderRadius: 12,
          padding: "6px 12px",
          fontSize: 16,
          fontWeight: 900,
          color: i % 2 === 0 ? "#4D96FF" : "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transform: `rotate(${[-8, 5, -3, 10, -6, 4][i]}deg)`,
          letterSpacing: "0.2em",
        }}>{cho}</div>
      ))}
    </>
) : game.id === "partial" ? (
  <>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${game.grad[0]}, ${game.grad[1]})` }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.25), transparent 55%)" }} />
    {[
      { code: "1F34E", x: 2,  y: 8,  ml: -19, mt: 0,   rotate: -8 },
      { code: "1F436", x: 23, y: 5,  ml: 0,   mt: -30, rotate: 6  },
      { code: "1F697", x: 47, y: 9,  ml: -30, mt: 0,   rotate: -4 },
      { code: "1F355", x: 70, y: 5,  ml: -19, mt: -30, rotate: 9  },
      { code: "1F34C", x: 5,  y: 52, ml: 0,   mt: -19, rotate: 7  },
      { code: "1F431", x: 27, y: 55, ml: -30, mt: -30, rotate: -6 },
      { code: "1F308", x: 51, y: 50, ml: 0,   mt: 0,   rotate: 5  },
      { code: "1F418", x: 73, y: 52, ml: -19, mt: -19, rotate: -9 },
    ].map((item, i) => (
      <div key={i} style={{
        position: "absolute",
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: 54, height: 54,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
        transform: `rotate(${item.rotate}deg)`,
        background: "white",
      }}>
        <img
          src={`https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/${item.code}.svg`}
          style={{ width: 92, height: 92, marginLeft: item.ml, marginTop: item.mt, display: "block" }}
        />
      </div>
    ))}
  </>

) : game.id === "blurry" ? (
  <>
    <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${game.grad[0]},${game.grad[1]})` }} />

    {/* 4x2 그리드로 꽉 채우기 */}
    <div style={{ position:"absolute", inset:6, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gridTemplateRows:"repeat(2,1fr)", gap:6 }}>
      {[
        { code:"1F34E", blur:3  },
        { code:"1F436", blur:10 },
        { code:"1F697", blur:6  },
        { code:"1F355", blur:14 },
        { code:"1F34C", blur:8  },
        { code:"1F431", blur:4  },
        { code:"1F308", blur:12 },
        { code:"1F418", blur:16 },
      ].map((item, i) => (
        <div key={i} style={{ borderRadius:12, background:"rgba(255,255,255,0.88)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
          <img
            src={`https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/${item.code}.svg`}
            style={{ width:"82%", height:"82%", objectFit:"contain", filter:`blur(${item.blur}px)` }}
          />
        </div>
      ))}
    </div>

    {/* 가운데 뱃지 */}
    <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", background:"rgba(159,138,216,0.9)", borderRadius:99, padding:"7px 16px", display:"flex", alignItems:"center", gap:5, boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
      <span style={{ fontSize:14 }}>🔍</span>
      <span style={{ color:"white", fontWeight:800, fontSize:12, whiteSpace:"nowrap" }}>맞춰보세요!</span>
    </div>
  </>
) : game.id === "color" ? (
  <>
    <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${game.grad[0]},${game.grad[1]})` }} />
    <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 70% 20%, rgba(255,255,255,0.2), transparent 55%)" }} />
    {[
      { word:"빨강", color:"#ef4444", x:5,  y:6,  rotate:-10, fontSize:22 },
      { word:"파랑", color:"#3b82f6", x:38, y:4,  rotate:5,   fontSize:20 },
      { word:"초록", color:"#22c55e", x:68, y:8,  rotate:-6,  fontSize:22 },
      { word:"노랑", color:"#eab308", x:8,  y:52, rotate:8,   fontSize:20 },
      { word:"보라", color:"#a855f7", x:40, y:55, rotate:-8,  fontSize:22 },
      { word:"주황", color:"#f97316", x:70, y:50, rotate:6,   fontSize:20 },
    ].map((item, i) => (
      <div key={i} style={{
        position:"absolute",
        left:`${item.x}%`,
        top:`${item.y}%`,
        background:"rgba(255,255,255,0.92)",
        borderRadius:14,
        padding:"6px 14px",
        boxShadow:"0 4px 14px rgba(0,0,0,0.18)",
        transform:`rotate(${item.rotate}deg)`,
      }}>
        <span style={{ fontSize:item.fontSize, fontWeight:900, color:item.color }}>{item.word}</span>
      </div>
    ))}

    {/* 가운데 뱃지 */}
    <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", background:"rgba(248,160,180,0.9)", borderRadius:99, padding:"7px 16px", display:"flex", alignItems:"center", gap:5, boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
      <span style={{ fontSize:14 }}>🎨</span>
      <span style={{ color:"white", fontWeight:800, fontSize:12, whiteSpace:"nowrap" }}>색깔을 맞춰요!</span>
    </div>
  </>
): (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 64, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))" }}>{game.emoji}</div>
    </div>
  )}
              {/* 태그 */}
              <div style={{ position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 800, padding: "5px 9px", borderRadius: 99, background: "rgba(255,255,255,0.95)", color: game.tag === "인기" ? "#FF3B30" : "#9ca3af", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", letterSpacing: "0.3px" }}>
                {game.tag}
              </div>

              {/* 준비중 오버레이 */}
              {!game.ready && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "rgba(0,0,0,0.5)", color: "white", borderRadius: 99, padding: "8px 20px", fontSize: 14, fontWeight: 800 }}>🔧 준비 중</div>
                </div>
              )}
            </div>

            {/* 카드 내용 */}
            <div style={{ padding: "16px 18px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#2A1810", letterSpacing: "-0.5px" }}>{game.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(42,24,16,0.55)", marginTop: 2 }}>{game.category}</div>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${game.grad[0]}, ${game.grad[1]})`, color: "white", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {game.ready ? "▶ 시작" : "준비중"}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "rgba(42,24,16,0.55)", lineHeight: 1.45 }}>{game.description}</div>
            </div>
          </button>
        ))}

        
      </div>
    </div>
  );
}
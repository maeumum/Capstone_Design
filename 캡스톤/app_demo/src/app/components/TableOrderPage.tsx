import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./TableOrderMain.css";

// ─── Theme (막걸리 우드) ──────────────────────────────────
const T = {
  bg: "#f7f1e8", surface: "#ffffff", surface2: "#faf5ec",
  sidebar: "#2a1f17", sidebarInk: "#f7f1e8", sidebarMuted: "#8a7866",
  accent: "#b8472d", accentInk: "#ffffff", accentSoft: "#f4ddd5",
  ink: "#2a1f17", inkMuted: "#7d6c5b", line: "#e6dcc9",
};
const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

// ─── Types ────────────────────────────────────────────────
interface Choice { n: string; p: number; }
interface Opt { name: string; required: boolean; choices: Choice[]; }
interface Item { id: string; name: string; img: string; price: number; badge: string | null; desc: string; options: Opt[]; }
interface CartLine extends Item { qty: number; opts: Record<string, Choice>; lineTotal: number; }
interface PastOrder { id: string; time: string; name: string; img: string; qty: number; price: number; status: "served" | "cooking"; }

// ─── Data ─────────────────────────────────────────────────
const RESTAURANT = { name: "전과한잔", branch: "캠퍼스점", tableNo: "A-7" };

const CATEGORIES = [
  { id: "jeon",    name: "전류",    badge: "추천" },
  { id: "set",     name: "세트메뉴" },
  { id: "bokkeum", name: "볶음류"  },
  { id: "tang",    name: "탕류"    },
  { id: "side",    name: "사이드"  },
  { id: "sari",    name: "사리추가" },
  { id: "drink",   name: "주류"    },
];

const ITEMS: Record<string, Item[]> = {
  jeon: [
    { id:"j1", name:"해물듬뿍파전",   img:"/images/haemul-pajeon.jpg",      price:20000, badge:null,    desc:"통통한 새우와 오징어, 부추가 가득 들어간 시그니처 파전",
      options:[{ name:"사이즈", required:true, choices:[{n:"기본",p:0},{n:"라지",p:5000}] }] },
    { id:"j2", name:"육전쫄면세트",    img:"/images/yukjeon-set.jpg",        price:25000, badge:"BEST", desc:"한우 육전과 매콤 쫄면의 황금 조합",
      options:[{ name:"매운맛", required:true, choices:[{n:"순한맛",p:0},{n:"보통맛",p:0},{n:"매운맛",p:0}] }] },
    { id:"j3", name:"오징어순대전",    img:"/images/ojingeo-sundae.jpg",     price:22000, badge:null,    desc:"통오징어 속을 가득 채운 전라도식 별미", options:[] },
    { id:"j4", name:"치즈 두부김치전", img:"/images/cheese-kimchi-jeon.jpg", price:19000, badge:"NEW",   desc:"모짜렐라 치즈가 듬뿍, 묵은지의 깊은 맛",
      options:[{ name:"치즈 추가", required:false, choices:[{n:"없음",p:0},{n:"추가 (+3,000원)",p:3000}] }] },
    { id:"j5", name:"모듬전 한상",     img:"/images/modum-jeon.jpg",         price:28000, badge:null,    desc:"동그랑땡·녹두전·고추전·표고전 모듬 구성", options:[] },
    { id:"j6", name:"들기름 메밀전병", img:"/images/memil-jeonbyeong.jpg",   price:16000, badge:null,    desc:"강원도식 메밀전병, 고소한 들기름 향", options:[] },
  ],
  set: [
    { id:"s3", name:"혼술 세트 (1인)", img:"/images/honsul-set.jpg", price:22000, badge:"NEW", desc:"미니 파전 + 막걸리 1잔", options:[] },
  ],
  bokkeum: [
    { id:"b1", name:"낙지볶음",   img:"/images/nakji-bokkeum.jpg",   price:23000, badge:"매운맛", desc:"산낙지의 쫄깃함, 매콤 양념", options:[] },
    { id:"b2", name:"오삼불고기", img:"/images/osam-bulgogi.jpg",    price:26000, badge:null,    desc:"오징어와 삼겹살의 매콤한 조화", options:[] },
    { id:"b3", name:"제육볶음",   img:"/images/jeyuk-bokkeum.jpg",   price:19000, badge:null,    desc:"고추장 양념 제육", options:[] },
    { id:"b4", name:"닭갈비",     img:"/images/dakgalbi.jpg",        price:22000, badge:null,    desc:"춘천식 닭갈비, 떡 사리 포함", options:[] },
    { id:"b5", name:"주꾸미볶음", img:"/images/jjukkumi-bokkeum.jpg",price:24000, badge:"매운맛", desc:"통주꾸미 매콤볶음", options:[] },
  ],
  tang: [
    { id:"t1", name:"들깨 수제비", img:"/images/sujebi.jpg",     price:14000, badge:null,   desc:"고소한 들깨 국물의 수제비", options:[] },
    { id:"t2", name:"꽃게탕",      img:"/images/kkotge-tang.jpg", price:32000, badge:"BEST", desc:"통꽃게 한 마리가 들어간 시원한 탕", options:[] },
    { id:"t4", name:"감자탕",      img:"/images/gamja-tang.jpg",  price:35000, badge:null,   desc:"묵은지 감자탕 (2-3인)", options:[] },
  ],
  drink: [
    { id:"d1", name:"우리쌀 막걸리",  img:"/images/makgeolli-uri.jpg",   price:7000, badge:"BEST", desc:"깔끔하고 청량한 우리 농가 막걸리", options:[] },
    { id:"d3", name:"느린마을 막걸리", img:"/images/makgeolli-neurin.jpg", price:9000, badge:null,  desc:"부드럽고 은은한 단맛", options:[] },
    { id:"d4", name:"소주", img:"/images/soju.jpg", price:5000, badge:null, desc:"참이슬 / 처음처럼 택1",
      options:[{ name:"종류", required:true, choices:[{n:"참이슬 후레쉬",p:0},{n:"처음처럼",p:0},{n:"새로",p:0}] }] },
    { id:"d5", name:"맥주", img:"/images/beer.jpg", price:5000, badge:null, desc:"카스 / 테라 / 켈리 택1",
      options:[{ name:"종류", required:true, choices:[{n:"카스",p:0},{n:"테라",p:0},{n:"켈리",p:0}] }] },
    { id:"d6", name:"사이다 / 콜라", img:"/images/soda.jpg", price:3000, badge:null, desc:"",
      options:[{ name:"종류", required:true, choices:[{n:"사이다",p:0},{n:"콜라",p:0}] }] },
  ],
  side: [
    { id:"sd1", name:"도토리묵 무침", img:"/images/dotori-muk.jpg",   price:12000, badge:null, desc:"", options:[] },
    { id:"sd2", name:"골뱅이무침",    img:"/images/golbaengi.jpg",     price:18000, badge:null, desc:"소면 포함", options:[] },
    { id:"sd3", name:"계란말이",      img:"/images/gyeran-mari.jpg",   price:9000,  badge:null, desc:"명란 / 치즈 선택", options:[] },
    { id:"sd4", name:"감자전",        img:"/images/gamja-jeon.jpg",    price:13000, badge:null, desc:"강원도 감자 100%", options:[] },
    { id:"sd5", name:"두부김치",      img:"/images/dubu-kimchi.jpg",   price:15000, badge:null, desc:"묵은지 볶음 + 두부", options:[] },
    { id:"sd6", name:"오뎅탕",        img:"/images/odeng-tang.jpg",    price:11000, badge:null, desc:"어묵 모둠탕", options:[] },
  ],
  sari: [
    { id:"sr1", name:"쫄면 사리", img:"/images/jjolmyeon-sari.jpg", price:3000, badge:null, desc:"", options:[] },
    { id:"sr2", name:"라면 사리", img:"/images/ramyeon-sari.jpg",    price:2000, badge:null, desc:"", options:[] },
    { id:"sr3", name:"우동 사리", img:"/images/udon-sari.jpg",       price:3000, badge:null, desc:"", options:[] },
    { id:"sr4", name:"떡 사리",   img:"/images/tteok-sari.jpg",      price:2000, badge:null, desc:"", options:[] },
    { id:"sr5", name:"치즈 사리", img:"/images/cheese-sari.jpg",     price:3000, badge:null, desc:"", options:[] },
  ],
};

const INITIAL_ORDERS: PastOrder[] = [
  { id:"o1", time:"19:42", name:"우리쌀 막걸리", img:"/images/makgeolli-uri.jpg", qty:2, price:14000, status:"served"  },
  { id:"o2", time:"19:42", name:"해물듬뿍파전",  img:"/images/haemul-pajeon.jpg", qty:1, price:20000, status:"served"  },
  { id:"o3", time:"20:15", name:"도토리묵 무침", img:"/images/dotori-muk.jpg",    qty:1, price:12000, status:"cooking" },
];

// ─── Badge ────────────────────────────────────────────────
function Badge({ kind, children }: { kind: string; children: React.ReactNode }) {
  const s = kind === "best"
    ? { background: "linear-gradient(180deg,#f0c050 0%,#d49a26 100%)", color: "#2a1f17" }
    : kind === "new" ? { background: T.accent, color: T.accentInk }
    : { background: "#e64a3a", color: "#fff" };
  return (
    <span style={{ ...s, fontSize:14, fontWeight:800, padding:"3px 10px", borderRadius:5, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

// ─── Stepper ──────────────────────────────────────────────
function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, background:T.surface2, border:`1px solid ${T.line}`, borderRadius:16, padding:5 }}>
      <button onClick={() => onChange(Math.max(1, value - 1))}
        style={{ width:52, height:52, borderRadius:10, border:"none", background:T.surface, fontSize:24, fontWeight:700, cursor:"pointer", color:T.ink }}>−</button>
      <span style={{ minWidth:36, textAlign:"center", fontSize:20, fontWeight:700, color:T.ink }}>{value}</span>
      <button onClick={() => onChange(Math.min(99, value + 1))}
        style={{ width:52, height:52, borderRadius:10, border:"none", background:T.surface, fontSize:24, fontWeight:700, cursor:"pointer", color:T.ink }}>+</button>
    </div>
  );
}

// ─── ItemDetailModal ──────────────────────────────────────
function ItemDetailModal({ item, onClose, onAdd }: { item: Item; onClose: () => void; onAdd: (line: CartLine) => void }) {
  const [qty, setQty] = useState(1);
  const [opts, setOpts] = useState<Record<string, Choice>>(() => {
    const init: Record<string, Choice> = {};
    item.options.forEach(o => { if (o.required) init[o.name] = o.choices[0]; });
    return init;
  });
  const optsExtra = Object.values(opts).reduce((s, c) => s + (c?.p || 0), 0);
  const total = (item.price + optsExtra) * qty;
  const canAdd = item.options.every(o => !o.required || opts[o.name]);

  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(22,18,14,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}
      onClick={onClose}>
      <div style={{ background:T.surface, borderRadius:24, width:680, maxHeight:"92%", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ height:250, background:"#f5ece0", flexShrink:0, position:"relative", overflow:"hidden" }}>
          <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          <button onClick={onClose}
            style={{ position:"absolute", top:16, right:16, width:44, height:44, borderRadius:"50%", background:"rgba(0,0,0,0.25)", border:"none", fontSize:20, cursor:"pointer", color:"#fff" }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:"24px 32px 0", flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            {item.badge && <Badge kind={item.badge==="BEST"?"best":item.badge==="NEW"?"new":"spicy"}>{item.badge==="BEST"?"👑 ":""}{item.badge}</Badge>}
            <h2 style={{ fontSize:28, fontWeight:800, color:T.ink, margin:0 }}>{item.name}</h2>
          </div>
          {item.desc && <p style={{ fontSize:17, color:T.inkMuted, lineHeight:1.6, margin:"8px 0 16px" }}>{item.desc}</p>}
          <div style={{ fontSize:32, fontWeight:800, color:T.accent, marginBottom:20 }}>{fmt(item.price)}</div>

          {item.options.map(o => (
            <div key={o.name} style={{ borderTop:`1px solid ${T.line}`, paddingTop:18, marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <span style={{ fontSize:18, fontWeight:700, color:T.ink }}>{o.name}</span>
                <span style={{ fontSize:13, fontWeight:700, padding:"3px 10px", borderRadius:12,
                  background:o.required?T.accentSoft:T.line, color:o.required?T.accent:T.inkMuted }}>
                  {o.required ? "필수" : "선택"}
                </span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {o.choices.map(c => (
                  <button key={c.n} onClick={() => setOpts({ ...opts, [o.name]: c })}
                    style={{ background:opts[o.name]?.n===c.n?T.accentSoft:T.surface2,
                      border:`1.5px solid ${opts[o.name]?.n===c.n?T.accent:T.line}`,
                      borderRadius:12, padding:"12px 20px", fontSize:16,
                      fontWeight:opts[o.name]?.n===c.n?700:500, cursor:"pointer",
                      color:opts[o.name]?.n===c.n?T.accent:T.ink, display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
                    {c.n}{c.p > 0 && <span style={{ fontSize:14, opacity:.7 }}>+{c.p.toLocaleString()}원</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:18, borderTop:`1px solid ${T.line}`, marginBottom:18 }}>
            <span style={{ fontSize:18, fontWeight:700, color:T.ink }}>수량</span>
            <Stepper value={qty} onChange={setQty} />
          </div>
        </div>
        <div style={{ padding:"18px 32px 28px", borderTop:`1px solid ${T.line}`, display:"flex", alignItems:"center", gap:18, background:T.surface, flexShrink:0 }}>
          <div style={{ flexShrink:0 }}>
            <div style={{ fontSize:14, color:T.inkMuted, fontWeight:500 }}>합계</div>
            <div style={{ fontSize:28, fontWeight:800, color:T.ink }}>{fmt(total)}</div>
          </div>
          <button disabled={!canAdd} onClick={() => onAdd({ ...item, qty, opts, lineTotal: total })}
            style={{ flex:1, height:64, borderRadius:14, border:"none", cursor:"pointer",
              background:canAdd?T.accent:"#ddd", color:canAdd?T.accentInk:"#aaa", fontSize:20, fontWeight:700, fontFamily:"inherit" }}>
            장바구니 담기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CartModal ────────────────────────────────────────────
function CartModal({ cart, onClose, onUpdateQty, onRemove, onCheckout }:
  { cart: CartLine[]; onClose: () => void; onUpdateQty: (i: number, q: number) => void; onRemove: (i: number) => void; onCheckout: () => void }) {
  const subtotal = cart.reduce((s, l) => s + l.lineTotal, 0);
  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(22,18,14,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}
      onClick={onClose}>
      <div style={{ background:T.surface, borderRadius:24, width:720, maxHeight:"90%", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding:"24px 32px 18px", borderBottom:`1px solid ${T.line}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:T.ink, margin:0 }}>장바구니</h2>
          <button onClick={onClose} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(0,0,0,0.06)", border:"none", fontSize:20, cursor:"pointer", color:T.ink }}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18, padding:"80px 0" }}>
            <span style={{ fontSize:80 }}>🍽</span>
            <div style={{ fontSize:20, color:T.inkMuted }}>아직 담은 메뉴가 없어요</div>
            <button onClick={onClose}
              style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:14, padding:"12px 28px", fontSize:18, fontWeight:700, cursor:"pointer", color:T.ink, fontFamily:"inherit" }}>
              메뉴 보러가기
            </button>
          </div>
        ) : (
          <>
            <div style={{ flex:1, overflowY:"auto" }}>
              {cart.map((l, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"88px 1fr auto", gap:18, padding:"18px 32px", borderBottom:`1px solid ${T.line}`, alignItems:"center" }}>
                  <div style={{ width:88, height:88, borderRadius:14, background:"#f5ece0", overflow:"hidden", flexShrink:0 }}>
                    <img src={l.img} alt={l.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:18, fontWeight:700, color:T.ink, marginBottom:4 }}>{l.name}</div>
                    {Object.values(l.opts).length > 0 && (
                      <div style={{ fontSize:15, color:T.inkMuted, marginBottom:4 }}>
                        {Object.entries(l.opts).map(([k, v]) => `${k}: ${v.n}`).join(" / ")}
                      </div>
                    )}
                    <div style={{ fontSize:20, fontWeight:700, color:T.accent }}>{fmt(l.lineTotal)}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end" }}>
                    <Stepper value={l.qty} onChange={q => onUpdateQty(i, q)} />
                    <button onClick={() => onRemove(i)}
                      style={{ background:"none", border:"none", color:T.inkMuted, fontSize:14, cursor:"pointer", textDecoration:"underline", fontFamily:"inherit" }}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"18px 32px 28px", borderTop:`1px solid ${T.line}`, display:"flex", alignItems:"center", gap:18, flexShrink:0 }}>
              <div style={{ flexShrink:0 }}>
                <div style={{ fontSize:14, color:T.inkMuted, fontWeight:500 }}>주문 합계</div>
                <div style={{ fontSize:28, fontWeight:800, color:T.ink }}>{fmt(subtotal)}</div>
              </div>
              <button onClick={onCheckout}
                style={{ flex:1, height:64, borderRadius:14, border:"none", cursor:"pointer", background:T.accent, color:T.accentInk, fontSize:20, fontWeight:700, fontFamily:"inherit" }}>
                주문하기 ({cart.reduce((s, l) => s + l.qty, 0)})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── OrdersModal ──────────────────────────────────────────
function OrdersModal({ orders, onClose }: { orders: PastOrder[]; onClose: () => void }) {
  const total = orders.reduce((s, o) => s + o.price, 0);
  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(22,18,14,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}
      onClick={onClose}>
      <div style={{ background:T.surface, borderRadius:24, width:680, maxHeight:"85%", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding:"24px 32px 18px", borderBottom:`1px solid ${T.line}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:T.ink, margin:0 }}>주문 내역</h2>
          <button onClick={onClose} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(0,0,0,0.06)", border:"none", fontSize:20, cursor:"pointer", color:T.ink }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {orders.map(o => (
            <div key={o.id} style={{ display:"grid", gridTemplateColumns:"64px 1fr auto", gap:18, alignItems:"center", padding:"18px 32px", borderBottom:`1px solid ${T.line}` }}>
              <div style={{ fontFamily:"monospace", fontSize:16, color:T.inkMuted, textAlign:"center" }}>{o.time}</div>
              <div>
                <div style={{ fontSize:18, fontWeight:600, color:T.ink }}>{o.name} <span style={{ color:T.inkMuted, fontWeight:500 }}>× {o.qty}</span></div>
                <div style={{ fontSize:14, marginTop:4, color:o.status==="served"?"#5a8a3d":T.accent }}>
                  {o.status === "served" ? "● 서빙 완료" : "● 조리 중"}
                </div>
              </div>
              <div style={{ fontSize:18, fontWeight:700, color:T.ink }}>{fmt(o.price * o.qty)}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"18px 32px 28px", borderTop:`1px solid ${T.line}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:14, color:T.inkMuted }}>현재까지 총액</div>
            <div style={{ fontSize:28, fontWeight:800, color:T.ink }}>{fmt(total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CallStaffModal ───────────────────────────────────────
function CallStaffModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const reasons = ["물 / 잔 추가", "수저 / 앞접시", "주문 변경", "계산서 요청", "기타 문의"];

  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(22,18,14,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}
      onClick={!sent ? onClose : undefined}>
      <div style={{ background:T.surface, borderRadius:24, width:580, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{ padding:"52px 40px 44px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:10 }}>
            <div style={{ color:"#5a8a3d", marginBottom:10 }}>
              <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 style={{ fontSize:24, fontWeight:800, color:T.ink, margin:"4px 0" }}>직원을 호출했어요</h2>
            <p style={{ fontSize:17, color:T.inkMuted, marginBottom:20 }}>잠시만 기다려 주세요 — 곧 도와드릴게요</p>
            <button onClick={onClose}
              style={{ width:"100%", height:60, borderRadius:14, border:"none", cursor:"pointer", background:T.accent, color:T.accentInk, fontSize:19, fontWeight:700, fontFamily:"inherit" }}>
              확인
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding:"24px 32px 18px", borderBottom:`1px solid ${T.line}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:26, fontWeight:800, color:T.ink, margin:0 }}>직원 호출</h2>
              <button onClick={onClose} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(0,0,0,0.06)", border:"none", fontSize:20, cursor:"pointer", color:T.ink }}>✕</button>
            </div>
            <p style={{ padding:"16px 32px 6px", fontSize:16, color:T.inkMuted, margin:0 }}>필요한 항목을 선택해 주세요</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"14px 32px 24px" }}>
              {reasons.map(r => (
                <button key={r} onClick={() => setSelected(r)}
                  style={{ background:selected===r?T.accentSoft:T.surface2,
                    border:`1.5px solid ${selected===r?T.accent:T.line}`,
                    borderRadius:14, padding:"22px 16px", fontSize:17, fontWeight:600,
                    cursor:"pointer", color:selected===r?T.accent:T.ink, textAlign:"center", fontFamily:"inherit" }}>
                  {r}
                </button>
              ))}
            </div>
            <div style={{ padding:"0 32px 32px" }}>
              <button disabled={!selected} onClick={() => setSent(true)}
                style={{ width:"100%", height:60, borderRadius:14, border:"none", cursor:"pointer",
                  background:selected?T.accent:"#ddd", color:selected?T.accentInk:"#aaa", fontSize:19, fontWeight:700, fontFamily:"inherit" }}>
                호출하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CheckoutModal ────────────────────────────────────────
function CheckoutModal({ cart, onClose, onDone }:
  { cart: CartLine[]; onClose: () => void; onDone: () => void }) {
  const [method, setMethod] = useState("card");
  const [done, setDone] = useState(false);
  const subtotal = cart.reduce((s, l) => s + l.lineTotal, 0);
  const methods = [
    { id:"card",  name:"신용카드",   icon:"💳" },
    { id:"kakao", name:"카카오페이", icon:"K" },
    { id:"naver", name:"네이버페이", icon:"N" },
    { id:"later", name:"후불 결제",  icon:"⏱" },
  ];

  if (done) return (
    <div style={{ position:"absolute", inset:0, background:"rgba(22,18,14,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}
      onClick={onDone}>
      <div style={{ background:T.surface, borderRadius:24, width:520, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding:"52px 40px 44px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:10 }}>
          <div style={{ color:"#5a8a3d", marginBottom:10 }}>
            <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <h2 style={{ fontSize:24, fontWeight:800, color:T.ink, margin:"4px 0" }}>주문이 완료됐어요</h2>
          <p style={{ fontSize:17, color:T.inkMuted, marginBottom:20 }}>조리가 시작되면 알려드릴게요</p>
          <button onClick={onDone}
            style={{ width:"100%", height:60, borderRadius:14, border:"none", cursor:"pointer", background:T.accent, color:T.accentInk, fontSize:19, fontWeight:700, fontFamily:"inherit" }}>
            메뉴로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(22,18,14,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}
      onClick={onClose}>
      <div style={{ background:T.surface, borderRadius:24, width:680, maxHeight:"90%", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding:"24px 32px 18px", borderBottom:`1px solid ${T.line}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:T.ink, margin:0 }}>결제</h2>
          <button onClick={onClose} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(0,0,0,0.06)", border:"none", fontSize:20, cursor:"pointer", color:T.ink }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"20px 32px" }}>
          <div style={{ background:T.surface2, borderRadius:14, padding:"18px 22px", marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.inkMuted, marginBottom:12, letterSpacing:"0.05em" }}>주문 요약</div>
            {cart.map((l, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:16, color:T.ink }}>
                <span>{l.name} × {l.qty}</span><span>{fmt(l.lineTotal)}</span>
              </div>
            ))}
            <div style={{ height:1, background:T.line, margin:"10px 0" }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:20, fontWeight:800, color:T.ink }}>
              <span>합계</span><span>{fmt(subtotal)}</span>
            </div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:T.inkMuted, marginBottom:12, letterSpacing:"0.05em" }}>결제 수단</div>
          {methods.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              style={{ width:"100%", background:method===m.id?T.accentSoft:T.surface,
                border:`1.5px solid ${method===m.id?T.accent:T.line}`,
                borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:16,
                cursor:"pointer", fontFamily:"inherit", fontSize:18, fontWeight:600, color:T.ink, marginBottom:10 }}>
              <span style={{ width:44, height:44, borderRadius:10, background:T.surface2, display:"grid", placeItems:"center", fontSize:20, fontWeight:800, flexShrink:0 }}>{m.icon}</span>
              <span style={{ flex:1, textAlign:"left" }}>{m.name}</span>
              <span style={{ width:22, height:22, borderRadius:"50%",
                border:`2px solid ${method===m.id?T.accent:T.line}`,
                background:method===m.id?T.accent:"transparent",
                boxShadow:method===m.id?`inset 0 0 0 4px ${T.surface}`:"none",
                display:"inline-block", flexShrink:0 }} />
            </button>
          ))}
        </div>
        <div style={{ padding:"18px 32px 28px", borderTop:`1px solid ${T.line}`, display:"flex", alignItems:"center", gap:18, flexShrink:0 }}>
          <div style={{ flexShrink:0 }}>
            <div style={{ fontSize:14, color:T.inkMuted, fontWeight:500 }}>결제 금액</div>
            <div style={{ fontSize:28, fontWeight:800, color:T.ink }}>{fmt(subtotal)}</div>
          </div>
          <button onClick={() => setDone(true)}
            style={{ flex:1, height:64, borderRadius:14, border:"none", cursor:"pointer", background:T.accent, color:T.accentInk, fontSize:20, fontWeight:700, fontFamily:"inherit" }}>
            {methods.find(m => m.id === method)?.name}로 결제
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function TableOrderPage() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState("jeon");
  const [openItem, setOpenItem] = useState<Item | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<PastOrder[]>(INITIAL_ORDERS);
  const [bigText, setBigText] = useState(false);

  const items = ITEMS[activeCat] || [];
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cart.reduce((s, l) => s + l.lineTotal, 0);
  const cat = CATEGORIES.find(c => c.id === activeCat);
  const fs = bigText ? 1.15 : 1;

  const addToCart = (line: CartLine) => { setCart(prev => [...prev, line]); setOpenItem(null); };

  const handleCheckoutDone = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const newOrders: PastOrder[] = cart.map((line, i) => ({
      id: `order-${Date.now()}-${i}`,
      time,
      name: line.name,
      img: line.img,
      qty: line.qty,
      price: line.lineTotal,
      status: "cooking",
    }));
    setOrders(prev => [...prev, ...newOrders]);
    setCart([]);
    setShowCheckout(false);
  };
  const updateQty = (i: number, q: number) => {
    setCart(prev => {
      const next = [...prev];
      const unit = next[i].lineTotal / next[i].qty;
      next[i] = { ...next[i], qty: q, lineTotal: Math.round(unit * q) };
      return next;
    });
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "row",
      overflow: "hidden",
      background: T.bg,
      position: "relative",
      fontFamily: `"Apple SD Gothic Neo","Malgun Gothic","맑은 고딕","Noto Sans KR",-apple-system,BlinkMacSystemFont,sans-serif`,
    }}>

        {/* ─── Sidebar ─── */}
        <aside style={{ width:240, background:T.sidebar, display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>
          <div style={{ padding:"22px 16px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, borderBottom:`1px solid rgba(255,255,255,0.07)`, flexShrink:0 }}>
            <div style={{ width:62, height:62, borderRadius:"50%", background:T.accent, color:T.accentInk, display:"grid", placeItems:"center", fontWeight:800, fontSize:26 }}>전</div>
            <div style={{ fontSize:18, fontWeight:800, color:T.sidebarInk, letterSpacing:"-0.01em" }}>{RESTAURANT.name}</div>
            <div style={{ fontSize:13, color:T.sidebarMuted }}>{RESTAURANT.branch}</div>
          </div>
          <nav style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", padding:"8px 0", gap:2 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                style={{ background:activeCat===c.id?T.bg:"none", border:"none",
                  color:activeCat===c.id?T.ink:T.sidebarMuted, textAlign:"left",
                  padding:"14px 22px", fontSize:17*fs, fontWeight:activeCat===c.id?700:500,
                  borderRadius:activeCat===c.id?"10px 0 0 10px":"10px",
                  cursor:"pointer", lineHeight:1.3, marginRight:activeCat===c.id?-1:0,
                  display:"flex", alignItems:"center", gap:10, fontFamily:"inherit" }}>
                {c.name}
                {c.badge && (
                  <span style={{ fontSize:12, fontWeight:700, background:T.accent, color:T.accentInk, padding:"2px 8px", borderRadius:10 }}>{c.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <button onClick={() => setShowCall(true)}
            style={{ margin:"0 16px 20px", background:"rgba(255,255,255,0.06)", color:T.sidebarInk,
              border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"14px 8px",
              fontSize:15, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:7, cursor:"pointer", fontFamily:"inherit" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>
            </svg>
            직원 호출
          </button>
        </aside>

        {/* ─── Main ─── */}
        <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* TopBar */}
          <header style={{ height:64, padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.line}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:12 }}>
              <span style={{ fontSize:26*fs, fontWeight:800, color:T.accent }}>{cat?.name}</span>
              <span style={{ fontSize:16, color:T.inkMuted }}>전체보기</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button onClick={() => setBigText(v => !v)}
                style={{ background:"none", border:`1px solid ${T.line}`, borderRadius:10, padding:"6px 16px", fontSize:bigText?22:17, fontWeight:700, cursor:"pointer", color:bigText?T.accent:T.inkMuted, fontFamily:"inherit" }}>가</button>
              <div style={{ background:T.accent, color:T.accentInk, padding:"7px 18px 9px", borderRadius:"0 0 16px 16px", textAlign:"center", marginTop:-8 }}>
                <span style={{ display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em", opacity:.85 }}>Table</span>
                <span style={{ display:"block", fontSize:20*fs, fontWeight:800, lineHeight:1 }}>{RESTAURANT.tableNo}</span>
              </div>
            </div>
          </header>

          {/* Menu grid */}
          <div style={{ flex:1, overflowY:"auto", padding:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:16, alignContent:"start" }}>
              {items.map(item => (
                <button key={item.id} onClick={() => setOpenItem(item)}
                  style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:18, padding:0,
                    cursor:"pointer", textAlign:"left", boxShadow:"0 2px 0 #ece3d0", overflow:"hidden", display:"flex", flexDirection:"column" }}>
                  <div style={{ aspectRatio:"4/3", background:"#f5ece0", position:"relative", overflow:"hidden", width:"100%" }}>
                    <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    {item.badge && (
                      <div style={{ position:"absolute", top:10, left:10 }}>
                        <Badge kind={item.badge==="BEST"?"best":item.badge==="NEW"?"new":"spicy"}>
                          {item.badge==="BEST"?"👑 ":""}{item.badge}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div style={{ padding:"14px 18px 18px", display:"flex", flexDirection:"column", gap:5 }}>
                    <div style={{ fontSize:18*fs, fontWeight:700, color:T.ink, lineHeight:1.3 }}>{item.name}</div>
                    <div style={{ fontSize:22*fs, fontWeight:800, color:T.ink, letterSpacing:"-0.01em" }}>{fmt(item.price)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CartBar */}
          <footer style={{ height:88, padding:"0 24px", borderTop:`1px solid ${T.line}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:T.surface2, flexShrink:0 }}>
            <button onClick={() => setShowOrders(true)}
              style={{ background:"transparent", border:`1px solid ${T.line}`, color:T.inkMuted,
                padding:"11px 18px", borderRadius:12, fontSize:16, fontWeight:500, cursor:"pointer",
                display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
              주문 내역
            </button>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => navigate("/")}
                style={{ background:T.surface, border:`1px solid ${T.line}`, color:T.ink, padding:"0 22px",
                  height:56, borderRadius:12, fontSize:17, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                홈
              </button>
              <button onClick={() => setShowCart(true)}
                style={{ background:T.accent, color:T.accentInk, padding:"0 26px", height:56,
                  borderRadius:12, fontSize:18, fontWeight:700, cursor:"pointer", border:"none",
                  fontFamily:"inherit", display:"flex", alignItems:"center", gap:10 }}>
                장바구니
                {cartCount > 0 && <span style={{ background:"rgba(255,255,255,0.25)", borderRadius:10, padding:"3px 10px", fontSize:15, minWidth:28, textAlign:"center" }}>{cartCount}</span>}
                {cartCount > 0 && <span style={{ fontSize:15, opacity:.9, fontWeight:600 }}>{fmt(cartTotal)}</span>}
              </button>
            </div>
          </footer>
        </main>

        {/* ─── Modals ─── */}
        {openItem && <ItemDetailModal item={openItem} onClose={() => setOpenItem(null)} onAdd={addToCart} />}
        {showCart && (
          <CartModal
            cart={cart}
            onClose={() => setShowCart(false)}
            onUpdateQty={updateQty}
            onRemove={i => setCart(cart.filter((_, idx) => idx !== i))}
            onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
          />
        )}
        {showOrders && <OrdersModal orders={orders} onClose={() => setShowOrders(false)} />}
        {showCall && <CallStaffModal onClose={() => setShowCall(false)} />}
        {showCheckout && (
          <CheckoutModal
            cart={cart}
            onClose={() => setShowCheckout(false)}
            onDone={handleCheckoutDone}
          />
        )}
    </div>
  );
}

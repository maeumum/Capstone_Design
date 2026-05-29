import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import "./BurgerOne.css";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type Scene =
  | "welcome" | "dine" | "menu" | "options"
  | "cart" | "paymethod" | "payproc" | "done";
type DineType = "dine-in" | "takeout" | null;
type PayMethod = "card" | "mobile" | "cash";

interface AllergenDef {
  id: string; label: string; short: string; color: string; info: string;
}
interface MenuItem {
  id: string; name: string; desc: string;
  price: number; setPrice?: number;
  emoji: string; color: string;
  popular?: boolean;
  allergens: string[];
}
interface SetOption { id: string; name: string; price: number; emoji: string; }
interface BurgerOpts { pattyCount: number; sauces: string[]; toppings: string[]; }
interface CartLine {
  id: string; item: MenuItem;
  isSet: boolean;
  burgerOptions: BurgerOpts | null;
  side: SetOption | null;
  drink: SetOption | null;
  qty: number; unitPrice: number; lineTotal: number;
}

// ─── 데이터 ───────────────────────────────────────────────────────────────────

const ALLERGENS: Record<string, AllergenDef> = {
  gluten: { id: "gluten", label: "글루텐", short: "글", color: "#C9740B", info: "밀가루(빵)가 포함되어 있어요." },
  dairy:  { id: "dairy",  label: "유제품", short: "유", color: "#5A82C9", info: "치즈·우유·버터 등 유제품이 포함되어 있어요." },
  nuts:   { id: "nuts",   label: "견과류", short: "견", color: "#7A4A1F", info: "땅콩·견과류가 포함되거나 같은 라인에서 조리됩니다." },
  egg:    { id: "egg",    label: "달걀",   short: "달", color: "#D6A22B", info: "달걀이 포함되어 있어요." },
  shrimp: { id: "shrimp", label: "새우",   short: "새", color: "#E07B5C", info: "갑각류(새우)가 포함되어 있어요." },
  soy:    { id: "soy",    label: "콩",     short: "콩", color: "#7A9D3E", info: "대두(콩)가 포함되어 있어요." },
};

const MENU: Record<string, MenuItem[]> = {
  burger: [
    { id: "b1", name: "불고기버거",   desc: "달콤 짭짤한 한국식 불고기",  price: 5500, setPrice: 7600, emoji: "🍔", color: "#FFE4D6", popular: true,  allergens: ["gluten","soy"] },
    { id: "b2", name: "치즈버거",     desc: "진한 체다 치즈 듬뿍",        price: 5800, setPrice: 7900, emoji: "🍔", color: "#FFF1C4",               allergens: ["gluten","dairy"] },
    { id: "b3", name: "새우버거",     desc: "바삭한 새우 패티",            price: 6200, setPrice: 8300, emoji: "🍤", color: "#FFD9C2",               allergens: ["gluten","shrimp","egg"] },
    { id: "b4", name: "치킨버거",     desc: "바삭 크리스피 치킨",          price: 5900, setPrice: 8000, emoji: "🍗", color: "#FFEBC2",               allergens: ["gluten","egg"] },
    { id: "b5", name: "빅원버거",     desc: "두툼한 비프 패티 두 장",      price: 7200, setPrice: 9300, emoji: "🍔", color: "#FFD2B8", popular: true,  allergens: ["gluten","dairy","soy"] },
    { id: "b6", name: "새싹채소버거", desc: "담백한 채소 패티",            price: 5400, setPrice: 7500, emoji: "🥬", color: "#E4F0D0",               allergens: ["gluten","soy"] },
  ],
  side: [
    { id: "s1", name: "감자튀김",   desc: "갓 튀긴 바삭한 감자",         price: 2500, emoji: "🍟", color: "#FFEBC2", allergens: [] },
    { id: "s2", name: "치즈스틱",   desc: "쭈욱 늘어나는 치즈 4조각",    price: 3200, emoji: "🧀", color: "#FFF1C4", allergens: ["gluten","dairy"] },
    { id: "s3", name: "치킨너겟",   desc: "부드러운 치킨너겟 6조각",     price: 3500, emoji: "🍗", color: "#FFE4D6", allergens: ["gluten","egg"] },
    { id: "s4", name: "양파링",     desc: "바삭한 양파링 4조각",         price: 2800, emoji: "🧅", color: "#FFEBC2", allergens: ["gluten"] },
    { id: "s5", name: "고구마튀김", desc: "달콤한 고구마 스틱",           price: 2800, emoji: "🍠", color: "#FFD9C2", allergens: [] },
  ],
  drink: [
    { id: "d1", name: "콜라",       desc: "시원한 탄산음료",             price: 2200, emoji: "🥤", color: "#E8DCD0", allergens: [] },
    { id: "d2", name: "사이다",     desc: "톡 쏘는 사이다",              price: 2200, emoji: "🥤", color: "#DCE8DC", allergens: [] },
    { id: "d3", name: "아메리카노", desc: "진한 원두커피",               price: 2500, emoji: "☕", color: "#E8DCD0", allergens: [] },
    { id: "d4", name: "오렌지주스", desc: "100% 오렌지 주스",            price: 2800, emoji: "🧃", color: "#FFE4D6", allergens: [] },
    { id: "d5", name: "카페라떼",   desc: "부드러운 우유 라떼",          price: 3000, emoji: "☕", color: "#F0E2CC", allergens: ["dairy"] },
    { id: "d6", name: "보리차",     desc: "구수한 따뜻한 보리차",        price: 1500, emoji: "🍵", color: "#E8DCC0", allergens: [] },
  ],
  dessert: [
    { id: "ds1", name: "아이스크림", desc: "부드러운 바닐라 아이스크림",  price: 1500, emoji: "🍦", color: "#FFF1E5", allergens: ["dairy"] },
    { id: "ds2", name: "단팥빙수",   desc: "시원한 단팥빙수",             price: 5500, emoji: "🍧", color: "#FFE4D6", allergens: ["dairy"] },
    { id: "ds3", name: "초코파이",   desc: "달콤한 초코파이",             price: 2000, emoji: "🍫", color: "#E8DCD0", allergens: ["gluten","dairy","nuts"] },
    { id: "ds4", name: "호두과자",   desc: "따끈한 호두과자 5개",         price: 2500, emoji: "🥮", color: "#FFE4D6", allergens: ["gluten","dairy","nuts","egg"] },
    { id: "ds5", name: "붕어빵",     desc: "바삭한 팥 붕어빵 3개",        price: 2000, emoji: "🐟", color: "#FFF1C4", allergens: ["gluten"] },
  ],
};

const CATEGORIES = [
  { id: "burger",  label: "버거",   emoji: "🍔" },
  { id: "side",    label: "사이드", emoji: "🍟" },
  { id: "drink",   label: "음료",   emoji: "🥤" },
  { id: "dessert", label: "디저트", emoji: "🍦" },
];

const SET_SIDES: SetOption[] = [
  { id: "fry-m", name: "감자튀김(R)", price: 0,   emoji: "🍟" },
  { id: "fry-l", name: "감자튀김(L)", price: 700, emoji: "🍟" },
  { id: "ring",  name: "양파링",      price: 500, emoji: "🧅" },
  { id: "nug",   name: "너겟 4조각",  price: 800, emoji: "🍗" },
];

const SET_DRINKS: SetOption[] = [
  { id: "sd1", name: "콜라",       price: 0,   emoji: "🥤" },
  { id: "sd2", name: "사이다",     price: 0,   emoji: "🥤" },
  { id: "sd3", name: "아메리카노", price: 300, emoji: "☕" },
  { id: "sd4", name: "오렌지주스", price: 500, emoji: "🧃" },
];

const PATTY_OPTIONS = [
  { id: 1, label: "1장 (기본)", price: 0,    emoji: "🍖",   note: "기본 패티 한 장" },
  { id: 2, label: "2장 (더블)", price: 1000, emoji: "🍖🍖", note: "더 든든하게" },
];
const SAUCE_OPTIONS = [
  { id: "ketchup", label: "케첩",     price: 0, emoji: "🍅", isExclusive: false },
  { id: "mustard", label: "머스타드", price: 0, emoji: "🌭", isExclusive: false },
  { id: "special", label: "특제소스", price: 0, emoji: "✨", isExclusive: false },
  { id: "none",    label: "없음",     price: 0, emoji: "🚫", isExclusive: true  },
];
const TOPPING_OPTIONS = [
  { id: "cheese",    label: "치즈 슬라이스",         price: 500, emoji: "🧀" },
  { id: "bacon",     label: "베이컨",                price: 800, emoji: "🥓" },
  { id: "veggie",    label: "야채 추가 (양상추·토마토)", price: 0, emoji: "🥬" },
  { id: "no-pickle", label: "피클 빼기",             price: 0,   emoji: "🥒" },
];

const STEP_LABELS: Record<string, string> = {
  setType: "주문 종류", patty: "패티 수량",
  sauce: "소스 선택",  topping: "토핑 추가",
  side: "사이드 선택", drink: "음료 선택", qty: "수량",
};

const KIOSK_STEPS = [
  { id: "dine",  label: "주문방식" },
  { id: "menu",  label: "메뉴선택" },
  { id: "cart",  label: "주문확인" },
  { id: "pay",   label: "결제하기" },
  { id: "done",  label: "주문완료" },
];

const IDLE_MS = 60000;
const WARN_MS = 30000;

function won(n: number) { return n.toLocaleString("ko-KR") + "원"; }

function summarizeBurgerOptions(opts: BurgerOpts | null, isSet: boolean, side: SetOption | null, drink: SetOption | null) {
  if (!opts) return isSet && side && drink ? `세트 (${side.name} · ${drink.name})` : "";
  const parts: string[] = [];
  if (opts.pattyCount === 2) parts.push("패티 2장");
  const sauces = opts.sauces.map((id) => SAUCE_OPTIONS.find((o) => o.id === id)?.label).filter(Boolean).join("·");
  if (sauces) parts.push(sauces);
  const tops = opts.toppings.map((id) => TOPPING_OPTIONS.find((o) => o.id === id)?.label).filter(Boolean).join("·");
  if (tops) parts.push(tops);
  if (isSet && side && drink) parts.push(`세트(${side.name}·${drink.name})`);
  return parts.join(" · ");
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastItem { id: number; msg: string; kind: string; }

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          <span className="toast-ico">{t.kind === "success" ? "✓" : t.kind === "warn" ? "⚠" : "ℹ"}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = useCallback((msg: string, opts: { kind?: string; duration?: number } = {}) => {
    const id = Date.now() + Math.random();
    const duration = opts.duration ?? 2800;
    setToasts((cur) => [...cur, { id, msg, kind: opts.kind ?? "info" }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), duration);
  }, []);
  return { toasts, push };
}

// ─── StepHeader ───────────────────────────────────────────────────────────────

function StepHeader({ scene, onHome }: { scene: Scene; onHome: () => void }) {
  const sceneToStep = (s: Scene): string => {
    if (s === "welcome" || s === "dine") return "dine";
    if (s === "menu" || s === "options") return "menu";
    if (s === "cart") return "cart";
    if (s === "paymethod" || s === "payproc") return "pay";
    return "done";
  };
  const cur = sceneToStep(scene);
  const idx = KIOSK_STEPS.findIndex((s) => s.id === cur);
  return (
    <header className="khead">
      <button className="khead-logo" onClick={onHome} aria-label="처음으로">
        <span className="khead-logo-mark">B</span>
        <span className="khead-logo-text">
          <span className="khead-logo-brand">버거ONE</span>
          <span className="khead-logo-sub">처음으로</span>
        </span>
      </button>
      <ol className="kstep">
        {KIOSK_STEPS.map((s, i) => {
          const state = i < idx ? "done" : i === idx ? "now" : "todo";
          return (
            <li key={s.id} className={`kstep-item kstep-${state}`}>
              <span className="kstep-num">{i < idx ? "✓" : i + 1}</span>
              <span className="kstep-label">{s.label}</span>
              {i < KIOSK_STEPS.length - 1 && <span className="kstep-line" />}
            </li>
          );
        })}
      </ol>
    </header>
  );
}

// ─── AccessFooter ─────────────────────────────────────────────────────────────

function AccessFooter({
  onBack, onHome, fontScale, onCycleFont, onCallStaff,
}: {
  onBack?: (() => void) | null;
  onHome: () => void;
  fontScale: number;
  onCycleFont: () => void;
  onCallStaff: () => void;
}) {
  const scaleLabel = fontScale === 1 ? "보통" : fontScale === 1.15 ? "크게" : "매우 크게";
  return (
    <footer className="kfoot">
      <button className="kfoot-btn kfoot-btn-back" onClick={onBack ?? undefined} disabled={!onBack}>
        <span className="kfoot-ico">←</span>
        <span>이전</span>
      </button>
      <button className="kfoot-btn" onClick={onCallStaff}>
        <span className="kfoot-ico">🔔</span>
        <span>직원 호출</span>
      </button>
      <button className="kfoot-btn kfoot-btn-font" onClick={onCycleFont}>
        <span className="kfoot-ico kfoot-ico-font"><b>가</b></span>
        <span>큰글씨<br /><small>{scaleLabel}</small></span>
      </button>
      <button className="kfoot-btn" onClick={onHome}>
        <span className="kfoot-ico">⌂</span>
        <span>처음으로</span>
      </button>
    </footer>
  );
}

// ─── StaffCallModal ───────────────────────────────────────────────────────────

function StaffCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="kmodal-bg">
      <div className="kmodal">
        <div className="kmodal-ico">🔔</div>
        <h2>직원을 호출했어요</h2>
        <p>잠시만 기다려 주세요.<br />곧 직원이 도와드리러 옵니다.</p>
        <button className="big-btn big-btn-primary is-full" onClick={onClose}>확인</button>
      </div>
    </div>
  );
}

// ─── IdleWarningModal ─────────────────────────────────────────────────────────

function IdleWarningModal({
  open, secondsLeft, onContinue, onReset,
}: { open: boolean; secondsLeft: number; onContinue: () => void; onReset: () => void; }) {
  if (!open) return null;
  return (
    <div className="kmodal-bg">
      <div className="kmodal kmodal-idle">
        <div className="kmodal-ico kmodal-ico-warn">⏰</div>
        <h2>계속 주문하시겠어요?</h2>
        <p>잠시 사용이 없으셨어요.<br /><b className="kmodal-count">{secondsLeft}초</b> 뒤 처음으로 돌아갑니다.</p>
        <div className="kmodal-btns">
          <button className="big-btn big-btn-ghost" onClick={onReset}>처음으로</button>
          <button className="big-btn big-btn-success" onClick={onContinue}>계속 주문하기</button>
        </div>
      </div>
    </div>
  );
}

// ─── AllergyBottomSheet ───────────────────────────────────────────────────────

function AllergyBottomSheet({ item, onClose }: { item: MenuItem | null; onClose: () => void; }) {
  if (!item) return null;
  const list = item.allergens.map((id) => ALLERGENS[id]).filter(Boolean);
  return (
    <div className="bsheet-bg" onClick={onClose}>
      <div className="bsheet" onClick={(e) => e.stopPropagation()}>
        <div className="bsheet-handle" />
        <div className="bsheet-head">
          <div className="bsheet-img" style={{ background: item.color }}>
            <span>{item.emoji}</span>
          </div>
          <div>
            <h2>{item.name}</h2>
            <p>알레르기 정보를 확인해주세요</p>
          </div>
        </div>
        {list.length === 0 ? (
          <div className="bsheet-empty">
            <div className="bsheet-empty-ico">✓</div>
            <p>표시 대상 알레르겐이 없어요</p>
            <small>※ 같은 매장에서 다른 원재료를 다루므로 100% 보장은 어렵습니다</small>
          </div>
        ) : (
          <ul className="bsheet-list">
            {list.map((a) => (
              <li key={a.id} className="bsheet-row">
                <span className="bsheet-row-tag" style={{ background: a.color }}>{a.short}</span>
                <div className="bsheet-row-info">
                  <div className="bsheet-row-name">{a.label}</div>
                  <div className="bsheet-row-desc">{a.info}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="bsheet-foot">
          <button className="big-btn big-btn-primary is-full" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}

// ─── WelcomeScreen ────────────────────────────────────────────────────────────

function WelcomeScreen({ onStart, fontScale, onCycleFont }: {
  onStart: () => void; fontScale: number; onCycleFont: () => void;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return (
    <div className="scr scr-welcome">
      <div className="welcome-top">
        <div className="welcome-clock">{hh}:{mm}</div>
        <button className="welcome-font" onClick={onCycleFont}>
          <b>가</b><span>글자 크기</span>
        </button>
      </div>
      <div className="welcome-hero">
        <div className="welcome-logo-wrap">
          <div className="welcome-logo">
            <div className="welcome-logo-mark">B</div>
            <div className="welcome-logo-shine" />
          </div>
          <div className="welcome-brand">버거ONE</div>
          <div className="welcome-tagline">쉽고 따뜻한 한 끼</div>
        </div>
        <div className="welcome-illus" aria-hidden="true">
          <div className="welcome-illus-burger">🍔</div>
          <div className="welcome-illus-fries">🍟</div>
          <div className="welcome-illus-drink">🥤</div>
        </div>
      </div>
      <button className="welcome-start" onClick={onStart}>
        <span className="welcome-start-big">화면을 눌러 주문을 시작하세요</span>
        <span className="welcome-start-arrow">›</span>
      </button>
      <div className="welcome-help">
        <span className="welcome-help-ico">💬</span>
        도움이 필요하면 화면 아래 <b>'직원 호출'</b> 버튼을 눌러주세요
      </div>
    </div>
  );
}

// ─── DineTypeScreen ───────────────────────────────────────────────────────────

function DineTypeScreen({ onPick }: { onPick: (t: "dine-in" | "takeout") => void; }) {
  return (
    <div className="scr scr-dine">
      <div className="scr-title">
        <h1>어디에서 드시나요?</h1>
        <p>원하시는 곳을 크게 눌러주세요</p>
      </div>
      <div className="dine-cards">
        <button className="dine-card" onClick={() => onPick("dine-in")}>
          <div className="dine-card-ico">🍽️</div>
          <div className="dine-card-title">매장에서 먹어요</div>
          <div className="dine-card-sub">매장 식사</div>
        </button>
        <button className="dine-card dine-card-takeout" onClick={() => onPick("takeout")}>
          <div className="dine-card-ico">🛍️</div>
          <div className="dine-card-title">가져갈래요</div>
          <div className="dine-card-sub">포장 주문</div>
        </button>
      </div>
      <div className="dine-note">
        <span>💡</span> 선택은 다음 화면에서 바꿀 수 있어요
      </div>
    </div>
  );
}

// ─── MenuScreen ───────────────────────────────────────────────────────────────

function MenuScreen({ cart, onAdd, dineType, onCartOpen, onShowAllergy }: {
  cart: CartLine[];
  onAdd: (item: MenuItem) => void;
  dineType: DineType;
  onCartOpen: () => void;
  onShowAllergy: (item: MenuItem) => void;
}) {
  const [cat, setCat] = useState("burger");
  const items = MENU[cat] ?? [];
  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const cartTotal = cart.reduce((a, c) => a + c.lineTotal, 0);

  return (
    <div className="scr scr-menu">
      <div className="menu-mode">
        <span className="menu-mode-tag">{dineType === "dine-in" ? "🍽️ 매장식사" : "🛍️ 포장"}</span>
        <span className="menu-mode-hint">메뉴를 눌러서 담아주세요</span>
      </div>
      <div className="menu-body">
        <nav className="menu-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`menu-cat ${cat === c.id ? "is-on" : ""}`}
              onClick={() => setCat(c.id)}
            >
              <span className="menu-cat-ico">{c.emoji}</span>
              <span className="menu-cat-label">{c.label}</span>
            </button>
          ))}
        </nav>
        <div className="menu-grid">
          {items.map((it) => {
            const inCart = cart.filter((c) => c.item.id === it.id).reduce((a, c) => a + c.qty, 0);
            const allergens = it.allergens.map((id) => ALLERGENS[id]).filter(Boolean);
            return (
              <div key={it.id} className="menu-card" style={{ "--tile": it.color } as React.CSSProperties}>
                {it.popular && <span className="menu-card-tag">인기</span>}
                {inCart > 0 && <span className="menu-card-count">담음 {inCart}</span>}
                <button className="menu-card-main" onClick={() => onAdd(it)}>
                  <div className="menu-card-img">
                    <span className="menu-card-emoji">{it.emoji}</span>
                  </div>
                  <div className="menu-card-info">
                    <div className="menu-card-name">{it.name}</div>
                    <div className="menu-card-desc">{it.desc}</div>
                    <div className="menu-card-price">{won(it.price)}</div>
                  </div>
                  <div className="menu-card-add">＋ 담기</div>
                </button>
                {allergens.length > 0 && (
                  <button
                    className="menu-card-allergy"
                    onClick={(e) => { e.stopPropagation(); onShowAllergy(it); }}
                  >
                    {allergens.slice(0, 3).map((a) => (
                      <span key={a.id} className="menu-card-aller-dot" style={{ background: a.color }}>{a.short}</span>
                    ))}
                    <span className="menu-card-aller-label">알레르기 ⓘ</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="menu-cartbar"
        onClick={cartCount > 0 ? onCartOpen : undefined}
        role={cartCount > 0 ? "button" : undefined}
      >
        <div className="menu-cartbar-left">
          <span className="menu-cartbar-ico">🛒</span>
          {cartCount === 0 ? (
            <span className="menu-cartbar-empty">아직 담은 메뉴가 없어요</span>
          ) : (
            <span><b>{cartCount}개</b> 담음 · 합계 <b>{won(cartTotal)}</b></span>
          )}
        </div>
        {cartCount > 0 && <span className="menu-cartbar-go">주문확인 ›</span>}
      </div>
    </div>
  );
}

// ─── OptionsScreen ────────────────────────────────────────────────────────────

function OptionsScreen({ item, onCancel, onConfirm }: {
  item: MenuItem | null;
  onCancel: () => void;
  onConfirm: (line: CartLine) => void;
}) {
  const isBurger = item?.setPrice != null;
  const [step, setStep] = useState(0);
  const [setType, setSetType] = useState<"single" | "set" | null>(null);
  const [pattyCount, setPattyCount] = useState(1);
  const [sauces, setSauces] = useState<string[]>(["special"]);
  const [toppings, setToppings] = useState<string[]>([]);
  const [sideId, setSideId] = useState(SET_SIDES[0].id);
  const [drinkId, setDrinkId] = useState(SET_DRINKS[0].id);
  const [qty, setQty] = useState(1);
  const { toasts } = useToast();
  const { push: toast } = useToast();

  const steps = useMemo(() => {
    if (!isBurger) return ["qty"];
    const base = ["setType", "patty", "sauce", "topping"];
    if (setType === "set") base.push("side", "drink");
    base.push("qty");
    return base;
  }, [isBurger, setType]);

  const cur = steps[step];
  const total = steps.length;
  const side  = SET_SIDES.find((s) => s.id === sideId)!;
  const drink = SET_DRINKS.find((d) => d.id === drinkId)!;
  const pattyAdd = PATTY_OPTIONS.find((p) => p.id === pattyCount)?.price ?? 0;
  const topAdd   = toppings.reduce((a, id) => a + (TOPPING_OPTIONS.find((t) => t.id === id)?.price ?? 0), 0);
  const basePrice = !isBurger
    ? (item?.price ?? 0)
    : setType === "set"
    ? (item?.setPrice ?? 0) + (side?.price ?? 0) + (drink?.price ?? 0)
    : (item?.price ?? 0);
  const unitPrice = basePrice + (isBurger ? pattyAdd + topAdd : 0);
  const lineTotal = unitPrice * qty;

  const canNext =
    cur === "setType" ? setType !== null :
    cur === "sauce"   ? sauces.length > 0 :
    true;

  function toggleSauce(id: string) {
    if (id === "none") { setSauces(["none"]); return; }
    const without = sauces.filter((x) => x !== "none" && x !== id);
    if (sauces.includes(id)) { setSauces(without); return; }
    if (without.length >= 2) { toast("소스는 최대 2가지까지 선택할 수 있어요", { kind: "warn" }); return; }
    setSauces([...without, id]);
  }
  const toggleTop = (id: string) =>
    setToppings((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  function goNext() {
    if (!canNext || !item) return;
    if (step + 1 >= total) {
      onConfirm({
        id: `${item.id}-${Date.now()}`,
        item,
        isSet: setType === "set",
        burgerOptions: isBurger ? { pattyCount, sauces, toppings } : null,
        side: setType === "set" ? side : null,
        drink: setType === "set" ? drink : null,
        qty, unitPrice, lineTotal,
      });
    } else {
      setStep(step + 1);
    }
  }
  function goBack() {
    if (step === 0) { onCancel(); return; }
    setStep(step - 1);
  }

  if (!item) return null;

  return (
    <div className="scr scr-options">
      <ToastStack toasts={toasts} />
      <div className="opt-head">
        <div className="opt-head-img" style={{ background: item.color }}>
          <span>{item.emoji}</span>
        </div>
        <div className="opt-head-info">
          <div className="opt-head-name">{item.name}</div>
          <div className="opt-head-step">
            <span className="opt-head-stepnum">{step + 1} / {total}</span>
            <span className="opt-head-steplabel">{STEP_LABELS[cur]}</span>
          </div>
        </div>
      </div>

      <div className="opt-wizard">
        <div className="opt-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`opt-dot ${i < step ? "is-done" : i === step ? "is-now" : ""}`} />
          ))}
        </div>

        <div className="opt-stage">
          {cur === "setType" && (
            <div className="step-pad">
              <header className="step-head">
                <h2>어떻게 드시겠어요?</h2>
                <p>버거만 또는 세트 중 하나를 골라 주세요</p>
              </header>
              <div className="opt-pickrow">
                {(["single", "set"] as const).map((t) => (
                  <button key={t} className={`opt-pick ${setType === t ? "is-on" : ""}`} onClick={() => setSetType(t)}>
                    <span className="opt-pick-ico">{t === "set" ? "🍔🍟🥤" : "🍔"}</span>
                    <div className="opt-pick-name">{t === "set" ? "세트로" : "버거만"}</div>
                    <div className="opt-pick-price">
                      {t === "set" ? <>{won(item.setPrice!)} <small>(+{won(item.setPrice! - item.price)})</small></> : won(item.price)}
                    </div>
                    {t === "set" && <div className="opt-pick-note">사이드 + 음료 포함</div>}
                    {setType === t && <span className="opt-pick-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cur === "patty" && (
            <div className="step-pad">
              <header className="step-head">
                <h2>패티는 몇 장 드릴까요?</h2>
                <p>1장 또는 2장 중에서 골라 주세요</p>
              </header>
              <div className="opt-pickrow">
                {PATTY_OPTIONS.map((p) => (
                  <button key={p.id} className={`opt-pick ${pattyCount === p.id ? "is-on" : ""}`} onClick={() => setPattyCount(p.id)}>
                    <span className="opt-pick-ico">{p.emoji}</span>
                    <div className="opt-pick-name">{p.label}</div>
                    <div className="opt-pick-price">{p.price > 0 ? `+${won(p.price)}` : "추가금 없음"}</div>
                    <div className="opt-pick-note">{p.note}</div>
                    {pattyCount === p.id && <span className="opt-pick-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cur === "sauce" && (
            <div className="step-pad">
              <header className="step-head">
                <h2>소스를 골라 주세요</h2>
                <p>최대 2가지까지 선택할 수 있어요</p>
              </header>
              <div className="opt-checkcol">
                {SAUCE_OPTIONS.map((s) => {
                  const on = sauces.includes(s.id);
                  return (
                    <button key={s.id} className={`opt-check ${on ? "is-on" : ""}`} onClick={() => toggleSauce(s.id)}>
                      <span className="opt-check-box">{on ? "✓" : ""}</span>
                      <span className="opt-check-ico">{s.emoji}</span>
                      <span className="opt-check-name">{s.label}</span>
                      <span className="opt-check-price">무료</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {cur === "topping" && (
            <div className="step-pad">
              <header className="step-head">
                <h2>토핑을 추가하시겠어요?</h2>
                <p>원하는 만큼 선택할 수 있어요 (선택 안 해도 돼요)</p>
              </header>
              <div className="opt-checkcol">
                {TOPPING_OPTIONS.map((t) => {
                  const on = toppings.includes(t.id);
                  return (
                    <button key={t.id} className={`opt-check ${on ? "is-on" : ""}`} onClick={() => toggleTop(t.id)}>
                      <span className="opt-check-box">{on ? "✓" : ""}</span>
                      <span className="opt-check-ico">{t.emoji}</span>
                      <span className="opt-check-name">{t.label}</span>
                      <span className="opt-check-price">{t.price > 0 ? `+${won(t.price)}` : "무료"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(cur === "side" || cur === "drink") && (() => {
            const opts = cur === "side" ? SET_SIDES : SET_DRINKS;
            const val  = cur === "side" ? sideId : drinkId;
            const set  = cur === "side" ? setSideId : setDrinkId;
            return (
              <div className="step-pad">
                <header className="step-head">
                  <h2>{cur === "side" ? "사이드를 골라 주세요" : "음료를 골라 주세요"}</h2>
                  <p>1가지를 선택해 주세요</p>
                </header>
                <div className="opt-checkcol">
                  {opts.map((o) => {
                    const on = val === o.id;
                    return (
                      <button key={o.id} className={`opt-check ${on ? "is-on" : ""}`} onClick={() => set(o.id)}>
                        <span className="opt-check-box">{on ? "✓" : ""}</span>
                        <span className="opt-check-ico">{o.emoji}</span>
                        <span className="opt-check-name">{o.name}</span>
                        <span className="opt-check-price">{o.price > 0 ? `+${won(o.price)}` : "무료"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {cur === "qty" && (
            <div className="step-pad step-pad-center">
              <header className="step-head">
                <h2>몇 개 드릴까요?</h2>
                <p>＋ 또는 － 버튼을 눌러 수량을 정해 주세요</p>
              </header>
              <div className="opt-qty">
                <button className="opt-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>－</button>
                <div className="opt-qty-num">{qty}<span>개</span></div>
                <button className="opt-qty-btn" onClick={() => setQty(Math.min(20, qty + 1))}>＋</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="opt-foot">
        <div className="opt-foot-sum">
          <span>소계</span>
          <b>{won(lineTotal)}</b>
        </div>
        <div className="opt-foot-btns">
          <button className="big-btn big-btn-ghost" onClick={goBack}>← 이전</button>
          <button className="big-btn big-btn-primary" onClick={goNext} disabled={!canNext}>
            {step + 1 >= total ? "장바구니에 담기" : "다음으로 →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CartScreen ───────────────────────────────────────────────────────────────

function CartScreen({ cart, dineType, onAddMore, onRemove, onQty, onPay }: {
  cart: CartLine[]; dineType: DineType;
  onAddMore: () => void; onRemove: (id: string) => void;
  onQty: (id: string, q: number) => void; onPay: () => void;
}) {
  const total = cart.reduce((a, c) => a + c.lineTotal, 0);
  const count = cart.reduce((a, c) => a + c.qty, 0);
  return (
    <div className="scr scr-cart">
      <div className="scr-title">
        <h1>주문 내역을 확인해주세요</h1>
        <p>수량을 바꾸거나 메뉴를 뺄 수 있어요</p>
      </div>
      <div className="cart-mode">
        <span className="menu-mode-tag">{dineType === "dine-in" ? "🍽️ 매장식사" : "🛍️ 포장 주문"}</span>
      </div>
      <div className="cart-list">
        {cart.length === 0 && (
          <div className="cart-empty">
            <div className="cart-empty-ico">🛒</div>
            <div>아직 담은 메뉴가 없어요</div>
          </div>
        )}
        {cart.map((c) => (
          <div key={c.id} className="cart-row">
            <div className="cart-row-img" style={{ background: c.item.color }}>
              <span>{c.item.emoji}</span>
            </div>
            <div className="cart-row-info">
              <div className="cart-row-name">
                {c.item.name}
                {c.isSet && <span className="cart-row-set">세트</span>}
              </div>
              {(() => {
                const s = summarizeBurgerOptions(c.burgerOptions, c.isSet, c.side, c.drink);
                return s ? <div className="cart-row-detail">{s}</div> : null;
              })()}
              <div className="cart-row-price">{won(c.unitPrice)} × {c.qty}</div>
            </div>
            <div className="cart-row-right">
              <div className="cart-row-qty">
                <button onClick={() => onQty(c.id, Math.max(1, c.qty - 1))}>－</button>
                <span>{c.qty}</span>
                <button onClick={() => onQty(c.id, c.qty + 1)}>＋</button>
              </div>
              <div className="cart-row-total">{won(c.lineTotal)}</div>
              <button className="cart-row-rm" onClick={() => onRemove(c.id)}>🗑 빼기</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-foot">
        <div className="cart-foot-sum">
          <div className="cart-foot-line"><span>주문 수량</span><b>{count}개</b></div>
          <div className="cart-foot-line cart-foot-total"><span>총 결제금액</span><b>{won(total)}</b></div>
        </div>
        <div className="cart-foot-btns">
          <button className="big-btn big-btn-ghost" onClick={onAddMore}>＋ 메뉴 더 담기</button>
          <button className="big-btn big-btn-primary" onClick={onPay} disabled={cart.length === 0}>결제하기 ›</button>
        </div>
      </div>
    </div>
  );
}

// ─── PayMethodScreen ──────────────────────────────────────────────────────────

function PayMethodScreen({ total, onPick }: { total: number; onPick: (m: PayMethod) => void; }) {
  return (
    <div className="scr scr-paymethod">
      <div className="scr-title">
        <h1>결제 방법을 골라주세요</h1>
        <p>총 결제 금액: <b className="pm-total">{won(total)}</b></p>
      </div>
      <div className="pm-cards">
        <button className="pm-card" onClick={() => onPick("card")}>
          <div className="pm-card-ico">💳</div>
          <div><div className="pm-card-title">신용/체크카드</div><div className="pm-card-sub">화면 아래에 카드를 꽂아주세요</div></div>
        </button>
        <button className="pm-card" onClick={() => onPick("mobile")}>
          <div className="pm-card-ico">📱</div>
          <div><div className="pm-card-title">모바일 페이</div><div className="pm-card-sub">삼성페이 · 카카오페이 · 페이코</div></div>
        </button>
        <button className="pm-card" onClick={() => onPick("cash")}>
          <div className="pm-card-ico">💵</div>
          <div><div className="pm-card-title">현금 결제</div><div className="pm-card-sub">계산대에서 직원에게 결제</div></div>
        </button>
      </div>
      <div className="pm-note">
        <span>💡</span> 잘 모르시겠다면 <b>직원 호출</b>을 눌러 도움을 받으세요
      </div>
    </div>
  );
}

// ─── PayProcessScreen ─────────────────────────────────────────────────────────

function PayProcessScreen({ method, total, onDone }: {
  method: PayMethod | null; total: number; onDone: () => void;
}) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2400);
    const t2 = setTimeout(() => setPhase(2), 4200);
    const t3 = setTimeout(() => setPhase(3), 6000);
    const t4 = setTimeout(onDone, 7400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  const phases =
    method === "card"   ? ["카드를 꽂아주세요", "카드를 읽고 있어요", "결제를 승인 중이에요", "결제 완료!"]
    : method === "mobile" ? ["휴대폰을 대주세요",  "휴대폰을 읽고 있어요", "결제를 승인 중이에요", "결제 완료!"]
    :                       ["계산대로 가주세요",  "직원이 확인 중이에요", "결제를 승인 중이에요", "결제 완료!"];

  return (
    <div className="scr scr-payproc">
      <div className="pp-amount">
        <div>결제 금액</div>
        <b>{won(total)}</b>
      </div>
      <div className="pp-anim">
        {method === "card" ? (
          <div className={`pp-card pp-card-${phase}`}>
            <div className="pp-card-slot" />
            <div className="pp-card-card">
              <div className="pp-card-chip" />
              <div className="pp-card-num">**** **** **** ****</div>
            </div>
            {phase >= 2 && <div className="pp-check">✓</div>}
          </div>
        ) : method === "mobile" ? (
          <div className={`pp-phone pp-phone-${phase}`}>
            <div className="pp-phone-device">📱</div>
            <div className="pp-phone-wave" />
            {phase >= 2 && <div className="pp-check">✓</div>}
          </div>
        ) : (
          <div className="pp-cash">💵</div>
        )}
      </div>
      <div className="pp-status">
        <div className="pp-status-text">{phases[phase]}</div>
        <div className="pp-status-dots">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pp-dot ${i <= phase ? "is-on" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DoneScreen ───────────────────────────────────────────────────────────────

function DoneScreen({ orderNo, dineType, total, onRestart }: {
  orderNo: string; dineType: DineType; total: number; onRestart: () => void;
}) {
  const [count, setCount] = useState(15);
  useEffect(() => {
    if (count <= 0) { onRestart(); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onRestart]);

  return (
    <div className="scr scr-done">
      <div className="done-check">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#4A9D5E" strokeWidth="4" />
          <path d="M28 52 L44 68 L74 36" fill="none" stroke="#4A9D5E" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="done-title">주문이 완료되었어요</h1>
      <p className="done-sub">
        영수증을 가지고 자리에서<br />잠시만 기다려 주세요
      </p>
      <div className="done-card">
        <div className="done-card-label">주문번호</div>
        <div className="done-card-no">{orderNo}</div>
        <div className="done-card-rows">
          <div><span>주문방식</span><b>{dineType === "dine-in" ? "매장식사" : "포장주문"}</b></div>
          <div><span>결제금액</span><b>{won(total)}</b></div>
        </div>
      </div>
      <div className="done-foot">
        <div className="done-foot-msg">📋 주문번호 영수증이 나왔어요</div>
        <button className="big-btn big-btn-primary is-full" onClick={onRestart}>
          확인 ({count}초)
        </button>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function LotteriaPage() {
  const navigate = useNavigate();
  const [fontScale, setFontScale] = useState(1);
  const [scene, setScene] = useState<Scene>("welcome");
  const [dineType, setDineType] = useState<DineType>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [pickedItem, setPickedItem] = useState<MenuItem | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [orderNo, setOrderNo] = useState("");
  const [staffOpen, setStaffOpen] = useState(false);
  const [allergyItem, setAllergyItem] = useState<MenuItem | null>(null);
  const [idleWarnOpen, setIdleWarnOpen] = useState(false);
  const [idleCount, setIdleCount] = useState(WARN_MS / 1000);

  const idleRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toasts, push: toast } = useToast();

  const cartTotal = cart.reduce((a, c) => a + c.lineTotal, 0);

  const cycleFont = () => setFontScale((f) => f === 1 ? 1.15 : f === 1.15 ? 1.3 : 1);

  const restart = useCallback(() => {
    setScene("welcome"); setDineType(null); setCart([]);
    setPickedItem(null); setPayMethod(null); setOrderNo("");
    setIdleWarnOpen(false); setAllergyItem(null);
    navigate("/lotteria");
  }, [navigate]);

  const clearAll = useCallback(() => {
    if (idleRef.current)  clearTimeout(idleRef.current);
    if (warnRef.current)  clearTimeout(warnRef.current);
    if (tickRef.current)  clearInterval(tickRef.current);
  }, []);

  const resetIdle = useCallback(() => {
    clearAll();
    if (idleWarnOpen) setIdleWarnOpen(false);
    if (scene === "welcome" || scene === "done" || scene === "payproc") return;
    idleRef.current = setTimeout(() => {
      setIdleCount(WARN_MS / 1000);
      setIdleWarnOpen(true);
      tickRef.current = setInterval(() => setIdleCount((c) => Math.max(0, c - 1)), 1000);
      warnRef.current = setTimeout(() => { clearAll(); restart(); }, WARN_MS);
    }, IDLE_MS);
  }, [scene, idleWarnOpen, restart, clearAll]);

  useEffect(() => { resetIdle(); return clearAll; }, [scene, resetIdle, clearAll]);

  useEffect(() => {
    const handler = () => { if (!idleWarnOpen) resetIdle(); };
    window.addEventListener("pointerdown", handler, true);
    window.addEventListener("keydown", handler, true);
    return () => {
      window.removeEventListener("pointerdown", handler, true);
      window.removeEventListener("keydown", handler, true);
    };
  }, [resetIdle, idleWarnOpen]);

  const backOf: Record<Scene, (() => void) | null> = useMemo(() => ({
    welcome:   null,
    dine:      () => setScene("welcome"),
    menu:      () => setScene("dine"),
    options:   () => { setPickedItem(null); setScene("menu"); },
    cart:      () => setScene("menu"),
    paymethod: () => setScene("cart"),
    payproc:   () => setScene("paymethod"),
    done:      null,
  }), []);

  const addToCart = (line: CartLine) => {
    setCart((c) => [...c, line]);
    setPickedItem(null);
    setScene("menu");
    toast(`${line.item.name}을(를) 장바구니에 담았어요`, { kind: "success" });
  };

  const handlePickMenu = (item: MenuItem) => {
    if (item.setPrice == null) {
      const line: CartLine = {
        id: `${item.id}-${Date.now()}`, item, isSet: false,
        burgerOptions: null, side: null, drink: null,
        qty: 1, unitPrice: item.price, lineTotal: item.price,
      };
      setCart((c) => [...c, line]);
      toast(`${item.name}을(를) 장바구니에 담았어요`, { kind: "success" });
      return;
    }
    setPickedItem(item);
    setScene("options");
  };

  const showHeader = scene !== "welcome";
  const showFooter = scene !== "welcome" && scene !== "payproc" && scene !== "done";

  return (
    <div className="bo-page" style={{ "--font-scale": fontScale } as React.CSSProperties}>
      <ToastStack toasts={toasts} />

      {showHeader && <StepHeader scene={scene} onHome={restart} />}

      <div className={`kbody ${showHeader ? "has-head" : "no-head"}`}>
        {scene === "welcome" && (
          <WelcomeScreen onStart={() => setScene("dine")} fontScale={fontScale} onCycleFont={cycleFont} />
        )}
        {scene === "dine" && (
          <DineTypeScreen onPick={(t) => { setDineType(t); setScene("menu"); }} />
        )}
        {scene === "menu" && (
          <MenuScreen
            cart={cart} dineType={dineType}
            onAdd={handlePickMenu}
            onCartOpen={() => setScene("cart")}
            onShowAllergy={setAllergyItem}
          />
        )}
        {scene === "options" && (
          <OptionsScreen
            item={pickedItem}
            onCancel={() => { setPickedItem(null); setScene("menu"); }}
            onConfirm={addToCart}
          />
        )}
        {scene === "cart" && (
          <CartScreen
            cart={cart} dineType={dineType}
            onAddMore={() => setScene("menu")}
            onRemove={(id) => setCart((c) => c.filter((x) => x.id !== id))}
            onQty={(id, q) => setCart((c) => c.map((x) => x.id === id ? { ...x, qty: q, lineTotal: x.unitPrice * q } : x))}
            onPay={() => setScene("paymethod")}
          />
        )}
        {scene === "paymethod" && (
          <PayMethodScreen
            total={cartTotal}
            onPick={(m) => { setPayMethod(m); setScene("payproc"); }}
          />
        )}
        {scene === "payproc" && (
          <PayProcessScreen
            method={payMethod} total={cartTotal}
            onDone={() => { setOrderNo(String(Math.floor(Math.random() * 900) + 100)); setScene("done"); }}
          />
        )}
        {scene === "done" && (
          <DoneScreen orderNo={orderNo} dineType={dineType} total={cartTotal} onRestart={restart} />
        )}
      </div>

      {showFooter && (
        <AccessFooter
          onBack={backOf[scene]}
          onHome={restart}
          fontScale={fontScale}
          onCycleFont={cycleFont}
          onCallStaff={() => { setStaffOpen(true); toast("직원을 호출했습니다", { kind: "success", duration: 5000 }); }}
        />
      )}

      <StaffCallModal open={staffOpen} onClose={() => setStaffOpen(false)} />
      <AllergyBottomSheet item={allergyItem} onClose={() => setAllergyItem(null)} />
      <IdleWarningModal
        open={idleWarnOpen}
        secondsLeft={idleCount}
        onContinue={() => { setIdleWarnOpen(false); resetIdle(); }}
        onReset={() => { setIdleWarnOpen(false); restart(); }}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Home,
  Package,
  ShoppingCart,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type OrderType = "dine-in" | "takeout" | null;
type Category = "recommended" | "burger" | "chicken" | "side" | "drink" | "dessert";
type Step =
  | "welcome"
  | "menu"
  | "item-detail"
  | "set-side"
  | "set-drink"
  | "cart"
  | "payment"
  | "card-pin"
  | "complete";
type OptionType = "single" | "set-regular" | "set-large";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Exclude<Category, "recommended">;
  cardTags?: string[];
  description: string;
  badge?: "BEST" | "NEW";
  image: string;
  settable?: boolean;
  featured?: boolean;
}

interface CartItem {
  uid: string;
  menu: MenuItem;
  qty: number;
  optionType: OptionType;
  side?: string;
  drink?: string;
}

const BRAND_RED = "#D6292D";
const BRAND_GOLD = "#F4C84A";
const BRAND_ORANGE = "#F28B2E";

const OPTION_LABEL: Record<OptionType, string> = {
  single: "단품",
  "set-regular": "레귤러 세트",
  "set-large": "라지 세트",
};

const OPTION_EXTRA: Record<OptionType, number> = {
  single: 0,
  "set-regular": 2900,
  "set-large": 3600,
};

const SIDE_OPTIONS = [
  { name: "포테이토", note: "기본 구성" },
  { name: "양념 포테이토", note: "+400원 풍미 업" },
  { name: "치즈스틱 2조각", note: "+700원" },
];

const DRINK_OPTIONS = [
  { name: "콜라", note: "기본 탄산" },
  { name: "사이다", note: "기본 탄산" },
  { name: "제로콜라", note: "당류 부담 적음" },
  { name: "아이스티", note: "부드러운 복숭아향" },
];

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function foodArt(kind: string) {
  const shell = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#fff8ef"/>
        <stop offset="100%" stop-color="#ffe8cc"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#8d4b13" flood-opacity="0.24"/>
      </filter>
      <linearGradient id="bunTop" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#efba76"/>
        <stop offset="100%" stop-color="#cf7b2d"/>
      </linearGradient>
      <linearGradient id="bunBottom" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#df9b58"/>
        <stop offset="100%" stop-color="#b96924"/>
      </linearGradient>
      <linearGradient id="patty" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#6f3415"/>
        <stop offset="100%" stop-color="#4b1d08"/>
      </linearGradient>
      <linearGradient id="fries" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#ffd768"/>
        <stop offset="100%" stop-color="#f3a122"/>
      </linearGradient>
      <linearGradient id="cup" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#fff"/>
        <stop offset="100%" stop-color="#f4f7fb"/>
      </linearGradient>
    </defs>
    <rect width="640" height="420" fill="url(#bg)"/>
    <ellipse cx="320" cy="332" rx="190" ry="34" fill="#d99c53" opacity=".14"/>
    <g filter="url(#shadow)">{{CONTENT}}</g>
  </svg>`;

  const map: Record<string, string> = {
    bulgogi: `
      <ellipse cx="320" cy="255" rx="165" ry="76" fill="url(#bunTop)"/>
      <g fill="#fff1bd">${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${220 + i * 18}" cy="${208 + (i % 3) * 8}" rx="5" ry="3"/>`).join("")}</g>
      <rect x="176" y="248" width="290" height="18" rx="9" fill="#5c2408"/>
      <path d="M168 268h304c-10 22-18 28-32 28H200c-16 0-24-8-32-28z" fill="url(#patty)"/>
      <path d="M182 240c30 8 66 10 102 0s74-8 108 4c24 8 46 12 68 8" fill="none" stroke="#7c3212" stroke-width="12" stroke-linecap="round"/>
      <path d="M176 229c28 10 54 16 92 16 39 0 72-4 112-14 32-8 55-8 81 0" fill="none" stroke="#77b447" stroke-width="18" stroke-linecap="round"/>
      <path d="M194 221c20-8 38-10 52-2 14 8 30 6 48 0 18-6 39-6 58 4 19 10 38 10 52 0 16-12 31-10 50 0" fill="none" stroke="#f4d458" stroke-width="18" stroke-linecap="round"/>
      <rect x="184" y="296" width="272" height="34" rx="16" fill="url(#bunBottom)"/>
    `,
    shrimp: `
      <ellipse cx="320" cy="252" rx="164" ry="74" fill="url(#bunTop)"/>
      <g fill="#fff1bd">${Array.from({ length: 12 }, (_, i) => `<ellipse cx="${230 + i * 16}" cy="${214 + (i % 2) * 10}" rx="5" ry="3"/>`).join("")}</g>
      <path d="M180 242c20-10 42-11 66-1 23 10 44 7 68-4 24-11 48-11 72 0 24 11 47 12 72 2" fill="none" stroke="#77b447" stroke-width="16" stroke-linecap="round"/>
      <rect x="182" y="250" width="276" height="18" rx="9" fill="#f4d458"/>
      <g fill="#f3a275">
        <ellipse cx="250" cy="276" rx="34" ry="22"/>
        <ellipse cx="320" cy="279" rx="34" ry="22"/>
        <ellipse cx="390" cy="276" rx="34" ry="22"/>
      </g>
      <path d="M214 274c18 11 36 14 72 14s56-3 72-14 36-12 72 0" fill="none" stroke="#f7cf87" stroke-width="12" stroke-linecap="round"/>
      <rect x="186" y="296" width="268" height="34" rx="16" fill="url(#bunBottom)"/>
    `,
    cheese: `
      <ellipse cx="320" cy="252" rx="160" ry="74" fill="url(#bunTop)"/>
      <path d="M180 236c30 12 64 18 102 16 38-2 70-10 104-14 28-4 56 1 74 8" fill="none" stroke="#77b447" stroke-width="16" stroke-linecap="round"/>
      <path d="M198 250h242l-20 26H214z" fill="#f3d34f"/>
      <path d="M174 270h292c-8 18-16 26-28 26H202c-14 0-20-8-28-26z" fill="url(#patty)"/>
      <path d="M205 240c15-12 34-15 58-10 24 5 36 5 58-4 22-9 46-10 72 6 18 12 34 14 50 8" fill="none" stroke="#b52d2d" stroke-width="10" stroke-linecap="round"/>
      <rect x="188" y="298" width="264" height="32" rx="15" fill="url(#bunBottom)"/>
    `,
    chicken: `
      <ellipse cx="320" cy="250" rx="160" ry="72" fill="url(#bunTop)"/>
      <path d="M182 236c28 12 58 14 96 10 38-4 74-14 112-10 28 3 48 10 70 18" fill="none" stroke="#77b447" stroke-width="15" stroke-linecap="round"/>
      <path d="M176 264c16-34 40-44 62-48 26-4 47 10 60 28 10 14 24 20 44 20 22 0 34-8 50-25 16-17 34-22 54-18 22 4 42 22 58 43-14 22-27 34-50 34H224c-22 0-35-9-48-34z" fill="#b66a1a"/>
      <g fill="#e0a34c">
        <circle cx="232" cy="242" r="8"/><circle cx="262" cy="266" r="9"/><circle cx="298" cy="250" r="8"/>
        <circle cx="340" cy="268" r="8"/><circle cx="380" cy="246" r="9"/><circle cx="414" cy="264" r="8"/>
      </g>
      <rect x="186" y="298" width="268" height="32" rx="15" fill="url(#bunBottom)"/>
    `,
    fries: `
      <path d="M208 156h34v112h-34zM248 144h34v124h-34zM288 132h34v136h-34zM328 138h34v130h-34zM368 148h34v120h-34zM408 160h34v108h-34z" fill="url(#fries)"/>
      <path d="M188 212h264l-26 116H214z" fill="#cf2e2e"/>
      <path d="M216 236h208l-18 70H234z" fill="#e74c3c" opacity=".78"/>
      <path d="M214 208h212" stroke="#f7d46b" stroke-width="10" stroke-linecap="round"/>
    `,
    cheesestick: `
      <rect x="180" y="250" width="82" height="24" rx="12" transform="rotate(-12 180 250)" fill="#e8af46"/>
      <rect x="256" y="232" width="88" height="26" rx="13" transform="rotate(8 256 232)" fill="#efbb54"/>
      <rect x="338" y="250" width="92" height="24" rx="12" transform="rotate(-8 338 250)" fill="#dfa23c"/>
      <path d="M258 252c24 10 36 28 54 40" fill="none" stroke="#ffd974" stroke-width="8" stroke-linecap="round"/>
      <path d="M310 246c18 18 24 30 38 48" fill="none" stroke="#ffd974" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="320" cy="322" rx="130" ry="18" fill="#d99c53" opacity=".18"/>
    `,
    nuggets: `
      <g fill="#c97a24">
        <ellipse cx="240" cy="250" rx="58" ry="44"/>
        <ellipse cx="320" cy="232" rx="58" ry="42"/>
        <ellipse cx="398" cy="252" rx="58" ry="44"/>
        <ellipse cx="302" cy="292" rx="58" ry="40"/>
      </g>
      <g fill="#e5a754">
        <circle cx="224" cy="238" r="8"/><circle cx="254" cy="266" r="8"/><circle cx="332" cy="220" r="8"/>
        <circle cx="380" cy="240" r="8"/><circle cx="314" cy="286" r="8"/>
      </g>
    `,
    soda: `
      <path d="M252 110h136l-16 222c-2 18-14 30-30 30h-44c-16 0-28-12-30-30z" fill="url(#cup)"/>
      <path d="M252 110h136l-10 62H262z" fill="#e8f2ff"/>
      <path d="M280 80h80l12 34H268z" fill="#d6292d"/>
      <path d="M314 58h12v66h-12z" fill="#f5c74e"/>
      <path d="M328 58c24-8 36-4 54 10" fill="none" stroke="#f5c74e" stroke-width="8" stroke-linecap="round"/>
      <path d="M270 182h100c18 0 34 14 34 30 0 22-18 54-18 54H286s-22-32-22-54c0-16 14-30 32-30z" fill="#d6292d"/>
      <path d="M274 186c14 22 44 36 82 36 20 0 38-4 52-12" fill="none" stroke="#f5c74e" stroke-width="9" stroke-linecap="round" opacity=".85"/>
    `,
    icecream: `
      <path d="M274 258h92l-26 94h-40z" fill="#d69a52"/>
      <circle cx="286" cy="206" r="38" fill="#fff4df"/>
      <circle cx="336" cy="206" r="38" fill="#fff1d0"/>
      <circle cx="312" cy="170" r="42" fill="#fff8ea"/>
      <path d="M278 208c10 8 18 10 30 10 16 0 24-4 34-12 8-6 18-8 30-4" fill="none" stroke="#f2d8b1" stroke-width="8" stroke-linecap="round"/>
    `,
    sundae: `
      <path d="M252 254h136l-18 70c-4 18-18 30-36 30h-28c-18 0-32-12-36-30z" fill="#ffffff"/>
      <circle cx="286" cy="206" r="40" fill="#fff7ea"/>
      <circle cx="336" cy="204" r="38" fill="#fff3de"/>
      <circle cx="314" cy="168" r="42" fill="#fffaf0"/>
      <path d="M250 210c18-18 36-26 60-26 28 0 48 12 72 32" fill="none" stroke="#d9394f" stroke-width="16" stroke-linecap="round"/>
      <circle cx="310" cy="150" r="12" fill="#d6292d"/>
      <path d="M312 138c10-16 20-22 30-24" fill="none" stroke="#4fa84f" stroke-width="4" stroke-linecap="round"/>
    `,
    churro: `
      <path d="M210 292c54-40 78-72 150-112 18-10 42-4 52 12 10 16 4 38-14 48-72 40-96 70-148 108z" fill="#c77a29"/>
      <path d="M256 284c44-30 74-54 124-84" fill="none" stroke="#e4b05c" stroke-width="14" stroke-linecap="round"/>
      <path d="M170 224c26-14 50-20 74-10l44 20-24 52-54-22c-24-10-28-26-40-40z" fill="#f4eadf"/>
      <path d="M178 230c24 6 40 12 72 26" fill="none" stroke="#d1c0aa" stroke-width="8" stroke-linecap="round"/>
    `,
  };

  return svgDataUri(shell.replace("{{CONTENT}}", map[kind] ?? map.bulgogi));
}

const menuItems: MenuItem[] = [
  {
    id: "rich-bulgogi",
    name: "리치 불고기버거",
    price: 5900,
    category: "burger",
    description: "달콤한 불고기 소스와 치즈가 어우러진 대표 버거",
    badge: "BEST",
    cardTags: ["추천", "세트 가능"],
    image: foodArt("bulgogi"),
    settable: true,
    featured: true,
  },
  {
    id: "crunch-shrimp",
    name: "크런치 새우버거",
    price: 6100,
    category: "burger",
    description: "탱글한 새우패티와 상큼한 소스의 조합",
    badge: "BEST",
    cardTags: ["인기"],
    image: foodArt("shrimp"),
    settable: true,
    featured: true,
  },
  {
    id: "double-cheese",
    name: "더블 치즈비프버거",
    price: 6900,
    category: "burger",
    description: "두 장의 비프패티와 진한 치즈의 풍미",
    badge: "NEW",
    cardTags: ["프리미엄"],
    image: foodArt("cheese"),
    settable: true,
  },
  {
    id: "crispy-chicken-burger",
    name: "핫크리스피 치킨버거",
    price: 6400,
    category: "burger",
    description: "매콤한 바삭 치킨과 상추 조합",
    cardTags: ["매콤"],
    image: foodArt("chicken"),
    settable: true,
  },
  {
    id: "crispy-chicken",
    name: "크리스피 치킨 2조각",
    price: 5200,
    category: "chicken",
    description: "겉은 바삭하고 속은 촉촉한 치킨",
    badge: "BEST",
    cardTags: ["사이드로 인기"],
    image: foodArt("nuggets"),
    settable: true,
    featured: true,
  },
  {
    id: "seasoned-potato",
    name: "시즈닝 포테이토",
    price: 3200,
    category: "side",
    description: "짭짤한 시즈닝이 더해진 두툼한 감자",
    cardTags: ["바삭"],
    image: foodArt("fries"),
  },
  {
    id: "cheese-stick",
    name: "치즈스틱",
    price: 2900,
    category: "side",
    description: "쭉 늘어나는 고소한 치즈 간식",
    cardTags: ["디저트 겸용"],
    image: foodArt("cheesestick"),
  },
  {
    id: "nugget-bites",
    name: "너겟 바이트",
    price: 3300,
    category: "side",
    description: "한 입 크기의 바삭한 치킨 바이트",
    image: foodArt("nuggets"),
  },
  {
    id: "cola",
    name: "콜라",
    price: 2100,
    category: "drink",
    description: "시원한 탄산 음료",
    image: foodArt("soda"),
  },
  {
    id: "cider",
    name: "사이다",
    price: 2100,
    category: "drink",
    description: "청량감 있는 탄산 음료",
    image: foodArt("soda"),
  },
  {
    id: "zero-cola",
    name: "제로콜라",
    price: 2300,
    category: "drink",
    description: "가볍게 즐기는 제로 탄산",
    badge: "NEW",
    image: foodArt("soda"),
  },
  {
    id: "soft-cone",
    name: "소프트콘",
    price: 900,
    category: "dessert",
    description: "부드럽고 달콤한 바닐라 콘",
    badge: "BEST",
    image: foodArt("icecream"),
    featured: true,
  },
  {
    id: "strawberry-sundae",
    name: "스트로베리 선데",
    price: 2600,
    category: "dessert",
    description: "딸기 시럽이 올라간 컵 아이스크림",
    image: foodArt("sundae"),
    featured: true,
  },
  {
    id: "mini-churro",
    name: "미니 츄러스",
    price: 2400,
    category: "dessert",
    description: "시나몬 슈가가 뿌려진 달콤한 스낵",
    image: foodArt("churro"),
  },
];

const categories: { id: Category; label: string; short: string }[] = [
  { id: "recommended", label: "추천", short: "추천" },
  { id: "burger", label: "버거", short: "버거" },
  { id: "chicken", label: "치킨", short: "치킨" },
  { id: "side", label: "사이드", short: "사이드" },
  { id: "drink", label: "음료", short: "음료" },
  { id: "dessert", label: "디저트", short: "디저트" },
];

function PracticeLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 rounded-full bg-white/18 backdrop-blur-sm ring-1 ring-white/35">
        <div className="absolute left-2 right-2 top-3 h-2 rounded-full bg-[#ffe16c]" />
        <div className="absolute left-3 right-3 top-[1.45rem] h-2 rounded-full bg-[#ff8a47]" />
        <div className="absolute left-2.5 right-2.5 top-[1.9rem] h-2 rounded-full bg-[#ffdd74]" />
      </div>
      <div>
        <p className="text-white/75" style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "0.16em" }}>
          FASTFOOD PRACTICE
        </p>
        <p className="text-white" style={{ fontSize: "27px", fontWeight: "900", letterSpacing: "0.04em" }}>
          LOTTERIA
        </p>
      </div>
    </div>
  );
}

function Header({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <div className="bg-[linear-gradient(135deg,#b71b1f_0%,#d6292d_58%,#ef7630_100%)] px-4 py-4 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm active:scale-95"
          >
            <ArrowLeft size={28} />
          </button>
        ) : (
          <div className="w-14" />
        )}
        <div className="flex-1">
          <p style={{ fontSize: "28px", fontWeight: "900" }}>{title}</p>
          {subtitle && <p className="text-white/80" style={{ fontSize: "16px" }}>{subtitle}</p>}
        </div>
        <PracticeLogo />
      </div>
    </div>
  );
}

export default function LotteriaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [orderType, setOrderType] = useState<OrderType>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("recommended");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionType>("single");
  const [selectedSide, setSelectedSide] = useState("");
  const [selectedDrink, setSelectedDrink] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cardPin, setCardPin] = useState("");
  const [orderNumber] = useState(() => Math.floor(Math.random() * 900) + 100);

  const filteredItems = useMemo(() => {
    if (activeCategory === "recommended") {
      return menuItems.filter((item) => item.featured);
    }
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.menu.price + OPTION_EXTRA[item.optionType]) * item.qty,
    0,
  );

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  function resetSelections() {
    setSelectedItem(null);
    setSelectedOption("single");
    setSelectedSide("");
    setSelectedDrink("");
  }

  function resetAll() {
    setStep("welcome");
    setOrderType(null);
    setActiveCategory("recommended");
    setCart([]);
    setCardPin("");
    resetSelections();
  }

  function openItem(item: MenuItem) {
    setSelectedItem(item);
    setSelectedOption(item.settable ? "set-regular" : "single");
    setSelectedSide("");
    setSelectedDrink("");
    setStep("item-detail");
  }

  function addToCartFromSelection() {
    if (!selectedItem) return;
    const nextItem: CartItem = {
      uid: `${selectedItem.id}-${Date.now()}`,
      menu: selectedItem,
      qty: 1,
      optionType: selectedOption,
      side: selectedOption === "single" ? undefined : selectedSide,
      drink: selectedOption === "single" ? undefined : selectedDrink,
    };
    setCart((prev) => [...prev, nextItem]);
    setStep("menu");
    resetSelections();
  }

  function addQuickItem(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find(
        (cartItem) =>
          cartItem.menu.id === item.id &&
          cartItem.optionType === "single" &&
          !cartItem.side &&
          !cartItem.drink,
      );
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.uid === existing.uid ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem,
        );
      }
      return [
        ...prev,
        {
          uid: `${item.id}-${Date.now()}`,
          menu: item,
          qty: 1,
          optionType: "single",
        },
      ];
    });
  }

  function changeQty(uid: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => (item.uid === uid ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    );
  }

  function getItemTotal(item: CartItem) {
    return (item.menu.price + OPTION_EXTRA[item.optionType]) * item.qty;
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff2dc_0%,#ffe7cf_34%,#f8dfd5_100%)]">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <button
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-md active:scale-95"
          >
            <ArrowLeft size={30} />
            <span style={{ fontSize: "24px", fontWeight: "700" }}>뒤로 가기</span>
          </button>

          <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_rgba(120,42,10,0.16)]">
            <div className="bg-[linear-gradient(140deg,#bb1d21_0%,#d6292d_58%,#ef7630_100%)] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <PracticeLogo />
                  <p className="mt-6 text-white/80" style={{ fontSize: "18px", fontWeight: "700" }}>
                    학습용 패스트푸드 키오스크
                  </p>
                  <h1 className="mt-2" style={{ fontSize: "48px", fontWeight: "900", lineHeight: 1.08 }}>
                    주문 방식을 선택하고
                    <br />
                    실제와 비슷한 흐름으로 연습해 보세요
                  </h1>
                  <p className="mt-4 max-w-xl text-white/85" style={{ fontSize: "18px", lineHeight: 1.6 }}>
                    공식 키오스크를 그대로 복제하지 않고, 패스트푸드점 주문 흐름을 쉽게 익히도록
                    재구성한 연습용 화면입니다.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <button
                    onClick={() => {
                      setOrderType("dine-in");
                      setStep("menu");
                    }}
                    className="min-h-[250px] rounded-[1.75rem] bg-white/95 p-8 text-left text-slate-900 shadow-xl transition-all active:scale-95"
                  >
                    <div className="mb-5 inline-flex rounded-2xl bg-red-50 p-4 text-red-600">
                      <Home size={44} />
                    </div>
                    <p style={{ fontSize: "34px", fontWeight: "900" }}>매장에서 먹기</p>
                    <p className="mt-3 text-slate-600" style={{ fontSize: "18px", lineHeight: 1.6 }}>
                      자리에서 식사할 때 선택합니다. 주문 번호가 호출되면 카운터에서 받으세요.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setOrderType("takeout");
                      setStep("menu");
                    }}
                    className="min-h-[250px] rounded-[1.75rem] bg-[#fff5d9] p-8 text-left text-slate-900 shadow-xl transition-all active:scale-95"
                  >
                    <div className="mb-5 inline-flex rounded-2xl bg-white p-4 text-[#d96a12]">
                      <Package size={44} />
                    </div>
                    <p style={{ fontSize: "34px", fontWeight: "900" }}>포장하기</p>
                    <p className="mt-3 text-slate-700" style={{ fontSize: "18px", lineHeight: 1.6 }}>
                      집이나 이동 중 먹을 음식일 때 선택합니다. 포장 완료 시 주문번호를 확인하세요.
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 bg-[#fffaf2] px-6 py-6 text-slate-700 sm:grid-cols-3 sm:px-10">
              {[
                "버거는 단품과 세트 중 선택",
                "세트는 사이드와 음료를 순서대로 선택",
                "디저트 메뉴도 장바구니에 함께 담기",
              ].map((tip) => (
                <div key={tip} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p style={{ fontSize: "18px", fontWeight: "700" }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "menu") {
    return (
      <div className="min-h-screen bg-[#f8f4ef]">
        <Header
          title="주문할 메뉴를 선택해 주세요"
          subtitle={orderType === "dine-in" ? "매장에서 먹기" : "포장 주문"}
          onBack={() => setStep("welcome")}
        />

        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 lg:px-6">
          <div className="rounded-[1.75rem] bg-[linear-gradient(120deg,#fff3d7_0%,#fff9ef_100%)] p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[#b24a16]" style={{ fontSize: "18px", fontWeight: "800" }}>
                  오늘의 추천
                </p>
                <p className="mt-1 text-slate-900" style={{ fontSize: "30px", fontWeight: "900" }}>
                  세트로 많이 찾는 메뉴를 먼저 보여드려요
                </p>
                <p className="mt-2 text-slate-600" style={{ fontSize: "16px" }}>
                  버거·치킨은 세트 구성이 가능하고, 디저트는 장바구니에 바로 담을 수 있어요.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#cf5f12] shadow-sm">
                <Sparkles size={18} />
                <span style={{ fontSize: "15px", fontWeight: "800" }}>학습용 키오스크 화면</span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div className="space-y-5">
              <div className="overflow-x-auto rounded-[1.5rem] bg-white p-2 shadow-sm">
                <div className="flex min-w-max gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`rounded-2xl px-5 py-4 transition-all ${
                        activeCategory === category.id
                          ? "bg-[linear-gradient(120deg,#c41e25_0%,#ef7630_100%)] text-white shadow-md"
                          : "bg-[#f5f1eb] text-slate-600"
                      }`}
                    >
                      <p style={{ fontSize: "19px", fontWeight: "900" }}>{category.short}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => {
                  const directAdd = !item.settable && item.category !== "burger" && item.category !== "chicken";
                  return (
                    <button
                      key={item.id}
                      onClick={() => (directAdd ? addQuickItem(item) : openItem(item))}
                      className="overflow-hidden rounded-[1.6rem] bg-white text-left shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                    >
                      <div className="relative bg-[linear-gradient(180deg,#fff7ea_0%,#ffeccd_100%)] p-4">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="h-[190px] w-full rounded-[1.25rem] object-cover"
                        />
                        <div className="absolute left-6 top-6 flex gap-2">
                          {item.badge && (
                            <span
                              className={`rounded-full px-3 py-1 text-white ${
                                item.badge === "BEST" ? "bg-[#d6292d]" : "bg-[#f28b2e]"
                              }`}
                              style={{ fontSize: "12px", fontWeight: "900" }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="flex flex-wrap gap-2">
                          {(item.cardTags ?? []).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#fff3d7] px-3 py-1 text-[#be5a11]"
                              style={{ fontSize: "12px", fontWeight: "800" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div>
                          <p className="text-slate-900" style={{ fontSize: "24px", fontWeight: "900", lineHeight: 1.2 }}>
                            {item.name}
                          </p>
                          <p className="mt-2 text-slate-600" style={{ fontSize: "15px", lineHeight: 1.6 }}>
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p style={{ color: BRAND_RED, fontSize: "26px", fontWeight: "900" }}>
                              {item.price.toLocaleString()}원
                            </p>
                            <p className="text-slate-400" style={{ fontSize: "13px", fontWeight: "700" }}>
                              {directAdd ? "누르면 바로 장바구니" : "상세 옵션 선택"}
                            </p>
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 text-center text-white ${
                              directAdd ? "bg-[#cf5f12]" : "bg-[#d6292d]"
                            }`}
                            style={{ fontSize: "15px", fontWeight: "900" }}
                          >
                            {directAdd ? "바로 담기" : "선택하기"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[1.75rem] bg-white p-5 shadow-sm">
              <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,#cf2228_0%,#ef7630_100%)] p-5 text-white">
                <p style={{ fontSize: "17px", fontWeight: "800" }}>현재 주문</p>
                <p className="mt-2" style={{ fontSize: "34px", fontWeight: "900" }}>
                  {totalCount}개
                </p>
                <p className="mt-1 text-white/85" style={{ fontSize: "16px" }}>
                  {totalPrice.toLocaleString()}원
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8f4ef] p-5 text-center text-slate-500">
                    <ShoppingCart className="mx-auto mb-3" size={32} />
                    <p style={{ fontSize: "17px", fontWeight: "700" }}>장바구니가 비어 있어요</p>
                    <p className="mt-1" style={{ fontSize: "14px" }}>
                      메뉴를 선택하면 이곳에 표시됩니다.
                    </p>
                  </div>
                ) : (
                  cart.slice(0, 4).map((item) => (
                    <div key={item.uid} className="rounded-2xl bg-[#f8f4ef] p-4">
                      <p className="text-slate-900" style={{ fontSize: "17px", fontWeight: "800" }}>
                        {item.menu.name}
                      </p>
                      <p className="mt-1 text-slate-500" style={{ fontSize: "13px" }}>
                        {OPTION_LABEL[item.optionType]}
                        {item.side ? ` · ${item.side}` : ""}
                        {item.drink ? ` · ${item.drink}` : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setStep("cart")}
                disabled={cart.length === 0}
                className="mt-5 w-full rounded-2xl bg-[#d6292d] py-5 text-white disabled:bg-slate-300"
                style={{ fontSize: "21px", fontWeight: "900" }}
              >
                장바구니 보기
              </button>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (step === "item-detail" && selectedItem) {
    const optionCards: { id: OptionType; title: string; desc: string }[] = [
      { id: "single", title: "단품", desc: "메뉴만 주문" },
      { id: "set-regular", title: "레귤러 세트", desc: "사이드 + 음료 포함" },
      { id: "set-large", title: "라지 세트", desc: "업그레이드 사이드 + 큰 음료" },
    ];

    return (
      <div className="min-h-screen bg-[#f8f4ef]">
        <Header
          title={selectedItem.name}
          subtitle="메뉴 상세와 구성 선택"
          onBack={() => {
            setStep("menu");
            resetSelections();
          }}
        />

        <div className="mx-auto max-w-5xl px-4 py-5 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.8rem] bg-white p-5 shadow-sm">
              <ImageWithFallback
                src={selectedItem.image}
                alt={selectedItem.name}
                className="h-[320px] w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <div className="rounded-[1.8rem] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                {selectedItem.badge && (
                  <span
                    className={`rounded-full px-3 py-1 text-white ${
                      selectedItem.badge === "BEST" ? "bg-[#d6292d]" : "bg-[#f28b2e]"
                    }`}
                    style={{ fontSize: "12px", fontWeight: "900" }}
                  >
                    {selectedItem.badge}
                  </span>
                )}
                <span className="rounded-full bg-[#fff3d7] px-3 py-1 text-[#be5a11]" style={{ fontSize: "12px", fontWeight: "800" }}>
                  연습용 메뉴
                </span>
              </div>

              <p className="mt-4 text-slate-900" style={{ fontSize: "34px", fontWeight: "900", lineHeight: 1.15 }}>
                {selectedItem.name}
              </p>
              <p className="mt-3 text-slate-600" style={{ fontSize: "17px", lineHeight: 1.7 }}>
                {selectedItem.description}
              </p>
              <p className="mt-4" style={{ color: BRAND_RED, fontSize: "34px", fontWeight: "900" }}>
                {selectedItem.price.toLocaleString()}원부터
              </p>

              {selectedItem.settable ? (
                <div className="mt-6 space-y-3">
                  <p className="text-slate-900" style={{ fontSize: "21px", fontWeight: "900" }}>
                    구성 선택
                  </p>
                  {optionCards.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={`flex w-full items-center justify-between rounded-[1.25rem] border-2 px-5 py-5 text-left transition-all ${
                        selectedOption === option.id
                          ? "border-[#d6292d] bg-[#fff4f4]"
                          : "border-[#ece5da] bg-[#fcfaf7]"
                      }`}
                    >
                      <div>
                        <p className="text-slate-900" style={{ fontSize: "21px", fontWeight: "900" }}>
                          {option.title}
                        </p>
                        <p className="mt-1 text-slate-500" style={{ fontSize: "15px" }}>
                          {option.desc}
                        </p>
                      </div>
                      <p style={{ color: BRAND_RED, fontSize: "22px", fontWeight: "900" }}>
                        {(selectedItem.price + OPTION_EXTRA[option.id]).toLocaleString()}원
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.25rem] bg-[#f8f4ef] p-5 text-slate-600">
                  <p style={{ fontSize: "17px", fontWeight: "700" }}>
                    이 메뉴는 단품으로만 바로 주문됩니다.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  if (!selectedItem.settable || selectedOption === "single") {
                    addToCartFromSelection();
                    return;
                  }
                  setStep("set-side");
                }}
                className="mt-6 w-full rounded-2xl bg-[#d6292d] py-5 text-white"
                style={{ fontSize: "22px", fontWeight: "900" }}
              >
                {selectedItem.settable && selectedOption !== "single" ? "다음: 사이드 선택" : "장바구니에 담기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "set-side" && selectedItem) {
    return (
      <div className="min-h-screen bg-[#f8f4ef]">
        <Header
          title="세트 사이드 선택"
          subtitle={`${selectedItem.name} · ${OPTION_LABEL[selectedOption]}`}
          onBack={() => setStep("item-detail")}
        />

        <div className="mx-auto max-w-4xl px-4 py-5 lg:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SIDE_OPTIONS.map((side) => (
              <button
                key={side.name}
                onClick={() => setSelectedSide(side.name)}
                className={`rounded-[1.5rem] border-2 p-5 text-left shadow-sm transition-all ${
                  selectedSide === side.name
                    ? "border-[#d6292d] bg-[#fff4f4]"
                    : "border-transparent bg-white"
                }`}
              >
                <ImageWithFallback
                  src={side.name.includes("치즈") ? foodArt("cheesestick") : foodArt("fries")}
                  alt={side.name}
                  className="h-[160px] w-full rounded-[1.1rem] object-cover"
                />
                <p className="mt-4 text-slate-900" style={{ fontSize: "24px", fontWeight: "900" }}>
                  {side.name}
                </p>
                <p className="mt-2 text-slate-500" style={{ fontSize: "15px" }}>
                  {side.note}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep("set-drink")}
            disabled={!selectedSide}
            className="mt-5 w-full rounded-2xl bg-[#d6292d] py-5 text-white disabled:bg-slate-300"
            style={{ fontSize: "22px", fontWeight: "900" }}
          >
            다음: 음료 선택
          </button>
        </div>
      </div>
    );
  }

  if (step === "set-drink" && selectedItem) {
    return (
      <div className="min-h-screen bg-[#f8f4ef]">
        <Header
          title="세트 음료 선택"
          subtitle={`${selectedItem.name} · ${selectedSide} 선택 완료`}
          onBack={() => setStep("set-side")}
        />

        <div className="mx-auto max-w-4xl px-4 py-5 lg:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DRINK_OPTIONS.map((drink) => (
              <button
                key={drink.name}
                onClick={() => setSelectedDrink(drink.name)}
                className={`rounded-[1.5rem] border-2 p-5 text-center shadow-sm transition-all ${
                  selectedDrink === drink.name
                    ? "border-[#d6292d] bg-[#fff4f4]"
                    : "border-transparent bg-white"
                }`}
              >
                <ImageWithFallback
                  src={foodArt("soda")}
                  alt={drink.name}
                  className="mx-auto h-[150px] w-full rounded-[1.1rem] object-cover"
                />
                <p className="mt-4 text-slate-900" style={{ fontSize: "22px", fontWeight: "900" }}>
                  {drink.name}
                </p>
                <p className="mt-2 text-slate-500" style={{ fontSize: "14px" }}>
                  {drink.note}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={addToCartFromSelection}
            disabled={!selectedDrink}
            className="mt-5 w-full rounded-2xl bg-[#d6292d] py-5 text-white disabled:bg-slate-300"
            style={{ fontSize: "22px", fontWeight: "900" }}
          >
            장바구니에 담기
          </button>
        </div>
      </div>
    );
  }

  if (step === "cart") {
    return (
      <div className="min-h-screen bg-[#f8f4ef]">
        <Header
          title="장바구니 확인"
          subtitle="메뉴 수량과 구성을 확인해 주세요"
          onBack={() => setStep("menu")}
        />

        <div className="mx-auto max-w-5xl px-4 py-5 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="rounded-[1.75rem] bg-white p-10 text-center shadow-sm">
                  <ShoppingCart className="mx-auto mb-4 text-slate-300" size={42} />
                  <p className="text-slate-600" style={{ fontSize: "24px", fontWeight: "800" }}>
                    장바구니가 비어 있습니다
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.uid} className="rounded-[1.6rem] bg-white p-4 shadow-sm">
                    <div className="flex gap-4">
                      <ImageWithFallback
                        src={item.menu.image}
                        alt={item.menu.name}
                        className="h-28 w-28 rounded-[1rem] object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-slate-900" style={{ fontSize: "22px", fontWeight: "900" }}>
                              {item.menu.name}
                            </p>
                            <p className="mt-1 text-slate-500" style={{ fontSize: "15px" }}>
                              {OPTION_LABEL[item.optionType]}
                              {item.side ? ` · ${item.side}` : ""}
                              {item.drink ? ` · ${item.drink}` : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => setCart((prev) => prev.filter((cartItem) => cartItem.uid !== item.uid))}
                            className="rounded-xl bg-[#fff1f1] p-3 text-[#d6292d] active:scale-95"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-full bg-[#f8f4ef] px-3 py-2">
                            <button
                              onClick={() => changeQty(item.uid, -1)}
                              className="h-10 w-10 rounded-full bg-white text-slate-700 shadow-sm"
                              style={{ fontSize: "20px", fontWeight: "900" }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: "20px", fontWeight: "900" }}>{item.qty}</span>
                            <button
                              onClick={() => changeQty(item.uid, 1)}
                              className="h-10 w-10 rounded-full bg-[#d6292d] text-white shadow-sm"
                              style={{ fontSize: "20px", fontWeight: "900" }}
                            >
                              +
                            </button>
                          </div>
                          <p style={{ color: BRAND_RED, fontSize: "25px", fontWeight: "900" }}>
                            {getItemTotal(item).toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <aside className="rounded-[1.75rem] bg-white p-5 shadow-sm">
              <p className="text-slate-900" style={{ fontSize: "26px", fontWeight: "900" }}>
                결제 예정 금액
              </p>
              <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(160deg,#fff3d7_0%,#fff9ef_100%)] p-5">
                <div className="flex items-center justify-between text-slate-600">
                  <span style={{ fontSize: "18px", fontWeight: "700" }}>총 수량</span>
                  <span style={{ fontSize: "18px", fontWeight: "800" }}>{totalCount}개</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-slate-900">
                  <span style={{ fontSize: "21px", fontWeight: "800" }}>총 결제 금액</span>
                  <span style={{ color: BRAND_RED, fontSize: "30px", fontWeight: "900" }}>
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() => setStep("payment")}
                  disabled={cart.length === 0}
                  className="w-full rounded-2xl bg-[#d6292d] py-5 text-white disabled:bg-slate-300"
                  style={{ fontSize: "22px", fontWeight: "900" }}
                >
                  결제하기
                </button>
                <button
                  onClick={() => setStep("menu")}
                  className="w-full rounded-2xl bg-[#f8f4ef] py-5 text-slate-700"
                  style={{ fontSize: "19px", fontWeight: "800" }}
                >
                  메뉴 더 담기
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-[#f8f4ef]">
        <Header
          title="결제 수단 선택"
          subtitle="카드 결제 흐름을 실제처럼 연습할 수 있어요"
          onBack={() => setStep("cart")}
        />

        <div className="mx-auto max-w-4xl px-4 py-5 lg:px-6">
          <div className="rounded-[1.8rem] bg-white p-6 shadow-sm">
            <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,#fff3d7_0%,#fff9ef_100%)] p-5">
              <p className="text-slate-600" style={{ fontSize: "18px", fontWeight: "700" }}>총 결제 금액</p>
              <p className="mt-2" style={{ color: BRAND_RED, fontSize: "36px", fontWeight: "900" }}>
                {totalPrice.toLocaleString()}원
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setStep("card-pin")}
                className="rounded-[1.75rem] bg-[linear-gradient(135deg,#154a96_0%,#2a7bd6_100%)] p-8 text-left text-white shadow-lg"
              >
                <CreditCard size={48} />
                <p className="mt-5" style={{ fontSize: "30px", fontWeight: "900" }}>카드 결제</p>
                <p className="mt-2 text-white/80" style={{ fontSize: "16px", lineHeight: 1.6 }}>
                  카드 삽입 후 비밀번호를 입력하는 순서를 연습합니다.
                </p>
              </button>

              <button
                onClick={() => setStep("complete")}
                className="rounded-[1.75rem] bg-[linear-gradient(135deg,#ebefe8_0%,#ffffff_100%)] p-8 text-left text-slate-900 shadow-lg ring-1 ring-black/5"
              >
                <UtensilsCrossed size={48} className="text-[#cf5f12]" />
                <p className="mt-5" style={{ fontSize: "30px", fontWeight: "900" }}>현장 결제</p>
                <p className="mt-2 text-slate-600" style={{ fontSize: "16px", lineHeight: 1.6 }}>
                  직원에게 직접 결제하는 상황을 가정하고 주문 완료 화면으로 이동합니다.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "card-pin") {
    return (
      <div className="min-h-screen bg-[#f8f4ef]">
        <Header
          title="카드 비밀번호 입력"
          subtitle="연습용이므로 어떤 숫자를 입력해도 다음으로 진행됩니다"
          onBack={() => setStep("payment")}
        />

        <div className="mx-auto max-w-3xl px-4 py-5 lg:px-6">
          <div className="rounded-[1.9rem] bg-white p-6 shadow-sm">
            <div className="rounded-[1.5rem] bg-[#f4f8ff] p-6 text-center">
              <CreditCard className="mx-auto text-[#2265c7]" size={56} />
              <p className="mt-4 text-slate-900" style={{ fontSize: "28px", fontWeight: "900" }}>
                카드를 단말기에 넣은 뒤 비밀번호를 입력해 주세요
              </p>
              <p className="mt-3 text-slate-600" style={{ fontSize: "17px", lineHeight: 1.6 }}>
                실제 키오스크와 비슷하게 카드 결제 흐름을 연습하기 위한 단계입니다.
              </p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#b9cdee] p-6">
              <label className="block text-slate-700" style={{ fontSize: "20px", fontWeight: "800" }}>
                비밀번호 4자리
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={cardPin}
                onChange={(e) => setCardPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="mt-4 w-full rounded-2xl border-2 border-[#c4d7f3] px-5 py-5 text-center tracking-[0.45em]"
                style={{ fontSize: "30px", fontWeight: "900" }}
                placeholder="0000"
              />
              <p className="mt-3 text-slate-500" style={{ fontSize: "15px" }}>
                입력값 검사는 하지 않으며, 아무 숫자나 넣어도 주문이 완료됩니다.
              </p>
            </div>

            <button
              onClick={() => setStep("complete")}
              className="mt-6 w-full rounded-2xl bg-[#d6292d] py-5 text-white"
              style={{ fontSize: "22px", fontWeight: "900" }}
            >
              결제 승인 완료
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe7d8_0%,#ffeede_36%,#fff7ef_100%)]">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <div className="rounded-[2rem] bg-white shadow-[0_20px_55px_rgba(122,47,14,0.18)]">
            <div className="bg-[linear-gradient(135deg,#be1d22_0%,#d6292d_58%,#ef7630_100%)] px-8 py-8 text-white">
              <PracticeLogo />
            </div>

            <div className="p-8 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#fff0d9] shadow-inner">
                <Check size={64} className="text-[#d6292d]" strokeWidth={3} />
              </div>

              <p className="mt-6 text-slate-900" style={{ fontSize: "36px", fontWeight: "900" }}>
                주문이 완료되었습니다
              </p>
              <p className="mt-3 text-slate-600" style={{ fontSize: "19px", lineHeight: 1.6 }}>
                {orderType === "dine-in"
                  ? "주문 번호가 호출되면 카운터에서 받아가세요."
                  : "포장 준비가 끝나면 주문 번호로 안내됩니다."}
              </p>

              <div className="mx-auto mt-8 max-w-md rounded-[1.8rem] bg-[#fff8ef] p-7">
                <p className="text-slate-500" style={{ fontSize: "18px", fontWeight: "800" }}>주문 번호</p>
                <p className="mt-2" style={{ color: BRAND_RED, fontSize: "78px", fontWeight: "900", lineHeight: 1 }}>
                  {orderNumber}
                </p>
                <p className="mt-4 text-slate-600" style={{ fontSize: "16px" }}>
                  총 {totalCount}개 메뉴 · {totalPrice.toLocaleString()}원
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-md rounded-[1.5rem] border border-dashed border-[#f0c88e] p-5 text-left">
                {cart.map((item) => (
                  <div key={item.uid} className="flex justify-between py-2 text-slate-700">
                    <span style={{ fontSize: "16px" }}>
                      {item.menu.name} x {item.qty}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "800" }}>
                      {getItemTotal(item).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-8 grid max-w-md gap-3">
                <button
                  onClick={resetAll}
                  className="rounded-2xl bg-[#d6292d] py-5 text-white"
                  style={{ fontSize: "22px", fontWeight: "900" }}
                >
                  다시 주문하기
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="rounded-2xl bg-[#f8f4ef] py-5 text-slate-700"
                  style={{ fontSize: "20px", fontWeight: "800" }}
                >
                  홈으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

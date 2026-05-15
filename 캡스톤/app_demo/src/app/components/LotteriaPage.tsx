import { useNavigate } from "react-router";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";

type OrderType = "dine-in" | "takeout" | null;
type Category = "burger" | "side" | "drink" | "dessert";
type SetType = "single" | "set-m" | "set-l";
type Step =
  | "welcome"
  | "menu"
  | "item-option"
  | "set-drink"
  | "set-side"
  | "cart"
  | "payment"
  | "complete";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  emoji: string;
  popular?: boolean;
  isNew?: boolean;
}

interface CartItem {
  uid: string;
  menu: MenuItem;
  setType: SetType;
  quantity: number;
  drink?: string;
  side?: string;
}

const menuItems: MenuItem[] = [
  { id: "bulgogi", name: "불고기버거", price: 3500, category: "burger", emoji: "🍔", popular: true },
  { id: "shrimp", name: "새우버거", price: 4200, category: "burger", emoji: "🍤", popular: true },
  { id: "hanwoo", name: "한우불고기버거", price: 5500, category: "burger", emoji: "🐄", isNew: true },
  { id: "cheese", name: "리아치즈버거", price: 3800, category: "burger", emoji: "🧀" },
  { id: "deri", name: "데리버거", price: 3500, category: "burger", emoji: "🍔" },
  { id: "crispy", name: "크리스피버거", price: 4000, category: "burger", emoji: "🍗" },
  { id: "bacon", name: "베이컨토마토버거", price: 4500, category: "burger", emoji: "🥓" },
  { id: "double", name: "더블치즈버거", price: 4800, category: "burger", emoji: "🍔" },
  { id: "fries-m", name: "감자튀김(M)", price: 2200, category: "side", emoji: "🍟" },
  { id: "fries-l", name: "감자튀김(L)", price: 2700, category: "side", emoji: "🍟" },
  { id: "onion", name: "오니언링", price: 2500, category: "side", emoji: "🧅" },
  { id: "cstick", name: "치즈스틱", price: 2800, category: "side", emoji: "🧀" },
  { id: "slaw", name: "코울슬로", price: 1500, category: "side", emoji: "🥗" },
  { id: "cola-m", name: "콜라(M)", price: 1800, category: "drink", emoji: "🥤" },
  { id: "cola-l", name: "콜라(L)", price: 2200, category: "drink", emoji: "🥤" },
  { id: "cider", name: "사이다(M)", price: 1800, category: "drink", emoji: "🥤" },
  { id: "oj", name: "오렌지주스", price: 2200, category: "drink", emoji: "🍊" },
  { id: "icetea", name: "아이스티", price: 2000, category: "drink", emoji: "🫖" },
  { id: "cone", name: "소프트콘", price: 500, category: "dessert", emoji: "🍦" },
  { id: "sundae", name: "딸기선데", price: 1500, category: "dessert", emoji: "🍓" },
];

const SET_EXTRA: Record<SetType, number> = { single: 0, "set-m": 2800, "set-l": 3300 };
const SET_DRINKS = ["콜라", "사이다", "오렌지주스", "아이스티"];
const SET_SIDES = ["감자튀김", "오니언링", "코울슬로"];
const SIDE_EMOJI: Record<string, string> = { 감자튀김: "🍟", 오니언링: "🧅", 코울슬로: "🥗" };
const SET_LABEL: Record<SetType, string> = { single: "단품", "set-m": "M세트", "set-l": "L세트" };

function LotteriaHeader({ onBack, title }: { onBack?: () => void; title?: string }) {
  return (
    <div className="bg-red-600 px-4 py-3 flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="text-white">
          <ArrowLeft size={28} />
        </button>
      )}
      <span
        className="text-white font-black flex-1 text-center"
        style={{ fontSize: "28px", letterSpacing: "0.12em" }}
      >
        {title ?? "LOTTERIA"}
      </span>
      {onBack && <div style={{ width: 28 }} />}
    </div>
  );
}

export default function LotteriaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [orderType, setOrderType] = useState<OrderType>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("burger");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSetType, setSelectedSetType] = useState<SetType>("single");
  const [selectedDrink, setSelectedDrink] = useState("");
  const [selectedSide, setSelectedSide] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNum] = useState(() => Math.floor(Math.random() * 900) + 100);

  const reset = () => {
    setStep("welcome");
    setOrderType(null);
    setActiveCategory("burger");
    setSelectedItem(null);
    setSelectedSetType("single");
    setSelectedDrink("");
    setSelectedSide("");
    setCart([]);
  };

  const addSingleToCart = (menu: MenuItem) => {
    setCart((prev) => [...prev, { uid: `${menu.id}-${Date.now()}`, menu, setType: "single", quantity: 1 }]);
  };

  const addSetToCart = () => {
    if (!selectedItem) return;
    setCart((prev) => [
      ...prev,
      {
        uid: `${selectedItem.id}-${Date.now()}`,
        menu: selectedItem,
        setType: selectedSetType,
        quantity: 1,
        drink: selectedDrink,
        side: selectedSide,
      },
    ]);
    setStep("menu");
    setSelectedItem(null);
    setSelectedSetType("single");
    setSelectedDrink("");
    setSelectedSide("");
  };

  const removeFromCart = (uid: string) => setCart((prev) => prev.filter((i) => i.uid !== uid));

  const getItemPrice = (item: CartItem) => (item.menu.price + SET_EXTRA[item.setType]) * item.quantity;

  const totalPrice = cart.reduce((sum, item) => sum + getItemPrice(item), 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories: { id: Category; label: string; emoji: string }[] = [
    { id: "burger", label: "버거", emoji: "🍔" },
    { id: "side", label: "사이드", emoji: "🍟" },
    { id: "drink", label: "음료", emoji: "🥤" },
    { id: "dessert", label: "디저트", emoji: "🍦" },
  ];

  // ── WELCOME ──────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-svh bg-red-600 flex flex-col">
        <div className="bg-red-700 px-4 py-4 flex items-center">
          <button onClick={() => navigate("/")} className="text-white">
            <ArrowLeft size={30} />
          </button>
          <span
            className="text-white font-black flex-1 text-center"
            style={{ fontSize: "34px", letterSpacing: "0.12em" }}
          >
            LOTTERIA
          </span>
          <div style={{ width: 30 }} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-10 p-8">
          <div className="text-center">
            <p className="text-red-200 mb-2" style={{ fontSize: "22px" }}>
              어서오세요!
            </p>
            <p className="text-white" style={{ fontSize: "34px", fontWeight: "700" }}>
              주문 방식을 선택하세요
            </p>
          </div>

          <div className="w-full max-w-sm space-y-5">
            <button
              onClick={() => {
                setOrderType("dine-in");
                setStep("menu");
              }}
              className="w-full bg-white text-red-600 rounded-3xl py-10 flex flex-col items-center gap-4 shadow-2xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "64px" }}>🏠</span>
              <span style={{ fontSize: "30px", fontWeight: "700" }}>매장에서 먹기</span>
            </button>

            <button
              onClick={() => {
                setOrderType("takeout");
                setStep("menu");
              }}
              className="w-full bg-yellow-400 text-red-700 rounded-3xl py-10 flex flex-col items-center gap-4 shadow-2xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "64px" }}>🛍️</span>
              <span style={{ fontSize: "30px", fontWeight: "700" }}>포장하기</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MENU ─────────────────────────────────────────────────
  if (step === "menu") {
    const filtered = menuItems.filter((m) => m.category === activeCategory);

    return (
      <div className="min-h-svh flex flex-col bg-gray-100">
        <LotteriaHeader
          onBack={() => setStep("welcome")}
          title={`LOTTERIA · ${orderType === "dine-in" ? "🏠 매장" : "🛍️ 포장"}`}
        />

        {/* Category tabs */}
        <div className="bg-white border-b-2 border-gray-200 flex">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 border-b-4 transition-all ${
                activeCategory === cat.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span style={{ fontSize: "22px" }}>{cat.emoji}</span>
              <span style={{ fontSize: "15px", fontWeight: activeCategory === cat.id ? "700" : "500" }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-4 pb-36">
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                  if (menu.category === "burger") {
                    setSelectedItem(menu);
                    setStep("item-option");
                  } else {
                    addSingleToCart(menu);
                  }
                }}
                className="bg-white rounded-2xl shadow-md overflow-hidden active:scale-95 transition-all border-2 border-transparent hover:border-red-300 text-left"
              >
                <div className="bg-orange-50 py-6 flex items-center justify-center">
                  <span style={{ fontSize: "54px" }}>{menu.emoji}</span>
                </div>
                <div className="p-3">
                  <div className="flex gap-1 mb-1 min-h-[22px]">
                    {menu.popular && (
                      <span
                        className="bg-red-600 text-white rounded px-2 py-0.5"
                        style={{ fontSize: "12px", fontWeight: "700" }}
                      >
                        인기
                      </span>
                    )}
                    {menu.isNew && (
                      <span
                        className="bg-orange-400 text-white rounded px-2 py-0.5"
                        style={{ fontSize: "12px", fontWeight: "700" }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800" style={{ fontSize: "17px", fontWeight: "600" }}>
                    {menu.name}
                  </p>
                  <p className="text-red-600 mt-1" style={{ fontSize: "19px", fontWeight: "700" }}>
                    {menu.price.toLocaleString()}원
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 shadow-2xl">
          {cart.length > 0 ? (
            <div className="bg-red-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 rounded-full w-9 h-9 flex items-center justify-center">
                  <span className="text-red-700 font-black" style={{ fontSize: "16px" }}>
                    {totalCount}
                  </span>
                </div>
                <span className="text-white font-bold" style={{ fontSize: "18px" }}>
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
              <button
                onClick={() => setStep("cart")}
                className="bg-yellow-400 text-red-700 font-black px-6 py-3 rounded-xl active:scale-95 transition-all"
                style={{ fontSize: "20px" }}
              >
                주문하기 →
              </button>
            </div>
          ) : (
            <div className="bg-gray-200 px-5 py-4 text-center">
              <p className="text-gray-500" style={{ fontSize: "17px" }}>
                메뉴를 선택해 장바구니에 담아보세요
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ITEM OPTION (단품/세트) ──────────────────────────────
  if (step === "item-option" && selectedItem) {
    const options: { type: SetType; label: string; desc: string }[] = [
      { type: "single", label: "단품", desc: "버거만" },
      { type: "set-m", label: "M 세트", desc: "버거 + 감자튀김(M) + 음료(M)" },
      { type: "set-l", label: "L 세트", desc: "버거 + 감자튀김(L) + 음료(L)" },
    ];

    return (
      <div className="min-h-svh flex flex-col bg-gray-100">
        <LotteriaHeader onBack={() => { setStep("menu"); setSelectedItem(null); }} />

        <div className="flex-1 flex flex-col p-5 gap-5">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-md">
            <span style={{ fontSize: "68px" }}>{selectedItem.emoji}</span>
            <div>
              <p className="text-gray-800" style={{ fontSize: "24px", fontWeight: "700" }}>
                {selectedItem.name}
              </p>
              <p className="text-red-600 mt-1" style={{ fontSize: "20px", fontWeight: "700" }}>
                {selectedItem.price.toLocaleString()}원~
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-center font-semibold" style={{ fontSize: "20px" }}>
            주문 방식을 선택하세요
          </p>

          <div className="space-y-4">
            {options.map(({ type, label, desc }) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedSetType(type);
                  if (type === "single") {
                    addSingleToCart(selectedItem);
                    setStep("menu");
                    setSelectedItem(null);
                  } else {
                    setStep("set-drink");
                  }
                }}
                className="w-full bg-white rounded-2xl p-6 flex items-center justify-between shadow-md active:scale-95 transition-all border-4 border-transparent hover:border-red-300"
              >
                <div className="text-left">
                  <p className="text-gray-800" style={{ fontSize: "22px", fontWeight: "700" }}>
                    {label}
                  </p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: "16px" }}>
                    {desc}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-red-600" style={{ fontSize: "22px", fontWeight: "700" }}>
                    {(selectedItem.price + SET_EXTRA[type]).toLocaleString()}원
                  </p>
                  {SET_EXTRA[type] > 0 && (
                    <p className="text-gray-400" style={{ fontSize: "14px" }}>
                      +{SET_EXTRA[type].toLocaleString()}원
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── SET: DRINK ────────────────────────────────────────────
  if (step === "set-drink" && selectedItem) {
    const size = selectedSetType === "set-m" ? "(M)" : "(L)";
    return (
      <div className="min-h-svh flex flex-col bg-gray-100">
        <LotteriaHeader onBack={() => setStep("item-option")} />

        <div className="flex-1 flex flex-col p-5 gap-5">
          <div className="text-center">
            <p className="text-gray-500 mb-1" style={{ fontSize: "17px" }}>
              {SET_LABEL[selectedSetType]} · {selectedItem.name}
            </p>
            <h2 className="text-gray-800" style={{ fontSize: "28px", fontWeight: "700" }}>
              음료를 선택하세요
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {SET_DRINKS.map((drink) => (
              <button
                key={drink}
                onClick={() => setSelectedDrink(drink)}
                className={`bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-md active:scale-95 transition-all border-4 ${
                  selectedDrink === drink ? "border-red-600 bg-red-50" : "border-transparent hover:border-red-200"
                }`}
              >
                <span style={{ fontSize: "46px" }}>🥤</span>
                <span className="text-gray-800 font-semibold" style={{ fontSize: "19px" }}>
                  {drink}
                  {size}
                </span>
                {selectedDrink === drink && <Check size={24} className="text-red-600" strokeWidth={3} />}
              </button>
            ))}
          </div>

          {selectedDrink && (
            <button
              onClick={() => setStep("set-side")}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-6 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>다음: 사이드 선택 →</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── SET: SIDE ─────────────────────────────────────────────
  if (step === "set-side" && selectedItem) {
    const size = selectedSetType === "set-m" ? "(M)" : "(L)";
    return (
      <div className="min-h-svh flex flex-col bg-gray-100">
        <LotteriaHeader onBack={() => setStep("set-drink")} />

        <div className="flex-1 flex flex-col p-5 gap-5">
          <div className="text-center">
            <p className="text-gray-500 mb-1" style={{ fontSize: "17px" }}>
              {SET_LABEL[selectedSetType]} · 음료: {selectedDrink}
              {size}
            </p>
            <h2 className="text-gray-800" style={{ fontSize: "28px", fontWeight: "700" }}>
              사이드를 선택하세요
            </h2>
          </div>

          <div className="space-y-4">
            {SET_SIDES.map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side)}
                className={`w-full bg-white rounded-2xl p-6 flex items-center gap-5 shadow-md active:scale-95 transition-all border-4 ${
                  selectedSide === side ? "border-red-600 bg-red-50" : "border-transparent hover:border-red-200"
                }`}
              >
                <span style={{ fontSize: "46px" }}>{SIDE_EMOJI[side]}</span>
                <span className="text-gray-800 font-semibold flex-1 text-left" style={{ fontSize: "21px" }}>
                  {side}
                  {size}
                </span>
                {selectedSide === side && <Check size={28} className="text-red-600" strokeWidth={3} />}
              </button>
            ))}
          </div>

          {selectedSide && (
            <button
              onClick={addSetToCart}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-6 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>장바구니에 담기 🛒</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── CART ─────────────────────────────────────────────────
  if (step === "cart") {
    return (
      <div className="min-h-svh flex flex-col bg-gray-100">
        <LotteriaHeader onBack={() => setStep("menu")} title="주문 내역" />

        <div className="flex-1 overflow-y-auto p-4 pb-44 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400" style={{ fontSize: "22px" }}>
                장바구니가 비어있습니다
              </p>
              <button
                onClick={() => setStep("menu")}
                className="mt-6 bg-red-600 text-white px-8 py-4 rounded-xl active:scale-95 transition-all"
              >
                <span style={{ fontSize: "20px", fontWeight: "600" }}>메뉴 선택하러 가기</span>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.uid} className="bg-white rounded-2xl p-5 shadow-md">
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: "42px" }}>{item.menu.emoji}</span>
                  <div className="flex-1">
                    <p className="text-gray-800" style={{ fontSize: "19px", fontWeight: "700" }}>
                      {item.menu.name}
                    </p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: "15px" }}>
                      {SET_LABEL[item.setType]}
                      {item.drink && ` · ${item.drink}`}
                      {item.side && ` · ${item.side}`}
                    </p>
                    <p className="text-red-600 mt-1" style={{ fontSize: "19px", fontWeight: "700" }}>
                      {getItemPrice(item).toLocaleString()}원
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.uid)}
                    className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-xl p-3 active:scale-95 transition-all"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600" style={{ fontSize: "20px", fontWeight: "600" }}>
                총 결제 금액
              </span>
              <span className="text-red-600" style={{ fontSize: "28px", fontWeight: "700" }}>
                {totalPrice.toLocaleString()}원
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("menu")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl py-5 active:scale-95 transition-all"
              >
                <span style={{ fontSize: "20px", fontWeight: "600" }}>+ 메뉴 추가</span>
              </button>
              <button
                onClick={() => setStep("payment")}
                className="flex-2 bg-red-600 hover:bg-red-700 text-white rounded-xl py-5 px-8 active:scale-95 transition-all"
              >
                <span style={{ fontSize: "22px", fontWeight: "700" }}>결제하기</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── PAYMENT ───────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="min-h-svh flex flex-col bg-gray-100">
        <LotteriaHeader onBack={() => setStep("cart")} title="결제 수단 선택" />

        <div className="flex-1 flex flex-col p-6 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md flex justify-between items-center">
            <span className="text-gray-600" style={{ fontSize: "20px" }}>
              총 결제 금액
            </span>
            <span className="text-red-600" style={{ fontSize: "28px", fontWeight: "700" }}>
              {totalPrice.toLocaleString()}원
            </span>
          </div>

          <div className="space-y-4 flex-1">
            <button
              onClick={() => setStep("complete")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-12 flex flex-col items-center gap-4 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "60px" }}>💳</span>
              <span style={{ fontSize: "28px", fontWeight: "700" }}>카드 결제</span>
              <span style={{ fontSize: "17px", opacity: 0.85 }}>신용카드 / 체크카드</span>
            </button>

            <button
              onClick={() => setStep("complete")}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-12 flex flex-col items-center gap-4 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "60px" }}>💵</span>
              <span style={{ fontSize: "28px", fontWeight: "700" }}>현금 결제</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────
  if (step === "complete") {
    return (
      <div className="min-h-svh bg-red-600 flex flex-col">
        <div className="bg-red-700 px-4 py-4 text-center">
          <span className="text-white font-black" style={{ fontSize: "28px", letterSpacing: "0.12em" }}>
            LOTTERIA
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
          <div className="bg-yellow-400 rounded-full w-32 h-32 flex items-center justify-center shadow-2xl">
            <Check size={72} className="text-red-600" strokeWidth={3} />
          </div>

          <h2 className="text-white" style={{ fontSize: "34px", fontWeight: "700" }}>
            주문이 완료되었습니다!
          </h2>

          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
            <p className="text-gray-500 mb-2" style={{ fontSize: "20px" }}>
              주문 번호
            </p>
            <p className="text-red-600" style={{ fontSize: "80px", fontWeight: "900", lineHeight: 1 }}>
              {orderNum}
            </p>
          </div>

          <div className="bg-red-500 rounded-xl p-5 w-full max-w-sm text-center">
            <p className="text-red-100" style={{ fontSize: "19px", lineHeight: "1.7" }}>
              {orderType === "dine-in"
                ? "번호가 호출되면 카운터에서 받아가세요 😊"
                : "포장 준비가 되면 알려드리겠습니다 😊"}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={reset}
              className="w-full bg-yellow-400 text-red-700 rounded-2xl py-5 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>추가 주문하기</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white text-red-600 rounded-2xl py-5 shadow-xl active:scale-95 transition-all"
            >
              <span style={{ fontSize: "22px", fontWeight: "700" }}>홈으로</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

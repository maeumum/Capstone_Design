import { useNavigate } from "react-router";
import { useState } from "react";
import { Plus, Minus, ShoppingBag, Bell, Clock, X, Check, ChevronRight } from "lucide-react";

type Step = "menu" | "confirm" | "complete";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  desc?: string;
  popular?: boolean;
  unit?: string;
}

interface CartItem {
  menu: MenuItem;
  qty: number;
}

interface OrderBatch {
  items: CartItem[];
  time: string;
  total: number;
}

const TABLE_NUM = 3;
const RESTAURANT = "한솥식당";

const CATEGORIES = [
  { id: "recommend", label: "추천메뉴", emoji: "⭐" },
  { id: "meat", label: "고기", emoji: "🥩" },
  { id: "stew", label: "찌개·국", emoji: "🍲" },
  { id: "rice", label: "밥·면", emoji: "🍚" },
  { id: "side", label: "사이드", emoji: "🥗" },
  { id: "drink", label: "음료·주류", emoji: "🍺" },
];

const MENU_ITEMS: MenuItem[] = [
  { id: "r1", name: "삼겹살", price: 14000, category: "recommend", emoji: "🥩", desc: "국내산 삼겹살", popular: true, unit: "1인분" },
  { id: "r2", name: "된장찌개", price: 8000, category: "recommend", emoji: "🍲", desc: "구수한 된장찌개", popular: true },
  { id: "r3", name: "해물파전", price: 12000, category: "recommend", emoji: "🥞", desc: "바삭한 해물파전", popular: true },
  { id: "r4", name: "소주", price: 5000, category: "recommend", emoji: "🍶", desc: "참이슬 / 처음처럼" },
  { id: "m1", name: "삼겹살", price: 14000, category: "meat", emoji: "🥩", desc: "국내산 삼겹살", unit: "1인분" },
  { id: "m2", name: "목살", price: 13000, category: "meat", emoji: "🥩", desc: "부드러운 목살", unit: "1인분" },
  { id: "m3", name: "소갈비", price: 18000, category: "meat", emoji: "🍖", desc: "한우 소갈비", unit: "1인분" },
  { id: "m4", name: "차돌박이", price: 16000, category: "meat", emoji: "🥩", desc: "얇게 썬 차돌박이", unit: "1인분" },
  { id: "s1", name: "된장찌개", price: 8000, category: "stew", emoji: "🍲", desc: "구수한 된장찌개" },
  { id: "s2", name: "김치찌개", price: 8000, category: "stew", emoji: "🍲", desc: "돼지고기 김치찌개" },
  { id: "s3", name: "순두부찌개", price: 8000, category: "stew", emoji: "🍲", desc: "얼큰한 순두부찌개" },
  { id: "s4", name: "부대찌개", price: 9000, category: "stew", emoji: "🍲", desc: "소시지·햄 부대찌개" },
  { id: "b1", name: "비빔밥", price: 9000, category: "rice", emoji: "🍚", desc: "야채 비빔밥" },
  { id: "b2", name: "냉면", price: 10000, category: "rice", emoji: "🍜", desc: "평양식 물냉면" },
  { id: "b3", name: "국밥", price: 9000, category: "rice", emoji: "🥣", desc: "돼지국밥" },
  { id: "b4", name: "공기밥", price: 1000, category: "rice", emoji: "🍚", desc: "흰쌀밥" },
  { id: "d1", name: "해물파전", price: 12000, category: "side", emoji: "🥞", desc: "바삭한 해물파전" },
  { id: "d2", name: "계란말이", price: 8000, category: "side", emoji: "🍳", desc: "부드러운 계란말이" },
  { id: "d3", name: "두부김치", price: 10000, category: "side", emoji: "🥗", desc: "익은 김치와 두부" },
  { id: "d4", name: "감자전", price: 9000, category: "side", emoji: "🥞", desc: "감자 전" },
  { id: "k1", name: "소주", price: 5000, category: "drink", emoji: "🍶", desc: "참이슬 / 처음처럼" },
  { id: "k2", name: "맥주", price: 5000, category: "drink", emoji: "🍺", desc: "카스 / 하이트" },
  { id: "k3", name: "막걸리", price: 5000, category: "drink", emoji: "🥛", desc: "서울 장수 막걸리" },
  { id: "k4", name: "콜라", price: 2000, category: "drink", emoji: "🥤" },
  { id: "k5", name: "사이다", price: 2000, category: "drink", emoji: "🥤" },
  { id: "k6", name: "물", price: 1000, category: "drink", emoji: "💧" },
];

const ORANGE = "#FF6B35";

export default function TableOrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("menu");
  const [activeTab, setActiveTab] = useState("recommend");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderBatch[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callDone, setCallDone] = useState(false);
  const [elapsedMin] = useState(12);

  const getQty = (id: string) => cart.find((c) => c.menu.id === id)?.qty ?? 0;

  const addItem = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu.id === menu.id);
      if (existing) return prev.map((c) => c.menu.id === menu.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { menu, qty: 1 }];
    });
  };

  const removeItem = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu.id === menu.id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((c) => c.menu.id !== menu.id);
      return prev.map((c) => c.menu.id === menu.id ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const totalCount = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.menu.price * c.qty, 0);

  const placeOrder = () => {
    const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    setOrderHistory((h) => [...h, { items: [...cart], time: now, total: totalPrice }]);
    setCart([]);
    setStep("complete");
  };

  const historyTotal = orderHistory.reduce((s, b) => s + b.total, 0);

  // ── CALL MODAL ────────────────────────────────────────────
  const CallModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
        {callDone ? (
          <>
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Check size={44} className="text-green-600" strokeWidth={3} />
            </div>
            <p className="text-gray-900 font-bold mb-2" style={{ fontSize: "22px" }}>직원을 호출했습니다!</p>
            <p className="text-gray-500 mb-6" style={{ fontSize: "16px" }}>잠시만 기다려주세요 😊</p>
            <button
              onClick={() => { setShowCall(false); setCallDone(false); }}
              className="w-full text-white rounded-2xl py-4 font-bold"
              style={{ background: ORANGE, fontSize: "18px" }}
            >
              확인
            </button>
          </>
        ) : (
          <>
            <Bell size={56} className="mx-auto mb-4" style={{ color: ORANGE }} />
            <p className="text-gray-900 font-bold mb-2" style={{ fontSize: "22px" }}>직원을 호출하시겠어요?</p>
            <p className="text-gray-500 mb-6" style={{ fontSize: "15px" }}>담당 직원이 테이블로 방문합니다</p>
            <div className="space-y-3">
              <button
                onClick={() => setCallDone(true)}
                className="w-full text-white rounded-2xl py-4 font-bold"
                style={{ background: ORANGE, fontSize: "18px" }}
              >
                네, 호출합니다
              </button>
              <button
                onClick={() => setShowCall(false)}
                className="w-full bg-gray-100 text-gray-600 rounded-2xl py-4 font-bold"
                style={{ fontSize: "18px" }}
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── ORDER HISTORY ─────────────────────────────────────────
  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 flex items-center gap-3 text-white" style={{ background: "#1c1c1e" }}>
          <button onClick={() => setShowHistory(false)} className="text-gray-300">
            <X size={26} />
          </button>
          <span className="font-bold flex-1" style={{ fontSize: "20px" }}>주문 내역</span>
          <span className="text-gray-400" style={{ fontSize: "15px" }}>테이블 {TABLE_NUM}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orderHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-40" />
              <p style={{ fontSize: "18px" }}>아직 주문 내역이 없습니다</p>
            </div>
          ) : (
            <>
              {orderHistory.map((batch, bi) => (
                <div key={bi} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={16} />
                      <span style={{ fontSize: "14px" }}>{batch.time} 주문</span>
                    </div>
                    <span className="font-bold" style={{ fontSize: "16px", color: ORANGE }}>
                      {batch.total.toLocaleString()}원
                    </span>
                  </div>
                  {batch.items.map((item, ii) => (
                    <div key={ii} className="flex justify-between py-1">
                      <span className="text-gray-700" style={{ fontSize: "15px" }}>
                        {item.menu.name} × {item.qty}
                      </span>
                      <span className="text-gray-600 font-semibold" style={{ fontSize: "15px" }}>
                        {(item.menu.price * item.qty).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="bg-white rounded-2xl p-5 shadow-sm border-2" style={{ borderColor: ORANGE }}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800" style={{ fontSize: "18px" }}>전체 합계</span>
                  <span className="font-bold" style={{ fontSize: "22px", color: ORANGE }}>
                    {historyTotal.toLocaleString()}원
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <button
            onClick={() => setShowHistory(false)}
            className="w-full text-white rounded-2xl py-5 font-bold"
            style={{ background: ORANGE, fontSize: "20px" }}
          >
            메뉴 보러 가기
          </button>
        </div>
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────
  if (step === "complete") {
    const lastOrder = orderHistory[orderHistory.length - 1];
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="px-4 py-4 text-center text-white" style={{ background: "#1c1c1e" }}>
          <span className="font-black" style={{ fontSize: "20px" }}>{RESTAURANT}</span>
          <span className="text-gray-400 ml-3" style={{ fontSize: "14px" }}>테이블 {TABLE_NUM}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-7">
          <div className="rounded-full w-28 h-28 flex items-center justify-center shadow-xl" style={{ background: "#fff3ee" }}>
            <Check size={64} strokeWidth={3} style={{ color: ORANGE }} />
          </div>

          <div className="text-center">
            <h2 className="text-gray-900 font-bold" style={{ fontSize: "28px" }}>주문 완료!</h2>
            <p className="text-gray-500 mt-2" style={{ fontSize: "16px" }}>주문이 접수되었습니다</p>
          </div>

          <div className="bg-white rounded-2xl p-5 w-full shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <Clock size={16} />
              <span style={{ fontSize: "14px" }}>예상 대기 시간</span>
              <span className="font-bold ml-auto" style={{ fontSize: "18px", color: ORANGE }}>약 10~15분</span>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {lastOrder?.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-700" style={{ fontSize: "15px" }}>
                    {item.menu.name} × {item.qty}
                  </span>
                  <span className="text-gray-600 font-semibold" style={{ fontSize: "15px" }}>
                    {(item.menu.price * item.qty).toLocaleString()}원
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t border-gray-100 pt-3 mt-2">
                <span className="font-bold text-gray-800" style={{ fontSize: "16px" }}>합계</span>
                <span className="font-bold" style={{ fontSize: "18px", color: ORANGE }}>
                  {lastOrder?.total.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => setStep("menu")}
              className="w-full text-white rounded-2xl py-5 font-bold"
              style={{ background: ORANGE, fontSize: "20px" }}
            >
              추가 주문하기
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="w-full bg-white border-2 rounded-2xl py-5 font-bold"
              style={{ borderColor: ORANGE, color: ORANGE, fontSize: "18px" }}
            >
              전체 주문 내역 보기
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-gray-500 rounded-2xl py-4 font-semibold"
              style={{ fontSize: "16px" }}
            >
              홈으로
            </button>
          </div>
        </div>

        {showCall && <CallModal />}
      </div>
    );
  }

  // ── CONFIRM ───────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="px-4 py-4 flex items-center gap-3 text-white" style={{ background: "#1c1c1e" }}>
          <button onClick={() => setStep("menu")} className="text-gray-300">
            <X size={26} />
          </button>
          <span className="font-bold flex-1" style={{ fontSize: "20px" }}>주문 확인</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 mb-4" style={{ fontSize: "14px" }}>주문하실 메뉴를 확인해주세요</p>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.menu.id} className="flex items-center gap-3">
                  <span style={{ fontSize: "36px" }}>{item.menu.emoji}</span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-bold" style={{ fontSize: "17px" }}>{item.menu.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "13px" }}>
                      {item.menu.price.toLocaleString()}원 × {item.qty}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeItem(item.menu)}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Minus size={16} style={{ color: ORANGE }} strokeWidth={3} />
                    </button>
                    <span className="font-bold w-5 text-center" style={{ fontSize: "18px" }}>{item.qty}</span>
                    <button
                      onClick={() => addItem(item.menu)}
                      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                      style={{ background: ORANGE }}
                    >
                      <Plus size={16} className="text-white" strokeWidth={3} />
                    </button>
                  </div>
                  <span className="font-bold w-20 text-right" style={{ fontSize: "16px", color: ORANGE }}>
                    {(item.menu.price * item.qty).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-bold" style={{ fontSize: "18px" }}>총 주문 금액</span>
              <span className="font-bold" style={{ fontSize: "24px", color: ORANGE }}>
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#fff3ee" }}>
            <p className="text-gray-600" style={{ fontSize: "14px", lineHeight: "1.6" }}>
              ℹ️ 주문 후 취소 및 변경은 직원에게 문의하세요.
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 space-y-3">
          <button
            onClick={placeOrder}
            className="w-full text-white rounded-2xl py-6 font-bold shadow-lg active:scale-95 transition-all"
            style={{ background: ORANGE, fontSize: "22px" }}
          >
            {totalPrice.toLocaleString()}원 주문하기
          </button>
          <button
            onClick={() => setStep("menu")}
            className="w-full bg-gray-100 text-gray-600 rounded-xl py-4 font-semibold active:scale-95 transition-all"
            style={{ fontSize: "16px" }}
          >
            메뉴 더 추가하기
          </button>
        </div>
      </div>
    );
  }

  // ── MENU (main) ───────────────────────────────────────────
  const filtered = MENU_ITEMS.filter((m) => m.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showCall && <CallModal />}

      {/* Top header */}
      <div className="px-4 py-3 flex items-center justify-between text-white" style={{ background: "#1c1c1e" }}>
        <div>
          <p className="font-black" style={{ fontSize: "18px" }}>{RESTAURANT}</p>
          <div className="flex items-center gap-2 text-gray-400">
            <span style={{ fontSize: "13px" }}>테이블 {TABLE_NUM}</span>
            <span style={{ fontSize: "13px" }}>·</span>
            <Clock size={12} />
            <span style={{ fontSize: "13px" }}>{elapsedMin}분 경과</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 주문내역 */}
          {orderHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white rounded-xl px-3 py-2 active:scale-95 transition-all"
            >
              <ShoppingBag size={16} />
              <span style={{ fontSize: "13px", fontWeight: "600" }}>주문내역 {orderHistory.length}</span>
            </button>
          )}
          {/* 직원호출 */}
          <button
            onClick={() => setShowCall(true)}
            className="flex items-center gap-1 text-white rounded-xl px-3 py-2 active:scale-95 transition-all"
            style={{ background: "#e53935" }}
          >
            <Bell size={16} />
            <span style={{ fontSize: "13px", fontWeight: "700" }}>직원호출</span>
          </button>
        </div>
      </div>

      {/* Service request bar */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto" style={{ background: "#2a2a2c" }}>
        {["🥢 수저·포크", "💧 물 추가", "🧴 앞치마", "🔥 불 조절"].map((svc) => (
          <button
            key={svc}
            onClick={() => setShowCall(true)}
            className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-full px-4 py-1.5 active:scale-95 transition-all"
            style={{ fontSize: "13px", fontWeight: "600" }}
          >
            {svc}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-100 flex overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 border-b-4 transition-all"
            style={{
              borderBottomColor: activeTab === cat.id ? ORANGE : "transparent",
              color: activeTab === cat.id ? ORANGE : "#888",
            }}
          >
            <span style={{ fontSize: "20px" }}>{cat.emoji}</span>
            <span style={{ fontSize: "13px", fontWeight: activeTab === cat.id ? "700" : "500" }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto p-3 pb-36">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((menu) => {
            const qty = getQty(menu.id);
            return (
              <div
                key={menu.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                {/* Image area */}
                <div className="relative bg-orange-50 py-6 flex items-center justify-center">
                  <span style={{ fontSize: "52px" }}>{menu.emoji}</span>
                  {menu.popular && (
                    <span
                      className="absolute top-2 left-2 text-white rounded-full px-2 py-0.5"
                      style={{ fontSize: "11px", fontWeight: "700", background: ORANGE }}
                    >
                      인기
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-gray-900 font-bold" style={{ fontSize: "15px" }}>{menu.name}</p>
                  {menu.desc && (
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>{menu.desc}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold" style={{ fontSize: "16px", color: ORANGE }}>
                        {menu.price.toLocaleString()}원
                      </span>
                      {menu.unit && (
                        <span className="text-gray-400 ml-1" style={{ fontSize: "12px" }}>/{menu.unit}</span>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => addItem(menu)}
                        className="text-white rounded-xl px-3 py-2 active:scale-95 transition-all"
                        style={{ background: ORANGE, fontSize: "13px", fontWeight: "700" }}
                      >
                        + 담기
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(menu)}
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center active:scale-95 transition-all"
                          style={{ borderColor: ORANGE }}
                        >
                          <Minus size={14} style={{ color: ORANGE }} strokeWidth={3} />
                        </button>
                        <span className="font-bold w-5 text-center" style={{ fontSize: "16px", color: ORANGE }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => addItem(menu)}
                          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                          style={{ background: ORANGE }}
                        >
                          <Plus size={14} className="text-white" strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom cart bar */}
      {totalCount > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 shadow-2xl" style={{ background: "#1c1c1e" }}>
          <button
            onClick={() => setStep("confirm")}
            className="w-full text-white rounded-2xl py-5 flex items-center justify-between px-6 active:scale-95 transition-all"
            style={{ background: ORANGE }}
          >
            <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center">
              <span className="font-black" style={{ fontSize: "16px", color: ORANGE }}>{totalCount}</span>
            </div>
            <span className="font-black" style={{ fontSize: "20px" }}>주문하기</span>
            <span className="font-bold" style={{ fontSize: "18px" }}>{totalPrice.toLocaleString()}원</span>
          </button>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between" style={{ background: "#1c1c1e" }}>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>메뉴를 선택해 주세요</p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-gray-400 active:scale-95 transition-all"
          >
            <span style={{ fontSize: "13px" }}>홈으로</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

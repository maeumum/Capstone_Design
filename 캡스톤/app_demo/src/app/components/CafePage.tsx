import { useNavigate } from "react-router";
import { ArrowLeft, Coffee, Home, ShoppingCart, CreditCard, Check, Plus, Minus } from "lucide-react";
import { useState } from "react";

type OrderType = "dine-in" | "takeout" | null;
type MenuCategory = "coffee" | "beverage" | "dessert";
type Size = "small" | "medium" | "large";
type Temperature = "hot" | "ice";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  image: string;
}

interface OrderItem {
  menu: MenuItem;
  size: Size;
  temperature: Temperature;
  quantity: number;
}

const menuItems: MenuItem[] = [
  { id: "americano", name: "아메리카노", price: 4500, category: "coffee", image: "☕" },
  { id: "latte", name: "카페라떼", price: 5000, category: "coffee", image: "🥛" },
  { id: "cappuccino", name: "카푸치노", price: 5000, category: "coffee", image: "☕" },
  { id: "vanilla-latte", name: "바닐라라떼", price: 5500, category: "coffee", image: "🥛" },
  { id: "green-tea", name: "녹차", price: 4500, category: "beverage", image: "🍵" },
  { id: "juice", name: "오렌지주스", price: 5000, category: "beverage", image: "🧃" },
  { id: "smoothie", name: "딸기스무디", price: 6000, category: "beverage", image: "🥤" },
  { id: "cake", name: "치즈케이크", price: 6500, category: "dessert", image: "🍰" },
];

export default function CafePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orderType, setOrderType] = useState<OrderType>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size>("medium");
  const [selectedTemp, setSelectedTemp] = useState<Temperature>("hot");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | null>(null);

  const resetOrder = () => {
    setStep(0);
    setOrderType(null);
    setSelectedCategory(null);
    setSelectedMenu(null);
    setSelectedSize("medium");
    setSelectedTemp("hot");
    setCart([]);
    setPaymentMethod(null);
  };

  const addToCart = () => {
    if (selectedMenu) {
      const newItem: OrderItem = {
        menu: selectedMenu,
        size: selectedSize,
        temperature: selectedTemp,
        quantity: 1,
      };
      setCart([...cart, newItem]);
      setSelectedMenu(null);
      setStep(1); // 카테고리 선택으로 돌아가기
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const sizePrice = item.size === "large" ? 500 : item.size === "small" ? -500 : 0;
      return total + (item.menu.price + sizePrice) * item.quantity;
    }, 0);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getSizeText = (size: Size) => {
    return size === "small" ? "Small" : size === "medium" ? "Medium" : "Large";
  };

  const getTempText = (temp: Temperature) => {
    return temp === "hot" ? "따뜻하게(HOT)" : "차갑게(ICE)";
  };

  // Step 0: 매장/포장 선택
  if (step === 0) {
    return (
      <div className="min-h-svh bg-gradient-to-b from-amber-50 to-amber-100 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all mb-6"
          >
            <ArrowLeft size={32} strokeWidth={2.5} />
            <span style={{ fontSize: '24px', fontWeight: '600' }}>뒤로 가기</span>
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Coffee size={60} className="text-amber-600" strokeWidth={2.5} />
              <h1 className="text-amber-800" style={{ fontSize: '40px', fontWeight: '700' }}>
                카페 주문
              </h1>
            </div>

            <p className="text-center text-gray-700 mb-8" style={{ fontSize: '28px', fontWeight: '600' }}>
              주문 방식을 선택해주세요
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setOrderType("dine-in");
                  setStep(1);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
              >
                <Home size={70} strokeWidth={2.5} />
                <span style={{ fontSize: '32px', fontWeight: '700' }}>매장에서 먹기</span>
              </button>

              <button
                onClick={() => {
                  setOrderType("takeout");
                  setStep(1);
                }}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
              >
                <ShoppingCart size={70} strokeWidth={2.5} />
                <span style={{ fontSize: '32px', fontWeight: '700' }}>포장하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: 카테고리 선택
  if (step === 1) {
    const categories = [
      { id: "coffee" as MenuCategory, name: "커피", icon: "☕", color: "bg-amber-600" },
      { id: "beverage" as MenuCategory, name: "음료", icon: "🥤", color: "bg-blue-500" },
      { id: "dessert" as MenuCategory, name: "디저트", icon: "🍰", color: "bg-pink-500" },
    ];

    return (
      <div className="min-h-svh bg-gradient-to-b from-amber-50 to-amber-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6 gap-2">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
              <span style={{ fontSize: '20px', fontWeight: '600' }}>이전</span>
            </button>

            <button
              onClick={resetOrder}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              <span style={{ fontSize: '20px', fontWeight: '600' }}>처음으로</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-center text-gray-800 mb-8" style={{ fontSize: '32px', fontWeight: '700' }}>
              무엇을 주문하시겠어요?
            </h2>

            <div className="space-y-4 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setStep(2);
                  }}
                  className={`w-full ${category.color} hover:opacity-90 text-white rounded-2xl p-8 flex items-center justify-center gap-6 shadow-xl active:scale-95 transition-all`}
                >
                  <span style={{ fontSize: '60px' }}>{category.icon}</span>
                  <span style={{ fontSize: '32px', fontWeight: '700' }}>{category.name}</span>
                </button>
              ))}
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setStep(4)}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-5 flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                <ShoppingCart size={32} strokeWidth={2.5} />
                <span style={{ fontSize: '28px', fontWeight: '700' }}>
                  장바구니 보기 ({cart.length}개)
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: 메뉴 선택
  if (step === 2 && selectedCategory) {
    const filteredMenus = menuItems.filter((item) => item.category === selectedCategory);

    return (
      <div className="min-h-svh bg-gradient-to-b from-amber-50 to-amber-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6 gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
              <span style={{ fontSize: '20px', fontWeight: '600' }}>이전</span>
            </button>

            <button
              onClick={resetOrder}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              <span style={{ fontSize: '20px', fontWeight: '600' }}>처음으로</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-center text-gray-800 mb-8" style={{ fontSize: '32px', fontWeight: '700' }}>
              메뉴를 선택해주세요
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {filteredMenus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => {
                    setSelectedMenu(menu);
                    setStep(3);
                  }}
                  className="bg-white border-4 border-gray-200 hover:border-amber-500 rounded-xl p-4 flex flex-col items-center gap-3 shadow-lg active:scale-95 transition-all"
                >
                  <span style={{ fontSize: '50px' }}>{menu.image}</span>
                  <span className="text-gray-800 text-center" style={{ fontSize: '20px', fontWeight: '600' }}>
                    {menu.name}
                  </span>
                  <span className="text-amber-600" style={{ fontSize: '22px', fontWeight: '700' }}>
                    {menu.price.toLocaleString()}원
                  </span>
                </button>
              ))}
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setStep(4)}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-5 flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                <ShoppingCart size={32} strokeWidth={2.5} />
                <span style={{ fontSize: '28px', fontWeight: '700' }}>
                  장바구니 보기 ({cart.length}개)
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: 옵션 선택
  if (step === 3 && selectedMenu) {
    return (
      <div className="min-h-svh bg-gradient-to-b from-amber-50 to-amber-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6 gap-2">
            <button
              onClick={() => {
                setSelectedMenu(null);
                setStep(2);
              }}
              className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
              <span style={{ fontSize: '20px', fontWeight: '600' }}>이전</span>
            </button>

            <button
              onClick={resetOrder}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              <span style={{ fontSize: '20px', fontWeight: '600' }}>처음으로</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-8">
              <span style={{ fontSize: '70px' }}>{selectedMenu.image}</span>
              <h2 className="text-gray-800 mt-3" style={{ fontSize: '32px', fontWeight: '700' }}>
                {selectedMenu.name}
              </h2>
              <p className="text-amber-600 mt-2" style={{ fontSize: '28px', fontWeight: '700' }}>
                {selectedMenu.price.toLocaleString()}원
              </p>
            </div>

            <div className="space-y-6">
              {/* 사이즈 선택 */}
              <div>
                <h3 className="text-gray-800 mb-4" style={{ fontSize: '28px', fontWeight: '600' }}>
                  사이즈 선택
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as Size[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`${
                        selectedSize === size
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-white text-gray-800 border-gray-300"
                      } border-4 rounded-xl py-6 transition-all active:scale-95`}
                    >
                      <p style={{ fontSize: '24px', fontWeight: '700' }}>
                        {getSizeText(size)}
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: '600' }}>
                        {size === "small" ? "-500원" : size === "large" ? "+500원" : "기본"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 온도 선택 */}
              {selectedMenu.category !== "dessert" && (
                <div>
                  <h3 className="text-gray-800 mb-4" style={{ fontSize: '28px', fontWeight: '600' }}>
                    온도 선택
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(["hot", "ice"] as Temperature[]).map((temp) => (
                      <button
                        key={temp}
                        onClick={() => setSelectedTemp(temp)}
                        className={`${
                          selectedTemp === temp
                            ? "bg-amber-500 text-white border-amber-600"
                            : "bg-white text-gray-800 border-gray-300"
                        } border-4 rounded-xl py-6 transition-all active:scale-95`}
                      >
                        <p style={{ fontSize: '24px', fontWeight: '700' }}>
                          {getTempText(temp)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 장바구니 담기 버튼 */}
              <button
                onClick={addToCart}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-6 shadow-xl active:scale-95 transition-all"
              >
                <span style={{ fontSize: '28px', fontWeight: '700' }}>장바구니에 담기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: 장바구니 확인
  if (step === 4) {
    return (
      <div className="min-h-svh bg-gradient-to-b from-amber-50 to-amber-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6 gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>메뉴 추가</span>
            </button>

            <button
              onClick={resetOrder}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              <span style={{ fontSize: '20px', fontWeight: '600' }}>처음으로</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-center text-gray-800 mb-8" style={{ fontSize: '32px', fontWeight: '700' }}>
              주문 내역 확인
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={60} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500" style={{ fontSize: '24px', fontWeight: '600' }}>
                  장바구니가 비어있습니다
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => {
                    const sizePrice = item.size === "large" ? 500 : item.size === "small" ? -500 : 0;
                    const itemPrice = (item.menu.price + sizePrice) * item.quantity;

                    return (
                      <div
                        key={index}
                        className="bg-amber-50 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span style={{ fontSize: '40px' }}>{item.menu.image}</span>
                          <div className="flex-1">
                            <p className="text-gray-800" style={{ fontSize: '22px', fontWeight: '700' }}>
                              {item.menu.name}
                            </p>
                            <p className="text-gray-600" style={{ fontSize: '18px' }}>
                              {getSizeText(item.size)} / {getTempText(item.temperature)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-amber-600" style={{ fontSize: '24px', fontWeight: '700' }}>
                            {itemPrice.toLocaleString()}원
                          </p>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg active:scale-95 transition-all"
                          >
                            <span style={{ fontSize: '18px', fontWeight: '600' }}>삭제</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-4 border-gray-300 pt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800" style={{ fontSize: '28px', fontWeight: '700' }}>
                      총 결제 금액
                    </span>
                    <span className="text-amber-600" style={{ fontSize: '36px', fontWeight: '700' }}>
                      {getTotalPrice().toLocaleString()}원
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(5)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 shadow-xl active:scale-95 transition-all"
                >
                  <span style={{ fontSize: '28px', fontWeight: '700' }}>결제하기</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 5: 결제 수단 선택
  if (step === 5) {
    return (
      <div className="min-h-svh bg-gradient-to-b from-amber-50 to-amber-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6 gap-2">
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
              <span style={{ fontSize: '20px', fontWeight: '600' }}>이전</span>
            </button>

            <button
              onClick={resetOrder}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              <span style={{ fontSize: '20px', fontWeight: '600' }}>처음으로</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-center text-gray-800 mb-6" style={{ fontSize: '32px', fontWeight: '700' }}>
              결제 수단 선택
            </h2>

            <div className="bg-amber-50 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-800" style={{ fontSize: '24px', fontWeight: '700' }}>
                  총 결제 금액
                </span>
                <span className="text-amber-600" style={{ fontSize: '32px', fontWeight: '700' }}>
                  {getTotalPrice().toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setPaymentMethod("card");
                  setStep(6);
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-10 flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
              >
                <CreditCard size={70} strokeWidth={2.5} />
                <span style={{ fontSize: '32px', fontWeight: '700' }}>카드 결제</span>
              </button>

              <button
                onClick={() => {
                  setPaymentMethod("cash");
                  setStep(6);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl p-10 flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
              >
                <span style={{ fontSize: '60px' }}>💵</span>
                <span style={{ fontSize: '32px', fontWeight: '700' }}>현금 결제</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: 완료 화면
  if (step === 6) {
    return (
      <div className="min-h-svh bg-gradient-to-b from-green-50 to-green-100 p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="bg-green-100 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Check size={80} className="text-green-600" strokeWidth={3} />
            </div>

            <h2 className="text-gray-800 mb-6" style={{ fontSize: '36px', fontWeight: '700' }}>
              주문이 완료되었습니다!
            </h2>

            <div className="bg-amber-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 mb-3" style={{ fontSize: '24px', fontWeight: '600' }}>
                주문 번호
              </p>
              <p className="text-amber-600" style={{ fontSize: '52px', fontWeight: '700' }}>
                {Math.floor(Math.random() * 900) + 100}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <p className="text-gray-700 whitespace-pre-line" style={{ fontSize: '22px', fontWeight: '600', lineHeight: '1.6' }}>
                {orderType === "dine-in"
                  ? "주문하신 음료는 곧 준비됩니다.\n잠시만 기다려 주세요!"
                  : "포장 준비가 완료되면 호출하겠습니다.\n감사합니다!"}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-xl py-5 shadow-xl active:scale-95 transition-all"
              >
                <span style={{ fontSize: '26px', fontWeight: '700' }}>홈으로</span>
              </button>

              <button
                onClick={resetOrder}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5 shadow-xl active:scale-95 transition-all"
              >
                <span style={{ fontSize: '26px', fontWeight: '700' }}>다시 주문하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
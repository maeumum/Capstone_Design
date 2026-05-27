import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

type Tab = '추천메뉴' | '커피' | '음료' | '티' | '푸드';
type Temp = 'HOT' | 'ICE';
type OptionsPhase = 'review' | 'payment';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  emoji: string;
  gradient: string;
  hasTemp: boolean;
  tabs: Tab[];
}

interface CartItem {
  menu: MenuItem;
  temp: Temp | null;
  qty: number;
  optionExtra: number;
}

const MENUS: MenuItem[] = [
  // 추천메뉴
  { id:  1, name: '복숭아 아이스티', price: 3500, emoji: '🍑', gradient: 'linear-gradient(135deg,#ffd6b8,#ff8c42)', hasTemp: false,  tabs: ['추천메뉴'] },
  { id:  2, name: '딸기 라떼',       price: 4500, emoji: '🍓', gradient: 'linear-gradient(135deg,#ffb3c1,#e63946)', hasTemp: true,  tabs: ['추천메뉴'] },
  // 커피
  { id:  3, name: '아메리카노',          price: 2500, emoji: '☕', gradient: 'linear-gradient(135deg,#d4c4a8,#8b6f47)', hasTemp: true,  tabs: ['추천메뉴', '커피'] },
  { id:  4, name: '카페라떼',            price: 3900, emoji: '🥛', gradient: 'linear-gradient(135deg,#f5e6c8,#d4a574)', hasTemp: true,  tabs: ['추천메뉴', '커피'] },
  { id:  5, name: '바닐라라떼',          price: 4000, emoji: '🍦', gradient: 'linear-gradient(135deg,#fff0c8,#f5c430)', hasTemp: true,                tabs: ['커피'] },
  { id:  6, name: '연유라떼',            price: 4200, emoji: '🍯', gradient: 'linear-gradient(135deg,#ffe8a0,#f0a020)', hasTemp: true,                tabs: ['커피'] },
  { id:  7, name: '카페모카',            price: 4500, emoji: '🍫', gradient: 'linear-gradient(135deg,#c8a87a,#6b3a2a)', hasTemp: true,                tabs: ['커피'] },
  { id:  8, name: '디카페인 아메리카노', price: 3000, emoji: '☕', gradient: 'linear-gradient(135deg,#e0dcd4,#a89880)', hasTemp: true,                tabs: ['커피'] },
  { id:  9, name: '디카페인 카페라떼',   price: 4400, emoji: '🥛', gradient: 'linear-gradient(135deg,#ece8e0,#c4b090)', hasTemp: true,                tabs: ['커피'] },
  { id: 10, name: '디카페인 바닐라라떼', price: 4500, emoji: '🍦', gradient: 'linear-gradient(135deg,#f0ecd4,#d4b858)', hasTemp: true,                tabs: ['커피'] },
  { id: 11, name: '디카페인 연유라떼',   price: 4700, emoji: '🍯', gradient: 'linear-gradient(135deg,#e8e0b0,#c0a040)', hasTemp: true,                tabs: ['커피'] },
  { id: 12, name: '디카페인 카페모카',   price: 5000, emoji: '🍫', gradient: 'linear-gradient(135deg,#b8a890,#5a3828)', hasTemp: true,                tabs: ['커피'] },
  // 음료
  { id: 13, name: '자몽에이드', price: 4500, emoji: '🍊', gradient: 'linear-gradient(135deg,#ff9a8b,#ff6b35)', hasTemp: false, tabs: ['추천메뉴', '음료'] },
  { id: 14, name: '청포도에이드', price: 4500, emoji: '🍇', gradient: 'linear-gradient(135deg,#d4f5c4,#52b788)', hasTemp: false,              tabs: ['음료'] },
  { id: 15, name: '키위주스',      price: 4800, emoji: '🥝', gradient: 'linear-gradient(135deg,#c8f7c5,#27ae60)', hasTemp: false,               tabs: ['음료'] },
  { id: 22, name: '딸기라떼',     price: 4500, emoji: '🍓', gradient: 'linear-gradient(135deg,#ffb3c1,#e63946)', hasTemp: true,                tabs: ['음료'] },
  { id: 23, name: '블루베리 스무디', price: 5000, emoji: '🫐', gradient: 'linear-gradient(135deg,#c3b1e1,#6a0dad)', hasTemp: false,             tabs: ['음료'] },
  { id: 24, name: '망고 스무디',  price: 5000, emoji: '🥭', gradient: 'linear-gradient(135deg,#ffe066,#ff9900)', hasTemp: false,               tabs: ['음료'] },
  { id: 25, name: '밀크쉐이크',   price: 4800, emoji: '🥤', gradient: 'linear-gradient(135deg,#fff0f5,#f9a8d4)', hasTemp: false,               tabs: ['음료'] },
  // 티
  { id: 16, name: '페퍼민트', price: 3500, emoji: '🌿', gradient: 'linear-gradient(135deg,#b2f7ef,#0db39e)', hasTemp: true, tabs: ['추천메뉴', '티'] },
  { id: 17, name: '캐모마일', price: 3500, emoji: '🌼', gradient: 'linear-gradient(135deg,#fff3cd,#ffc107)', hasTemp: true, tabs: ['티'] },
  { id: 18, name: '복숭아아이스티', price: 3500, emoji: '🍑', gradient: 'linear-gradient(135deg,#ffd6b8,#ff8c42)', hasTemp: false, tabs: ['티'] },
  { id: 26, name: '유자차',   price: 3800, emoji: '🍋', gradient: 'linear-gradient(135deg,#fef9c3,#eab308)', hasTemp: true, tabs: ['티'] },
  { id: 27, name: '생강차',   price: 3800, emoji: '🫚', gradient: 'linear-gradient(135deg,#fde8c8,#d97706)', hasTemp: true, tabs: ['티'] },
  { id: 28, name: '녹차',     price: 3500, emoji: '🍵', gradient: 'linear-gradient(135deg,#d1fae5,#059669)', hasTemp: true, tabs: ['티'] },
  // 푸드
  { id: 19, name: '쿠키',     price: 2500, emoji: '🍪', gradient: 'linear-gradient(135deg,#f5deb3,#a0522d)', hasTemp: false,               tabs: ['푸드'] },
  { id: 20, name: '마카롱',   price: 3000, emoji: '🌸', gradient: 'linear-gradient(135deg,#fce4ec,#ce93d8)', hasTemp: false, tabs: ['추천메뉴', '푸드'] },
  { id: 21, name: '크로플',   price: 4500, emoji: '🥐', gradient: 'linear-gradient(135deg,#fff3cd,#e8a020)', hasTemp: false,               tabs: ['푸드'] },
  { id: 29, name: '치즈케이크', price: 5000, emoji: '🍰', gradient: 'linear-gradient(135deg,#fffde7,#f9a825)', hasTemp: false,  tabs: ['추천메뉴', '푸드'] },
];

const SUB_TABS: Tab[] = ['추천메뉴', '커피', '음료', '티', '푸드'];
const TAB_LABEL: Record<Tab, string> = {
  '추천메뉴': '추천메뉴',
  '커피': '커피(Coffee)',
  '음료': '음료(Beverage)',
  '티': '티(Tea)',
  '푸드': '푸드(Food)',
};

const MENU_IMAGE: Record<number, string> = {
  1:  '/images/menu/peach-tea.jpg',
  2:  '/images/menu/strawberry-latte.jpg',
  3:  '/images/menu/americano.jpg',
  4:  '/images/menu/cafe-latte.jpg',
  5:  '/images/menu/vanilla-latte.jpg',
  6:  '/images/menu/condensed-latte.jpg',
  7:  '/images/menu/cafe-mocha.jpg',
  8:  '/images/menu/decaf-americano.jpg',
  9:  '/images/menu/decaf-cafe-latte.jpg',
  10: '/images/menu/decaf-vanilla-latte.jpg',
  11: '/images/menu/decaf-condensed-latte.jpg',
  12: '/images/menu/decaf-cafe-mocha.jpg',
  13: '/images/menu/grapefruit-ade.png',
  14: '/images/menu/green-grape-ade.jpg',
  15: '/images/menu/kiwi-juice.jpg',
  16: '/images/menu/peppermint.jpg',
  17: '/images/menu/chamomile.jpg',
  18: '/images/menu/peach-tea.jpg',
  19: '/images/menu/cookie.jpg',
  20: '/images/menu/macaron.jpg',
  21: '/images/menu/croffle.jpg',
  22: '/images/menu/strawberry-latte.jpg',
  23: '/images/menu/blueberry-smoothie.jpg',
  24: '/images/menu/mango-smoothie.jpg',
  25: '/images/menu/milk-shake.png',
  26: '/images/menu/yuzu-tea.jpg',
  27: '/images/menu/ginger-tea.png',
  28: '/images/menu/green-tea.jpg',
  29: '/images/menu/cheesecake.jpg',
};


const Y = '#FFB800';
const BK = '#111111';

const MARK_STYLE: Record<string, { bg: string; color: string }> = {
  gray:   { bg: '#9e9e9e', color: '#fff' },
  blue:   { bg: '#1565c0', color: '#fff' },
  purple: { bg: '#7b1fa2', color: '#fff' },
  dark:   { bg: '#333',    color: '#fff' },
  yellow: { bg: '#FFD600', color: '#333' },
  green:  { bg: '#2e7d32', color: '#fff' },
  red:    { bg: '#c62828', color: '#fff' },
  orange: { bg: '#e65100', color: '#fff' },
};

const STEP1_DATA = [
  { markColor: 'gray',   markText: '통신A',  main: '통신사 VIP',       sub: '통합 월1회' },
  { markColor: 'blue',   markText: '통신B',  main: '통신사 우주패스',   sub: '월간 혜택' },
  { markColor: 'purple', markText: '포인트', main: '멀티플렉스 포인트', sub: '적립/사용' },
  { markColor: 'dark',   markText: '자동차', main: '자동차 멤버스',     sub: '제휴 할인' },
  { markColor: 'blue',   markText: '멤버십', main: '통신 멤버십',       sub: '할인/적립 월4회' },
  { markColor: 'yellow', markText: '쿠폰',   main: '메가쿠폰',          sub: 'APP 연동 쿠폰' },
];

const PAY_ROW = [
  { markColor: 'yellow', markText: 'Pay',  main: '카카오페이' },
  { markColor: 'red',    markText: 'PAY',  main: '페이코' },
  { markColor: 'green',  markText: 'Pay',  main: '네이버페이' },
  { markColor: 'blue',   markText: 'zero', main: '제로페이' },
  { markColor: 'red',    markText: 'Book', main: 'BC 페이북' },
];

const BANK_ROW = [
  { markColor: 'green',  markText: 'Pay',   main: '하나 Pay' },
  { markColor: 'yellow', markText: 'Pay',   main: 'KB Pay' },
  { markColor: 'blue',   markText: 'Pay',   main: '신한 SOL', sub: '1천원결제 5백P' },
  { markColor: 'orange', markText: 'Pay',   main: '당근 페이' },
  { markColor: 'blue',   markText: "Int'l", main: '알리페이' },
];

const GIFT_ROW = [
  { markColor: 'yellow', markText: '‖‖‖', main: '모바일상품권', sub: '교환권/금액권' },
  { markColor: 'yellow', markText: '선불', main: '선불카드' },
  { markColor: 'purple', markText: 'Gift', main: 'CJ기프트카드' },
  { markColor: 'gray',   markText: 'M·P',  main: '현대M포인트', sub: '20% 사용' },
];

export default function CafePage() {
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState<Tab>('추천메뉴');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [timer, setTimer] = useState(110);

  const [popupMenu, setPopupMenu] = useState<MenuItem | null>(null);
  const [popupTemp, setPopupTemp] = useState<Temp>('HOT');
  const [popupQty, setPopupQty] = useState(1);
  const [popupOptions, setPopupOptions] = useState<{
    size: 'regular' | 'large';
    shot: 0 | 1 | 2;
    sweetness: null | '연유' | '스테비아';
    topping: null | '휘핑' | '펄';
  }>({ size: 'regular', shot: 0, sweetness: null, topping: null });

  const [showOptions, setShowOptions] = useState(false);
  const [optionsPhase, setOptionsPhase] = useState<OptionsPhase>('review');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);

  const [showStampPopup, setShowStampPopup] = useState(false);
  const [stampPhone, setStampPhone] = useState('');
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [payFull, setPayFull] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const [orderNumber] = useState(() => Math.floor(Math.random() * 900) + 100);

  // 타이머: 1초마다 감소, 장바구니 변경 시 110초로 리셋
  useEffect(() => {
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { setTimer(110); }, [cart]);

  const totalPrice = cart.reduce((sum, item) => sum + (item.menu.price + item.optionExtra) * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const filteredMenus = MENUS.filter(m => m.tabs.includes(activeSubTab));
  const optionExtra =
    (popupOptions.size === 'large' ? 500 : 0) +
    (popupOptions.shot === 1 ? 500 : popupOptions.shot === 2 ? 1000 : 0) +
    (popupOptions.sweetness === '연유' ? 700 : popupOptions.sweetness === '스테비아' ? 600 : 0) +
    (popupOptions.topping === '휘핑' ? 500 : popupOptions.topping === '펄' ? 700 : 0);
  const popupPrice = popupMenu ? (popupMenu.price + optionExtra) * popupQty : 0;
  const selectedOptionsText = [
    popupMenu?.hasTemp ? popupTemp : null,
    popupOptions.size === 'large' ? '라지' : null,
    popupOptions.shot > 0 ? `${popupOptions.shot}샷 추가` : null,
    popupOptions.sweetness ? `${popupOptions.sweetness} 추가` : null,
    popupOptions.topping ? `${popupOptions.topping} 추가` : null,
  ].filter(Boolean).join(', ') || '없음';

  const openPopup = (menu: MenuItem) => {
    if (menu.tabs.includes('푸드')) {
      setCart(prev => {
        const idx = prev.findIndex(c => c.menu.id === menu.id && c.temp === null && c.optionExtra === 0);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
          return next;
        }
        if (prev.length >= 3) { alert('더이상 장바구니에 담을 수 없습니다.'); return prev; }
        return [...prev, { menu, temp: null, qty: 1, optionExtra: 0 }];
      });
      return;
    }
    setPopupMenu(menu);
    setPopupTemp('HOT');
    setPopupQty(1);
    setPopupOptions({ size: 'regular', shot: 0, sweetness: null, topping: null });
    setTimer(110);
  };
  const resetOptions = () => {
    setPopupTemp('HOT');
    setPopupOptions({ size: 'regular', shot: 0, sweetness: null, topping: null });
  };

  const addToCart = () => {
    if (!popupMenu) return;
    const newTemp = popupMenu.hasTemp ? popupTemp : null;
    setCart(prev => {
      const idx = prev.findIndex(c => c.menu.id === popupMenu.id && c.temp === newTemp && c.optionExtra === optionExtra);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + popupQty };
        return next;
      }
      if (prev.length >= 3) { alert('더이상 장바구니에 담을 수 없습니다.'); return prev; }
      return [...prev, { menu: popupMenu, temp: newTemp, qty: popupQty, optionExtra }];
    });
    setPopupMenu(null);
  };

  const removeFromCart = (i: number) => setCart(prev => prev.filter((_, idx) => idx !== i));

  const updateQty = (i: number, delta: number) =>
    setCart(prev => prev.map((item, idx) => idx === i ? { ...item, qty: Math.max(1, item.qty + delta) } : item));

  const resetAll = () => {
    setCart([]); setShowOptions(false); setOptionsPhase('review');
    setSelectedPayment(null); setSelectedDiscount(null);
    setShowStampPopup(false); setStampPhone('');
    setShowQRPopup(false); setShowPayPopup(false); setPayFull(false);
    setShowPayConfirm(false); setShowDone(false); setActiveSubTab('추천메뉴');
    setTimer(110);
  };

  const goToCheckout = () => {
    if (cart.length > 0) { setShowOptions(true); setOptionsPhase('review'); }
  };

  const handleNext = () => {
    if (optionsPhase === 'review') setOptionsPhase('payment');
    else if (optionsPhase === 'payment' && selectedPayment) { setStampPhone(''); setShowStampPopup(true); }
  };

  const handleBack = () => {
    if (optionsPhase === 'review') setShowOptions(false);
    else if (optionsPhase === 'payment') setOptionsPhase('review');
  };

  const nextDisabled = optionsPhase === 'payment' && !selectedPayment;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', overflow: 'hidden', fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif', position: 'relative' }}>

      {/* ── 메인 헤더 (노란색) ── */}
      <div style={{ background: Y, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={{ background: '#e6a600', color: '#fff', border: 'none', borderRadius: 6, fontSize: 10, padding: '4px 8px', fontWeight: 700, cursor: 'pointer' }}>
          🏠 처음으로
        </button>
        <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>진흥원 카페</span>
        <button style={{ background: '#fff', color: '#333', border: 'none', borderRadius: 6, fontSize: 10, padding: '4px 8px', fontWeight: 600, cursor: 'pointer' }}>
          🌐 언어
        </button>
      </div>

      {/* ── 카테고리 탭 ── */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: `2px solid ${Y}`, flexShrink: 0 }}>
        {SUB_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveSubTab(tab)} style={{
            flex: 1, textAlign: 'center', padding: '7px 2px', fontSize: 11,
            color: activeSubTab === tab ? Y : '#555', fontWeight: activeSubTab === tab ? 700 : 400,
            border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: `2px solid ${activeSubTab === tab ? Y : 'transparent'}`,
            marginBottom: -2, whiteSpace: 'nowrap',
          }}>{TAB_LABEL[tab]}</button>
        ))}
      </div>

      {/* ── 메뉴 그리드 (4열) ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#eee' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {filteredMenus.map(menu => (
            <button key={menu.id} onClick={() => openPopup(menu)} style={{
              background: '#fff', border: 'none', padding: '8px 5px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
            }}>
              <div style={{ position: 'relative', width: 58, height: 58, borderRadius: 10, background: MENU_IMAGE[menu.id] ? 'none' : menu.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 4, overflow: 'hidden' }}>
                {MENU_IMAGE[menu.id]
                  ? <img src={MENU_IMAGE[menu.id]} alt={menu.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : menu.emoji}
              </div>
              <span style={{ fontSize: 10, color: '#222', fontWeight: 600, textAlign: 'center', lineHeight: 1.3, wordBreak: 'keep-all', marginBottom: 2 }}>{menu.name}</span>
              <span style={{ fontSize: 10, color: '#555' }}>{menu.price.toLocaleString()}원</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 하단 영역 (2분할) ── */}
      <div style={{ display: 'flex', background: '#f7f7f7', borderTop: '2px solid #ddd', flexShrink: 0 }}>

        {/* 왼쪽: 장바구니 테이블 */}
        <div style={{ flex: 3, borderRight: '1px solid #ddd' }}>
          {/* 컬럼 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '5px 6px', background: '#efefef', borderBottom: '1px solid #ddd' }}>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#555', fontWeight: 600 }}>메뉴</div>
            <div style={{ width: 68, textAlign: 'center', fontSize: 11, color: '#555', fontWeight: 600 }}>수량</div>
            <div style={{ width: 50, textAlign: 'center', fontSize: 11, color: '#555', fontWeight: 600 }}>가격</div>
          </div>
          {/* 아이템 목록 */}
          {cart.length === 0 ? (
            <div style={{ padding: '10px 6px', textAlign: 'center', fontSize: 10, color: '#bbb' }}>담은 메뉴가 없습니다</div>
          ) : cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '5px 6px', gap: 4, borderTop: i > 0 ? '1px solid #eee' : undefined }}>
              {/* ✕ 원형 버튼 */}
              <button onClick={() => removeFromCart(i)} style={{
                width: 20, height: 20, borderRadius: '50%', border: `2px solid ${Y}`,
                background: '#fff', color: Y, fontSize: 10, fontWeight: 900,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, lineHeight: 1,
              }}>✕</button>
              {/* 메뉴명 */}
              <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: '#222', lineHeight: 1.3 }}>
                {item.temp ? `(${item.temp}) ` : ''}{item.menu.name}
              </span>
              {/* 수량 조절 */}
              <div style={{ width: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <button onClick={() => updateQty(i, -1)} style={{
                  width: 20, height: 20, borderRadius: '50%', border: 'none',
                  background: BK, color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, flexShrink: 0,
                }}>−</button>
                <span style={{ fontSize: 10, fontWeight: 600, color: Y, minWidth: 18, textAlign: 'center' }}>{item.qty}개</span>
                <button onClick={() => updateQty(i, 1)} style={{
                  width: 20, height: 20, borderRadius: '50%', border: 'none',
                  background: BK, color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, flexShrink: 0,
                }}>+</button>
              </div>
              {/* 가격 */}
              <span style={{ width: 50, textAlign: 'right', fontSize: 10, fontWeight: 600, color: '#333', flexShrink: 0 }}>
                {((item.menu.price + item.optionExtra) * item.qty).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>

        {/* 오른쪽: 타이머 + 전체삭제 + 결제 */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: '6px 8px', gap: 5 }}>
          {/* 타이머 + 전체삭제 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, color: '#777' }}>남은시간</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: Y, lineHeight: 1 }}>{timer}초</div>
            </div>
            <button onClick={resetAll} style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: Y, color: '#fff', fontSize: 9, fontWeight: 700,
              cursor: 'pointer', lineHeight: 1.2,
            }}>전체<br/>삭제</button>
          </div>
          {/* 선택한 상품 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#555' }}>
            <span>선택한 상품</span>
            <strong style={{ color: BK, fontSize: 13 }}>{totalQty}개</strong>
          </div>
          {/* 결제하기 */}
          <button onClick={goToCheckout} style={{
            background: '#1a1a1a', color: Y, border: 'none', borderRadius: 6,
            padding: '8px 4px', cursor: 'pointer', fontSize: 10, fontWeight: 700,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, lineHeight: 1.3,
          }}>
            <span style={{ fontSize: 13 }}>🛒</span>
            <span>{totalPrice.toLocaleString()}원</span>
            <span>결제하기</span>
          </button>
        </div>
      </div>

      {/* ── Options popup (full screen) ── */}
      {popupMenu && (() => {
        const sizeOpts: Array<{ key: 'regular' | 'large'; label: string; icon: string; price: number }> = [
          { key: 'regular', label: '기본', icon: '🥤', price: 0 },
          { key: 'large',   label: '라지', icon: '🧋', price: 500 },
        ];
        const shotOpts: Array<{ v: 0 | 1 | 2; label: string; icon: string; price: number }> = [
          { v: 0, label: '기본',    icon: '☕',     price: 0 },
          { v: 1, label: '1샷 추가', icon: '☕☕',   price: 500 },
          { v: 2, label: '2샷 추가', icon: '☕☕☕', price: 1000 },
        ];
        const sweetnessOpts: Array<{ v: null | '연유' | '스테비아'; label: string; icon: string; price: number }> = [
          { v: null,      label: '보통',       icon: '😐', price: 0 },
          { v: '연유',    label: '연유 추가',   icon: '🍯', price: 700 },
          { v: '스테비아', label: '스테비아 추가', icon: '🌿', price: 600 },
        ];
        const toppingOpts: Array<{ v: null | '휘핑' | '펄'; label: string; icon: string; price: number }> = [
          { v: null,  label: '없음',     icon: '🚫', price: 0 },
          { v: '휘핑', label: '휘핑 추가', icon: '🍦', price: 500 },
          { v: '펄',  label: '펄 추가',  icon: '🧋', price: 700 },
        ];
        const badgeStyle: React.CSSProperties = {
          background: '#FFD600', color: '#333', fontSize: 8, fontWeight: 700,
          borderRadius: 4, padding: '3px 4px', writingMode: 'vertical-lr',
          textOrientation: 'upright', letterSpacing: 1, alignSelf: 'center', flexShrink: 0,
        };
        const optCard = (selected: boolean, onClick: () => void, icon: string, label: string, price: number) => (
          <button onClick={onClick} style={{
            border: `1.5px solid ${selected ? '#FFD600' : '#e0e0e0'}`,
            borderRadius: 10, padding: 7,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            minWidth: 72, cursor: 'pointer', background: selected ? '#fff9c4' : '#fff', outline: 'none',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
            <span style={{ fontSize: 9, color: '#333', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
            <span style={{ fontSize: 9, color: price === 0 ? '#2ecc71' : '#888', fontWeight: 500 }}>{price === 0 ? '+0원' : `+${price.toLocaleString()}원`}</span>
          </button>
        );
        return (
          <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 100, display: 'flex', flexDirection: 'column' }}>

            {/* 헤더 */}
            <div style={{ background: '#FFD600', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#222' }}>선택하신 상품의 옵션을 모두 선택해주세요</span>
              <button onClick={() => setPopupMenu(null)} style={{ width: 24, height: 24, background: '#e6b800', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#333', cursor: 'pointer' }}>✕</button>
            </div>

            {/* 상품 정보 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
              <div style={{ width: 50, height: 50, borderRadius: 8, background: MENU_IMAGE[popupMenu.id] ? 'none' : popupMenu.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                {MENU_IMAGE[popupMenu.id]
                  ? <img src={MENU_IMAGE[popupMenu.id]} alt={popupMenu.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : popupMenu.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#222' }}>
                  {popupMenu.hasTemp ? `(${popupTemp}) ` : ''}{popupMenu.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 900, color: '#FF6600' }}>
                  {popupPrice.toLocaleString()}원
                  {optionExtra > 0 && <span style={{ fontSize: 10, color: '#aaa', fontWeight: 400, marginLeft: 4 }}>옵션 +{optionExtra.toLocaleString()}원</span>}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setPopupQty(q => Math.max(1, q - 1))} style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${BK}`, background: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{popupQty}</span>
                <button onClick={() => setPopupQty(q => q + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${BK}`, background: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }}>+</button>
              </div>
            </div>

            {/* 선택된 옵션 바 */}
            <div style={{ margin: '6px 12px', background: '#FFF9C4', border: '1.5px solid #FFD600', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: 10, color: '#888' }}>선택된 옵션: </span>
                <span style={{ fontSize: 10, color: '#333', fontWeight: 600 }}>{selectedOptionsText}</span>
              </div>
              <button onClick={resetOptions} style={{ background: '#333', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 5, padding: '3px 8px', border: 'none', cursor: 'pointer' }}>↺ 초기화</button>
            </div>

            {/* 옵션 목록 */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>

              {/* HOT / ICE */}
              {popupMenu.hasTemp && (
                <div style={{ marginBottom: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#222', padding: '6px 12px 4px', margin: 0 }}>HOT / ICE 선택</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0 12px 4px' }}>
                    <div style={badgeStyle}>선택옵션</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['ICE', 'HOT'] as Temp[]).map(t => (
                        <button key={t} onClick={() => setPopupTemp(t)} style={{
                          border: `1.5px solid ${popupTemp === t ? (t === 'ICE' ? '#3a9bd5' : '#e74c3c') : '#e0e0e0'}`,
                          borderRadius: 10, padding: 7,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                          minWidth: 72, cursor: 'pointer', background: popupTemp === t ? (t === 'ICE' ? '#e8f4fd' : '#fdf0ef') : '#fff', outline: 'none',
                        }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: t === 'ICE' ? '#d6eaf8' : '#fde8e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                            {t === 'ICE' ? '🧊' : '♨️'}
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: t === 'ICE' ? '#2980b9' : '#c0392b' }}>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 사이즈 */}
              <div style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#222', padding: '6px 12px 4px', margin: 0 }}>사이즈 선택</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0 12px 4px' }}>
                  <div style={badgeStyle}>선택옵션</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {sizeOpts.map(s => optCard(popupOptions.size === s.key, () => setPopupOptions(o => ({ ...o, size: s.key })), s.icon, s.label, s.price))}
                  </div>
                </div>
              </div>

              {/* 샷 */}
              <div style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#222', padding: '6px 12px 4px', margin: 0 }}>샷 추가</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0 12px 4px' }}>
                  <div style={badgeStyle}>선택옵션</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {shotOpts.map(s => optCard(popupOptions.shot === s.v, () => setPopupOptions(o => ({ ...o, shot: s.v })), s.icon, s.label, s.price))}
                  </div>
                </div>
              </div>

              {/* 당도 */}
              <div style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#222', padding: '6px 12px 4px', margin: 0 }}>당도 선택</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0 12px 4px' }}>
                  <div style={badgeStyle}>선택옵션</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {sweetnessOpts.map(s => optCard(popupOptions.sweetness === s.v, () => setPopupOptions(o => ({ ...o, sweetness: s.v })), s.icon, s.label, s.price))}
                  </div>
                </div>
              </div>

              {/* 토핑 */}
              <div style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#222', padding: '6px 12px 4px', margin: 0 }}>토핑 선택</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0 12px 4px' }}>
                  <div style={badgeStyle}>선택옵션</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {toppingOpts.map(s => optCard(popupOptions.topping === s.v, () => setPopupOptions(o => ({ ...o, topping: s.v })), s.icon, s.label, s.price))}
                  </div>
                </div>
              </div>

            </div>

            {/* 하단 버튼 */}
            <div style={{ display: 'flex', borderTop: '1px solid #ddd', flexShrink: 0 }}>
              <button onClick={() => setPopupMenu(null)} style={{ flex: 1, background: '#222', color: '#fff', fontSize: 13, fontWeight: 700, padding: '14px 0', border: 'none', cursor: 'pointer' }}>취소</button>
              <button onClick={addToCart} style={{ flex: 1, background: Y, color: '#fff', fontSize: 13, fontWeight: 700, padding: '14px 0', border: 'none', cursor: 'pointer' }}>주문담기</button>
            </div>
          </div>
        );
      })()}

      {/* ── Options panel ── */}
      {showOptions && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: Y, padding: '14px 16px', flexShrink: 0 }}>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 900, textAlign: 'center', color: BK }}>진흥원 카페</h1>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

            {optionsPhase === 'review' && (
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: BK }}>주문 내역</p>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: 34 }}>{item.menu.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{item.menu.name}{item.temp ? ` (${item.temp})` : ''}</p>
                      <p style={{ margin: '2px 0 0', color: '#FF3300', fontSize: 13, fontWeight: 700 }}>{(item.menu.price * item.qty).toLocaleString()}원</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(i, -1)} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${BK}`, background: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>−</button>
                      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(i, 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${BK}`, background: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(i)} style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>삭제</button>
                  </div>
                ))}
              </div>
            )}

            {optionsPhase === 'payment' && (() => {
              const stepBadge = (n: number, text: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ background: Y, color: BK, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>STEP{n}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#222' }}>{text}</span>
                </div>
              );
              const markBadge = (mc: string, mt: string) => {
                const s = MARK_STYLE[mc] ?? MARK_STYLE.gray;
                return (
                  <span style={{ background: s.bg, color: s.color, fontSize: 8, fontWeight: 700, padding: '2px 4px', borderRadius: 3, flexShrink: 0, whiteSpace: 'nowrap' }}>{mt}</span>
                );
              };
              const smallTile = (mc: string, mt: string, main: string, sub: string | undefined, selected: boolean, onClick: () => void) => (
                <button onClick={onClick} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '6px 3px', border: `1.5px solid ${selected ? Y : '#e0e0e0'}`,
                  borderRadius: 7, background: selected ? '#fffbe6' : '#fff',
                  cursor: 'pointer', textAlign: 'center',
                }}>
                  {markBadge(mc, mt)}
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#222', lineHeight: 1.3, wordBreak: 'keep-all' }}>{main}</span>
                  {sub && <span style={{ fontSize: 8, color: '#888', lineHeight: 1.2 }}>{sub}</span>}
                </button>
              );
              return (
                <div>
                  {stepBadge( 1, '결제수단을 선택해주세요.')}

                  {/* Hero row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    {[
                      { name: '카드결제', sub: '삼성페이 / 애플페이', icon: (
                        <svg viewBox="0 0 92 64" width={60} height={42}>
                          <rect x="14" y="14" width="62" height="42" rx="5" fill="#F0C14B" stroke="#B8862A" strokeWidth="1.5"/>
                          <rect x="22" y="22" width="14" height="10" rx="2" fill="#B8862A"/>
                          <rect x="22" y="42" width="42" height="3" rx="1.5" fill="#B8862A" opacity=".4"/>
                          <rect x="6" y="6" width="62" height="42" rx="5" fill="#F4D27A" stroke="#B8862A" strokeWidth="1.5"/>
                          <rect x="14" y="14" width="14" height="10" rx="2" fill="#B8862A"/>
                          <rect x="14" y="34" width="42" height="3" rx="1.5" fill="#B8862A" opacity=".4"/>
                        </svg>
                      )},
                      { name: '앱카드', sub: 'QR / 바코드', icon: (
                        <svg viewBox="0 0 92 64" width={60} height={42}>
                          <rect x="30" y="4" width="34" height="56" rx="6" fill="#E8EAF0" stroke="#9DA3B2" strokeWidth="1.5"/>
                          <rect x="34" y="22" width="26" height="18" rx="2.5" fill="#F0C14B" stroke="#B8862A" strokeWidth="1"/>
                          <rect x="36" y="26" width="6" height="4" rx="1" fill="#B8862A"/>
                          <rect x="36" y="34" width="18" height="2" rx="1" fill="#B8862A" opacity=".5"/>
                          <circle cx="47" cy="54" r="2" fill="#9DA3B2"/>
                        </svg>
                      )},
                    ].map(({ name, sub, icon }) => (
                      <button key={name} onClick={() => setSelectedPayment(name)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '10px 6px', border: `2px solid ${selectedPayment === name ? Y : '#e0e0e0'}`,
                        borderRadius: 10, background: selectedPayment === name ? '#fffbe6' : '#fff',
                        cursor: 'pointer',
                      }}>
                        {icon}
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>{name}</span>
                        <span style={{ fontSize: 9, color: '#888' }}>{sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Brand rows */}
                  {[PAY_ROW, BANK_ROW].map((row, ri) => (
                    <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginBottom: 6 }}>
                      {row.map((t, i) => smallTile(t.markColor, t.markText, t.main, (t as {sub?: string}).sub, selectedPayment === `${ri}-${i}-${t.main}`, () => setSelectedPayment(`${ri}-${i}-${t.main}`)))}
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 6 }}>
                    {GIFT_ROW.map((t, i) => smallTile(t.markColor, t.markText, t.main, (t as {sub?: string}).sub, selectedPayment === `gift-${i}-${t.main}`, () => setSelectedPayment(`gift-${i}-${t.main}`)))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom result area */}
          <div style={{ background: '#f8f8f8', borderTop: '1px solid #e0e0e0', padding: '10px 16px', flexShrink: 0 }}>
            {optionsPhase === 'payment' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>주문금액 <strong style={{ color: BK }}>{totalPrice.toLocaleString()}원</strong></span>
                  <span style={{ fontSize: 12, color: '#666' }}>결제할 금액: <strong style={{ color: '#FF3300' }}>{totalPrice.toLocaleString()}원</strong></span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
                <span>결제 금액</span><span>{totalPrice.toLocaleString()}원</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={resetAll} style={{ flex: 1, padding: '12px 0', borderRadius: 9, border: 'none', background: '#e53e3e', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>전체취소</button>
              <button onClick={handleBack} style={{ flex: 1, padding: '12px 0', borderRadius: 9, border: `2px solid ${BK}`, background: '#fff', color: BK, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>이전</button>
              <button onClick={handleNext} disabled={nextDisabled} style={{ flex: 1, padding: '12px 0', borderRadius: 9, border: 'none', background: nextDisabled ? '#ccc' : Y, color: nextDisabled ? '#fff' : BK, fontSize: 13, fontWeight: 700, cursor: nextDisabled ? 'default' : 'pointer' }}>다음</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 스탬프 적립 팝업 ── */}
      {showStampPopup && (() => {
        const goToPay = () => {
          setShowStampPopup(false);
          if (selectedPayment === '카드결제') setShowPayPopup(true);
          else setShowQRPopup(true);
        };
        const pressKey = (key: string) => {
          if (key === '←') { setStampPhone(p => p.slice(0, -1)); return; }
          if (key === '010') { setStampPhone(''); return; }
          if (stampPhone.length < 8) setStampPhone(p => p + key);
        };
        const displayNum = '010-' + stampPhone.slice(0, 4) + (stampPhone.length > 4 ? '-' + stampPhone.slice(4) : '');
        const keys = ['1','2','3','4','5','6','7','8','9','010','0','←'];
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 340 }}>

              {/* 헤더 */}
              <div style={{ background: Y, padding: '14px 16px 10px', position: 'relative', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: BK }}>스탬프 적립</p>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: '#444' }}>앱 가입 시 적립된 스탬프 확인 및 사용 가능</p>
                <button onClick={goToPay} style={{
                  position: 'absolute', top: 10, right: 12,
                  width: 30, height: 30, borderRadius: '50%',
                  background: BK, border: 'none', color: '#fff',
                  fontSize: 15, fontWeight: 900, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>

              {/* 번호 표시 */}
              <div style={{ padding: '16px 20px 10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: BK, letterSpacing: 2 }}>{displayNum}</p>
              </div>

              {/* 숫자 패드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid #eee', borderLeft: '1px solid #eee', margin: '0 0 0 0' }}>
                {keys.map(k => (
                  <button key={k} onClick={() => pressKey(k)} style={{
                    padding: '18px 0', fontSize: k === '←' ? 18 : 22, fontWeight: 600,
                    color: k === '←' ? '#888' : BK,
                    background: '#fff', border: 'none',
                    borderRight: '1px solid #eee', borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                  }}>{k}</button>
                ))}
              </div>

              {/* 적립 버튼 */}
              <div style={{ padding: '12px 16px 6px' }}>
                <button onClick={goToPay} style={{
                  width: '100%', padding: '15px 0', borderRadius: 8, border: 'none',
                  background: '#FF9500', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
                }}>적립</button>
              </div>

              {/* 안내 문구 */}
              <p style={{ margin: '0 0 14px', padding: '0 16px', fontSize: 10, color: '#888', textAlign: 'center', lineHeight: 1.6 }}>
                입력하신 번호는 스탬프 적립, 혜택 제공을 위해 수집 이용됩니다.<br/>
                APP 회원가입 시, 동일한 번호의 스탬프 이력이 자동 연동됩니다.<br/>
                스탬프 적립 후 6개월간 미사용 시 수집 정보는 자동 삭제됩니다.
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── QR 팝업 ── */}
      {showQRPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 320 }}>

            {/* 헤더 */}
            <div style={{ background: Y, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: BK }}>{selectedPayment}</h2>
              <button onClick={() => { setShowQRPopup(false); setShowPayConfirm(true); }} style={{ background: BK, border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>✕</button>
            </div>

            {/* 금액 */}
            <div style={{ padding: '14px 20px 8px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>결제 금액</p>
              <p style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 900, color: '#e63946' }}>{totalPrice.toLocaleString()}원</p>
            </div>

            {/* QR 코드 영역 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 20px 16px', gap: 12 }}>
              {/* QR SVG */}
              <div style={{ width: 160, height: 160, border: '2px solid #eee', borderRadius: 10, padding: 10, background: '#fff' }}>
                <svg viewBox="0 0 21 21" width="100%" height="100%" shapeRendering="crispEdges">
                  {[
                    '111111101101001111111',
                    '100000100010101000001',
                    '101110101001001011101',
                    '101110100110001011101',
                    '101110101011101011101',
                    '100000100100001000001',
                    '111111101010111111111',
                    '000000001101000000000',
                    '101011110100101001010',
                    '010100000010010110101',
                    '110010111001001001010',
                    '001001000110100100101',
                    '100100101000010010010',
                    '010010000101001011001',
                    '111111100010000100100',
                    '100000101101011010010',
                    '101110100010100101101',
                    '101110101001001000110',
                    '101110100110110110001',
                    '100000101000000001100',
                    '111111100110101010010',
                  ].map((row, r) =>
                    row.split('').map((cell, c) =>
                      cell === '1' ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={BK} /> : null
                    )
                  )}
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#222' }}>QR 코드를 스캔해주세요</p>
              <p style={{ margin: 0, fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 1.5 }}>앱을 열어 QR 코드를 카메라로 스캔하시거나<br/>화면에 기기를 가까이 대주세요.</p>
              <p style={{ margin: 0, fontSize: 10, color: '#e53e3e' }}>※ 키오스크 연습용입니다. 실제로 결제되지 않습니다.</p>
            </div>

            {/* 확인 버튼 */}
            <div style={{ padding: '0 16px 16px' }}>
              <button onClick={() => { setShowQRPopup(false); setShowPayConfirm(true); }} style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: Y, color: BK, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay popup (카드 결제) ── */}
      {showPayPopup && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 200, display: 'flex', flexDirection: 'column' }}>

          {/* 헤더 */}
          <div style={{ background: Y, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: BK, lineHeight: 1 }}>카드 결제 (간편 결제)</h1>
            <button onClick={() => { setShowPayPopup(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <svg viewBox="0 0 24 24" width={20} height={20} stroke={BK} strokeWidth={2.5} fill="none" strokeLinecap="round">
                <path d="M6 6 L18 18 M18 6 L6 18"/>
              </svg>
            </button>
          </div>

          {/* 바디 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>

            {/* Info rows */}
            <div style={{ borderBottom: '1px solid #eee' }}>
              {[
                { k: '총 결제금액', v: `${totalPrice.toLocaleString()}원`, bold: true, color: '#e63946' },
                { k: '할부개월',   v: '일시불' },
                { k: '카드번호',   v: '' },
              ].map(({ k, v, bold, color }) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderTop: '1px solid #eee' }}>
                  <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: color ?? '#333' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: 10, margin: '14px 0' }}>
              <button onClick={() => setShowPayPopup(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: `2px solid ${BK}`, background: '#fff', color: BK, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>취소</button>
              <button onClick={() => { setShowPayPopup(false); setShowPayConfirm(true); }} style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: 'none', background: Y, color: BK, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>승인 요청</button>
            </div>

            {/* 안내 문구 */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#222' }}>다음 그림과 같이 신용/체크카드를 넣어주세요.</p>
              <p style={{ margin: 0, fontSize: 11, color: '#888', lineHeight: 1.5 }}>(삼성페이는 카드 리더기에, 애플페이는 NFC 리더기에 휴대폰을 터치해주세요.)</p>
            </div>

            {/* 일러스트 */}
            <div style={{ background: '#f4f5f7', borderRadius: 14, padding: '14px 12px', position: 'relative' }}>

              <svg viewBox="0 0 280 205" width="100%" height="100%">
                <defs>
                  <linearGradient id="crdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#283593"/>
                    <stop offset="100%" stopColor="#5c6bc0"/>
                  </linearGradient>
                </defs>
                {/* 리더기 상단면 (3D 깊이감) */}
                <rect x="58" y="18" width="164" height="28" rx="16" fill="#dde0e8" stroke="#1a1a1a" strokeWidth="2"/>
                {/* 리더기 전면 본체 */}
                <rect x="58" y="38" width="164" height="66" rx="14" fill="#f5f5f7" stroke="#1a1a1a" strokeWidth="2.5"/>
                {/* 카드 슬롯 (pill 형태) */}
                <rect x="74" y="63" width="120" height="15" rx="7.5" fill="#1a1a1a"/>
                <line x1="79" y1="67" x2="190" y2="67" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="79" y1="74" x2="190" y2="74" stroke="#444" strokeWidth="0.8" strokeLinecap="round"/>
                {/* LED 표시등 */}
                <circle cx="210" cy="52" r="5.5" fill="#e53e3e"/>
                <circle cx="210" cy="52" r="3" fill="#fc8181" opacity="0.7"/>
                {/* 카드 본체 (사다리꼴 — 아래에서 위로 삽입, 위쪽이 좁고 아래가 넓음) */}
                <polygon points="105,92 175,92 220,198 60,198" fill="url(#crdGrad)"/>
                {/* 카드 상단 하이라이트 */}
                <line x1="105" y1="92" x2="175" y2="92" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
                {/* 칩 */}
                <rect x="128" y="104" width="24" height="17" rx="2.5" fill="rgba(255,255,255,0.55)"/>
                <line x1="128" y1="110" x2="152" y2="110" stroke="rgba(255,255,255,0.85)" strokeWidth="1"/>
                <line x1="128" y1="116" x2="152" y2="116" stroke="rgba(255,255,255,0.85)" strokeWidth="1"/>
                <line x1="135" y1="104" x2="135" y2="121" stroke="rgba(255,255,255,0.85)" strokeWidth="1"/>
                <line x1="145" y1="104" x2="145" y2="121" stroke="rgba(255,255,255,0.85)" strokeWidth="1"/>
                {/* 빨간 위쪽 화살표 */}
                <polygon points="235,130 248,155 241,155 241,182 229,182 229,155 222,155" fill="#e53e3e"/>
              </svg>
            </div>

            <p style={{ margin: '12px 0 0', fontSize: 11, color: '#e53e3e' }}>※ 키오스크 연습용입니다. 실제로 결제되지 않습니다.</p>
          </div>
        </div>
      )}

      {/* ── Pay confirm popup ── */}
      {showPayConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '24px 20px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6, margin: '0 0 12px' }}>
              결제 금액 : {totalPrice.toLocaleString()}원<br />
              결제가 정상적으로 처리되었습니다.
            </p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>영수증을 출력 하시겠습니까?</p>
            <div style={{ background: '#f5f5f5', borderRadius: 9, padding: '10px 14px', marginBottom: 12, fontSize: 14, color: '#555', textAlign: 'left' }}>
              예 : 출력&nbsp;&nbsp;/&nbsp;&nbsp;아니오 : 미출력
            </div>
            <p style={{ fontSize: 12, color: '#e53e3e', margin: '0 0 16px' }}>※ 키오스크 연습용입니다. 실제로 결제되지 않습니다.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowPayConfirm(false); setShowDone(true); }} style={{ flex: 1, padding: '13px 0', borderRadius: 9, border: 'none', background: Y, color: BK, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>예</button>
              <button onClick={() => { setShowPayConfirm(false); setShowDone(true); }} style={{ flex: 1, padding: '13px 0', borderRadius: 9, border: `2px solid ${BK}`, background: '#fff', color: BK, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>아니오</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Done popup ── */}
      {showDone && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 20px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <div style={{ background: Y, borderRadius: 12, padding: '10px 20px', marginBottom: 16, display: 'inline-block' }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: BK }}>결제 완료!</h2>
            </div>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 4px' }}>대기번호</p>
            <p style={{ fontSize: 64, fontWeight: 700, color: BK, margin: '0 0 14px', lineHeight: 1 }}>{orderNumber}</p>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>영수증 출력이 완료될 때까지 기다려 주세요.</p>
            <p style={{ fontSize: 12, color: '#999', lineHeight: 1.5, margin: '0 0 24px' }}>
              상품제조가 완료되어 대기번호가 호출되면<br />픽업대로 오시기 바랍니다. 감사합니다.
            </p>
            <button onClick={() => { resetAll(); navigate('/'); }} style={{ width: '100%', padding: '16px 0', borderRadius: 10, border: 'none', background: Y, color: BK, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
              홈으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

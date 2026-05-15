import { useState } from "react";
import { useNavigate } from "react-router";

type Tab = '추천메뉴' | '커피' | '에이드/주스' | '티' | '디저트';
type Temp = 'HOT' | 'ICE';
type OptionsPhase = 'review' | 'stamp' | 'payment';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  emoji: string;
  hasTemp: boolean;
  tabs: Tab[];
}

interface CartItem {
  menu: MenuItem;
  temp: Temp | null;
  qty: number;
}

const MENUS: MenuItem[] = [
  { id: 1,  name: '아메리카노',   price: 2500, emoji: '☕', hasTemp: true,  tabs: ['추천메뉴', '커피'] },
  { id: 2,  name: '카페라떼',     price: 3900, emoji: '🥛', hasTemp: true,  tabs: ['추천메뉴', '커피'] },
  { id: 3,  name: '카페모카',     price: 4500, emoji: '☕', hasTemp: true,  tabs: ['추천메뉴', '커피'] },
  { id: 4,  name: '자몽에이드',   price: 4500, emoji: '🍊', hasTemp: false, tabs: ['추천메뉴', '에이드/주스'] },
  { id: 5,  name: '망고에이드',   price: 4500, emoji: '🥭', hasTemp: false, tabs: ['추천메뉴', '에이드/주스'] },
  { id: 6,  name: '키위주스',     price: 4800, emoji: '🥝', hasTemp: false, tabs: ['추천메뉴', '에이드/주스'] },
  { id: 7,  name: '페퍼민트',     price: 3500, emoji: '🌿', hasTemp: true,  tabs: ['추천메뉴', '티'] },
  { id: 8,  name: '캐모마일',     price: 3500, emoji: '🌼', hasTemp: true,  tabs: ['추천메뉴', '티'] },
  { id: 9,  name: '복숭아티',     price: 3500, emoji: '🍑', hasTemp: true,  tabs: ['추천메뉴', '티'] },
  { id: 10, name: '생크림케이크', price: 3500, emoji: '🍰', hasTemp: false, tabs: ['추천메뉴', '디저트'] },
  { id: 11, name: '크루와상',     price: 4000, emoji: '🥐', hasTemp: false, tabs: ['추천메뉴', '디저트'] },
  { id: 12, name: '와플',         price: 2500, emoji: '🧇', hasTemp: false, tabs: ['추천메뉴', '디저트'] },
];

const TABS: Tab[] = ['추천메뉴', '커피', '에이드/주스', '티', '디저트'];
const PAYMENT_METHODS = ['신용카드', '체크카드', '카카오페이', '네이버페이', '삼성페이', '현금'];

const Y = '#FFCC00';
const BK = '#111111';

export default function CafePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('추천메뉴');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [popupMenu, setPopupMenu] = useState<MenuItem | null>(null);
  const [popupTemp, setPopupTemp] = useState<Temp>('HOT');
  const [popupQty, setPopupQty] = useState(1);

  const [showOptions, setShowOptions] = useState(false);
  const [optionsPhase, setOptionsPhase] = useState<OptionsPhase>('review');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const [showPayPopup, setShowPayPopup] = useState(false);
  const [payFull, setPayFull] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const [orderNumber] = useState(() => Math.floor(Math.random() * 900) + 100);

  const totalPrice = cart.reduce((sum, item) => sum + item.menu.price * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const filteredMenus = MENUS.filter(m => m.tabs.includes(activeTab));
  const popupPrice = popupMenu ? popupMenu.price * popupQty : 0;

  const openPopup = (menu: MenuItem) => { setPopupMenu(menu); setPopupTemp('HOT'); setPopupQty(1); };

  const addToCart = () => {
    if (!popupMenu) return;
    if (cart.length >= 3) { alert('더이상 장바구니에 담을 수 없습니다.'); return; }
    setCart(prev => [...prev, { menu: popupMenu, temp: popupMenu.hasTemp ? popupTemp : null, qty: popupQty }]);
    setPopupMenu(null);
  };

  const removeFromCart = (i: number) => setCart(prev => prev.filter((_, idx) => idx !== i));

  const updateQty = (i: number, delta: number) =>
    setCart(prev => prev.map((item, idx) => idx === i ? { ...item, qty: Math.max(1, item.qty + delta) } : item));

  const resetAll = () => {
    setCart([]); setShowOptions(false); setOptionsPhase('review');
    setSelectedPayment(null); setShowPayPopup(false); setPayFull(false);
    setShowPayConfirm(false); setShowDone(false); setActiveTab('추천메뉴');
  };

  const handleNext = () => {
    if (optionsPhase === 'review') setOptionsPhase('stamp');
    else if (optionsPhase === 'stamp') setOptionsPhase('payment');
    else if (optionsPhase === 'payment' && selectedPayment) setShowPayPopup(true);
  };

  const handleBack = () => {
    if (optionsPhase === 'review') setShowOptions(false);
    else if (optionsPhase === 'stamp') setOptionsPhase('review');
    else if (optionsPhase === 'payment') setOptionsPhase('stamp');
  };

  const nextDisabled = optionsPhase === 'payment' && !selectedPayment;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100svh', background: Y, overflow: 'hidden', fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif', position: 'relative' }}>

      {/* ── Header ── */}
      <header style={{ background: Y, display: 'flex', alignItems: 'center', padding: '10px 14px 4px', flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, padding: 2, lineHeight: 1 }}>🏠</button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 900, margin: 0, color: BK, letterSpacing: -0.5 }}>진흥원 카페</h1>
        <div style={{ width: 34 }} />
      </header>

      {/* ── Tab pills ── */}
      <div style={{ padding: '4px 10px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            borderRadius: 20, padding: '7px 14px',
            background: activeTab === tab ? BK : '#fff',
            color: activeTab === tab ? '#fff' : BK,
            border: `2px solid ${BK}`,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{tab}</button>
        ))}
      </div>

      {/* ── Menu grid ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 6px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {filteredMenus.map(menu => (
            <button key={menu.id} onClick={() => openPopup(menu)} style={{
              background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4,
              padding: '14px 6px 12px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, cursor: 'pointer',
            }}>
              <span style={{ fontSize: 44 }}>{menu.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: BK, textAlign: 'center', lineHeight: 1.3, wordBreak: 'keep-all' }}>{menu.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#FF3300' }}>{menu.price.toLocaleString()}원</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom panel ── */}
      <div style={{ background: Y, padding: '8px 8px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>

          {/* Left: cart items */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: 10, minHeight: 112, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#bbb', fontSize: 13, margin: 0, fontWeight: 600 }}>메뉴를 선택해 주세요</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 22 }}>{item.menu.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{item.menu.name}</span>
                      {item.temp && <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>({item.temp})</span>}
                    </div>
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 700 }}>{item.qty}개</span>
                    <button onClick={() => removeFromCart(i)} style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 3, fontSize: 13, width: 20, height: 20, cursor: 'pointer', fontWeight: 700, lineHeight: '20px', padding: 0, textAlign: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: info + button */}
          <div style={{ width: 148, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: BK }}>
                선택한 상품 <strong>{totalQty}</strong>개
              </span>
              <button onClick={resetAll} style={{ background: '#FF3333', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 9, fontWeight: 700, cursor: 'pointer', lineHeight: 1.2, textAlign: 'center' }}>
                전체<br />삭제
              </button>
            </div>
            <div style={{ height: 1, background: 'rgba(0,0,0,0.18)' }} />
            <button
              onClick={() => { if (cart.length > 0) { setShowOptions(true); setOptionsPhase('review'); } }}
              style={{
                flex: 1,
                background: cart.length > 0 ? '#222' : '#666',
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: cart.length > 0 ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                padding: '8px 0',
              }}
            >
              <span style={{ fontSize: 20 }}>🛒</span>
              <span style={{ fontSize: 15, fontWeight: 900 }}>{totalPrice.toLocaleString()}원</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>결제하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu popup (bottom sheet) ── */}
      {popupMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setPopupMenu(null)}>
          <div style={{ width: '100%', background: '#fff', borderRadius: '18px 18px 0 0', padding: '24px 20px 32px' }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ fontSize: 56 }}>{popupMenu.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: BK }}>{popupMenu.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: '#FF3300' }}>{popupPrice.toLocaleString()}원</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setPopupQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${BK}`, background: '#fff', fontSize: 20, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }}>−</button>
                <span style={{ fontSize: 18, fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{popupQty}</span>
                <button onClick={() => setPopupQty(q => q + 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${BK}`, background: '#fff', fontSize: 20, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }}>+</button>
              </div>
            </div>

            {popupMenu.hasTemp && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                {(['HOT', 'ICE'] as Temp[]).map(t => (
                  <button key={t} onClick={() => setPopupTemp(t)} style={{
                    flex: 1, padding: '13px 0', borderRadius: 10, border: '2px solid',
                    borderColor: popupTemp === t ? (t === 'HOT' ? '#c53030' : '#2b6cb0') : '#e0e0e0',
                    background: popupTemp === t ? (t === 'HOT' ? '#fff5f5' : '#ebf8ff') : '#fff',
                    color: popupTemp === t ? (t === 'HOT' ? '#c53030' : '#2b6cb0') : '#999',
                    fontSize: 17, fontWeight: 700, cursor: 'pointer',
                  }}>{t}</button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPopupMenu(null)} style={{ flex: 1, padding: '15px 0', borderRadius: 10, border: `2px solid ${BK}`, background: '#fff', color: BK, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>취소</button>
              <button onClick={addToCart} style={{ flex: 2, padding: '15px 0', borderRadius: 10, border: 'none', background: Y, color: BK, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>선택완료</button>
            </div>
          </div>
        </div>
      )}

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

            {optionsPhase === 'stamp' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, background: Y, padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>Step 1.</span>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>적립하시겠습니까?</p>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.5 }}>
                  회원이시면 [번호조회]를 회원이 아니시면 [회원가입]을 선택해 주시고,<br />
                  원하지 않으시면 다음으로 이동해주세요.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {['번호조회', '회원가입', '건너뛰기'].map(opt => (
                    <button key={opt} style={{ padding: '22px 4px', borderRadius: 12, border: `2px solid ${BK}`, background: '#fff', color: BK, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{opt}</button>
                  ))}
                </div>
                <p style={{ marginTop: 14, fontSize: 12, color: '#e53e3e', fontWeight: 600 }}>
                  ※ 키오스크 연습용입니다. 학습자 정보가 조회되지 않습니다.
                </p>
              </div>
            )}

            {optionsPhase === 'payment' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, background: Y, padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>Step 2.</span>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, marginTop: 0 }}>결제방식을 선택해 주세요!</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm} onClick={() => setSelectedPayment(pm)} style={{
                      padding: '22px 0', borderRadius: 12,
                      border: `2px solid ${selectedPayment === pm ? BK : '#e0e0e0'}`,
                      background: selectedPayment === pm ? Y : '#fff',
                      color: BK, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                    }}>{pm}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom result area */}
          <div style={{ background: '#f8f8f8', borderTop: '1px solid #e0e0e0', padding: '12px 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 13, color: '#666' }}>
              <span>주문 금액</span><span style={{ color: '#FF3300', fontWeight: 700 }}>{totalPrice.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 13, color: '#666' }}>
              <span>할인 금액</span><span style={{ color: '#3182ce', fontWeight: 700 }}>0원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, fontWeight: 700 }}>
              <span>결제 금액</span><span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={resetAll} style={{ flex: 1, padding: '13px 0', borderRadius: 9, border: 'none', background: '#e53e3e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>전체취소</button>
              <button onClick={handleBack} style={{ flex: 1, padding: '13px 0', borderRadius: 9, border: `2px solid ${BK}`, background: '#fff', color: BK, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>이전</button>
              <button onClick={handleNext} disabled={nextDisabled} style={{ flex: 1, padding: '13px 0', borderRadius: 9, border: 'none', background: nextDisabled ? '#ccc' : Y, color: nextDisabled ? '#fff' : BK, fontSize: 14, fontWeight: 700, cursor: nextDisabled ? 'default' : 'pointer' }}>다음</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay popup ── */}
      {showPayPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '24px 20px', width: '100%', maxWidth: 340 }}>
            <div style={{ background: Y, borderRadius: 10, padding: '6px 16px', marginBottom: 14, display: 'inline-block' }}>
              <h2 style={{ color: BK, fontSize: 18, fontWeight: 700, margin: 0 }}>카드결제</h2>
            </div>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 16px' }}>결제할 금액을 선택해 주세요.</p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ background: '#f5f5f5', borderRadius: 9, padding: '10px 14px', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>남은 금액</p>
                  <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700 }}>{totalPrice.toLocaleString()}원</p>
                </div>
                <div style={{ background: '#f5f5f5', borderRadius: 9, padding: '10px 14px' }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>결제 금액</p>
                  <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: payFull ? '#FF3300' : '#bbb' }}>
                    {payFull ? totalPrice.toLocaleString() : '0'}원
                  </p>
                </div>
              </div>
              <button onClick={() => setPayFull(true)} style={{
                padding: '0 14px', borderRadius: 9, cursor: 'pointer',
                border: `2px solid ${payFull ? BK : '#ddd'}`,
                background: payFull ? Y : '#fff',
                color: BK, fontSize: 13, fontWeight: 700, lineHeight: 1.4, textAlign: 'center',
              }}>남은<br />금액<br />전체</button>
            </div>

            <p style={{ fontSize: 12, color: '#e53e3e', margin: '0 0 14px' }}>※ 키오스크 연습용입니다. 실제로 결제되지 않습니다.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowPayPopup(false); setPayFull(false); }} style={{ flex: 1, padding: '13px 0', borderRadius: 9, border: `2px solid ${BK}`, background: '#fff', color: BK, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>취소</button>
              <button onClick={() => { if (!payFull) { setPayFull(true); return; } setShowPayPopup(false); setShowPayConfirm(true); }} style={{ flex: 1, padding: '13px 0', borderRadius: 9, border: 'none', background: Y, color: BK, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>선택완료</button>
            </div>
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

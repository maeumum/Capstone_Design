import { useNavigate } from "react-router";
import { Coffee, Building2, Landmark, Train, Bus, UtensilsCrossed, ClipboardList, HelpCircle } from "lucide-react";

const menuPages = [
  [
    { id: "cafe", title: "카페", icon: Coffee, color: "bg-amber-600", path: "/cafe" },
    { id: "bank", title: "은행", icon: Building2, color: "bg-blue-600", path: "/bank" },
    { id: "bus", title: "버스 예매", icon: Bus, color: "bg-green-600", path: "/bus" },
    { id: "ktx", title: "KTX 예매", icon: Train, color: "bg-purple-600", path: "/ktx" },
  ],
  [
    { id: "public", title: "무인민원발급기", icon: Landmark, color: "bg-red-600", path: "/public" },
    { id: "lotteria", title: "롯데리아", icon: UtensilsCrossed, color: "bg-orange-600", path: "/lotteria" },
    { id: "table-order", title: "테이블 오더", icon: ClipboardList, color: "bg-teal-600", path: "/table-order" },
    { id: "empty", title: "연습게임", icon: HelpCircle, color: "bg-gray-500", path: "/empty" },
  ],
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <div className="py-8 px-6">
        <h1 className="text-center text-gray-800" style={{ fontSize: '48px', fontWeight: '700' }}>
          키오스크 연습
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {menuPages.map((page, pageIndex) => (
            <section key={pageIndex} className="px-4">
              <div className="grid grid-cols-2 gap-6 py-4">
                {page.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`${item.color} text-white rounded-3xl p-12 flex flex-col items-center justify-center gap-6 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200`}
                      style={{ minHeight: "280px" }}
                    >
                      <Icon size={80} strokeWidth={2.5} />
                      <span style={{ fontSize: "32px", fontWeight: "700" }}>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

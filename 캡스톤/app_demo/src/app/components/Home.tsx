import { useNavigate } from "react-router";
import { Coffee, Building2, Landmark, Train, Bus, UtensilsCrossed, ClipboardList, HelpCircle, Hospital } from "lucide-react";

const menuItems = [
  { id: "cafe", title: "카페", icon: Coffee, color: "bg-yellow-600", path: "/cafe" },
  { id: "bank", title: "은행", icon: Building2, color: "bg-blue-600", path: "/bank" },
  { id: "bus", title: "버스 예매", icon: Bus, color: "bg-green-600", path: "/bus" },
  { id: "ktx", title: "기차 예매", icon: Train, color: "bg-purple-600", path: "/ktx" },
  { id: "public", title: "무인민원발급기", icon: Landmark, color: "bg-red-600", path: "/public" },
  { id: "lotteria", title: "패스트푸드", icon: UtensilsCrossed, color: "bg-orange-600", path: "/lotteria" },
  { id: "table-order", title: "식당 주문", icon: ClipboardList, color: "bg-teal-600", path: "/table-order" },
  { id: "hospital", title: "병원", icon: Hospital, color: "bg-rose-600", path: "/hospital" },
  { id: "empty", title: "연습게임", icon: HelpCircle, color: "bg-gray-500", path: "/empty" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <div className="py-4 px-6 flex-shrink-0">
        <h1 className="text-center text-gray-800 font-bold" style={{ fontSize: "30px" }}>
          키오스크 연습
        </h1>
      </div>

      <div className="flex-1 min-h-0 px-3 pb-3">
        <div className="grid grid-cols-3 grid-rows-3 gap-3 h-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`${item.color} text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all duration-200`}
              >
                <Icon size={44} strokeWidth={2.5} />
                <span style={{ fontSize: "17px", fontWeight: "700", textAlign: "center", wordBreak: "keep-all", lineHeight: 1.3 }}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

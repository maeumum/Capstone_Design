import { useNavigate, useParams } from "react-router";
import { ArrowLeft, User, Settings, Bell, MessageCircle, Image, Search } from "lucide-react";

const menuData = {
  1: { title: "프로필", icon: User, color: "bg-blue-500", description: "사용자 프로필 정보를 확인하고 수정할 수 있습니다." },
  2: { title: "설정", icon: Settings, color: "bg-green-500", description: "앱의 다양한 설정을 관리할 수 있습니다." },
  3: { title: "알림", icon: Bell, color: "bg-yellow-500", description: "받은 알림을 확인하고 관리할 수 있습니다." },
  4: { title: "메시지", icon: MessageCircle, color: "bg-purple-500", description: "메시지를 주고받을 수 있습니다." },
  5: { title: "갤러리", icon: Image, color: "bg-pink-500", description: "사진과 동영상을 관리할 수 있습니다." },
  6: { title: "검색", icon: Search, color: "bg-indigo-500", description: "원하는 내용을 검색할 수 있습니다." },
};

export function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const data = menuData[id as keyof typeof menuData];

  if (!data) {
    return (
      <div className="min-h-svh bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">페이지를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className="min-h-svh bg-gray-50">
      <div className={`${data.color} text-white p-6`}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={24} />
          <span>뒤로</span>
        </button>

        <div className="flex flex-col items-center gap-4 py-8">
          <Icon size={64} />
          <h1 className="text-3xl">{data.title}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl mb-4 text-gray-800">상세 정보</h2>
          <p className="text-gray-600 leading-relaxed">{data.description}</p>
        </div>
      </div>
    </div>
  );
}

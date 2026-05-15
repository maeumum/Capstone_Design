import { useNavigate } from "react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function EmptyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all mb-8"
        >
          <ArrowLeft size={40} strokeWidth={2.5} />
          <span style={{ fontSize: '28px', fontWeight: '600' }}>뒤로 가기</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="flex items-center justify-center gap-6 mb-12">
            <HelpCircle size={100} className="text-gray-600" strokeWidth={2.5} />
            <h1 className="text-gray-800" style={{ fontSize: '56px', fontWeight: '700' }}>
              더 알아보기
            </h1>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-gray-900 mb-4" style={{ fontSize: '40px', fontWeight: '600' }}>
                도움말
              </h2>
              <div className="space-y-6 text-gray-700" style={{ fontSize: '32px', lineHeight: '1.6' }}>
                <p>
                  키오스크를 처음 사용하시는 분들을 위한 교육 앱입니다.
                </p>
                <p>
                  각 메뉴를 선택하면 해당 키오스크의 사용 방법을 배울 수 있습니다.
                </p>
                <p className="text-gray-600" style={{ fontSize: '28px' }}>
                  천천히 연습하시면서 익숙해지세요!
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-8">
              <p className="text-blue-900" style={{ fontSize: '28px', fontWeight: '600' }}>
                💡 팁: 실제 키오스크도 비슷한 방식으로 작동됩니다!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

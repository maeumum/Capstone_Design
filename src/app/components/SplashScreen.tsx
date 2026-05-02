import { Smartphone } from "lucide-react";

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-12">
        <div className="flex justify-center">
          <div className="bg-white rounded-full p-12 shadow-2xl">
            <Smartphone size={150} className="text-blue-600" strokeWidth={2.5} />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-white" style={{ fontSize: '64px', fontWeight: '800', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            어플 이름 로고 추가
          </h1>
          <p className="text-blue-100" style={{ fontSize: '36px', fontWeight: '600' }}>
            전북평생교육진흥원 로고 추가
          </p>
        </div>

        <button
          onClick={onStart}
          className="bg-white text-blue-600 px-16 py-8 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 mt-16"
          style={{ fontSize: '40px', fontWeight: '700' }}
        >
          시작하기
        </button>

        <p className="text-blue-100 mt-8" style={{ fontSize: '28px' }}>
          시작하기 버튼을 눌러서 시작해주세요!
        </p>
      </div>
    </div>
  );
}

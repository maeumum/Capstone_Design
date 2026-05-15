interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="min-h-svh flex flex-col px-6" style={{ background: "linear-gradient(160deg, #e8f4ff 0%, #f0f8ff 40%, #ffffff 100%)" }}>

      {/* 중앙: 타이틀 + 버튼 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ gap: "48px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1 style={{ fontSize: "52px", fontWeight: "800", color: "#1a3a6e", letterSpacing: "-1px" }}>
            키오스크 연습
          </h1>
          <p style={{ fontSize: "28px", fontWeight: "500", color: "#4a6fa5" }}>
            일상 속 키오스크를 쉽게 배워보세요
          </p>
        </div>

        <button
          onClick={onStart}
          style={{
            background: "linear-gradient(135deg, #1a6fe8, #0d4fbf)",
            color: "white",
            fontSize: "40px",
            fontWeight: "700",
            padding: "28px 80px",
            borderRadius: "9999px",
            border: "none",
            boxShadow: "0 8px 32px rgba(26,111,232,0.35)",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1.05)")}
        >
          시작하기
        </button>

        <p style={{ fontSize: "26px", color: "#7a9ac5" }}>
          시작하기 버튼을 눌러서 시작해주세요!
        </p>
      </div>

      {/* 하단: 진흥원 로고 */}
      <div className="flex justify-center items-center" style={{ padding: "40px 0 48px" }}>
        <img
          src="/jb-logo.png"
          alt="전북특별자치도 평생교육장학진흥원"
          style={{ width: "420px", objectFit: "contain" }}
        />
      </div>

    </div>
  );
}

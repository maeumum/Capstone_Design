import "./SplashScreen.css";

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="splash-root">
      <div className="splash-frame" data-screen-label="00 Splash">

        <span className="splash-eyebrow">키오스크 연습앱</span>

        <div className="splash-title-block">
          <h1 className="splash-app-title">
            처음이라도<br />
            괜찮아요.
          </h1>
          <p className="splash-tagline">
            실제와 똑같이, 차근차근<br />
            키오스크 사용을 연습해 봐요.
          </p>
        </div>

        <div className="splash-hero" aria-label="kiosk illustration">
          <span className="splash-blob b1" aria-hidden="true"></span>
          <span className="splash-blob b2" aria-hidden="true"></span>
          <span className="splash-blob b3" aria-hidden="true"></span>
          <span className="splash-blob b4" aria-hidden="true"></span>

          <div className="splash-kiosk-card">
            <div className="splash-topbar" aria-hidden="true">
              <span className="splash-dot" style={{ background: "#FF5F57" }}></span>
              <span className="splash-dot" style={{ background: "#FEBC2E" }}></span>
              <span className="splash-dot" style={{ background: "#28C840" }}></span>
              <span className="splash-pulse"></span>
            </div>
            <h2>&nbsp;연습해 봐요</h2>
            <span className="splash-sub">PLEASE ORDER</span>

            <div className="splash-menu">
              <div className="splash-menu-item">
                <span className="splash-chip" style={{ background: "#E07A11" }} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 9 H17 V14 a5 5 0 0 1 -5 5 H10 a5 5 0 0 1 -5 -5 Z" />
                    <path d="M17 10 H20 a3 3 0 0 1 0 6 H17" />
                  </svg>
                </span>
                카페
              </div>
              <div className="splash-menu-item splash-active">
                <span className="splash-chip" style={{ background: "#1F50EE" }} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 7 H18 V19 H6 Z" />
                    <path d="M6 11 H18" />
                    <path d="M10 15 H14" />
                  </svg>
                </span>
                은행
              </div>
              <div className="splash-menu-item">
                <span className="splash-chip" style={{ background: "#1F9A45" }} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 9 a3 3 0 0 1 3 -3 H16 a3 3 0 0 1 3 3 V17 H5 Z" />
                    <path d="M5 13 H19" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                </span>
                교통수단
              </div>
            </div>
          </div>
        </div>

        <footer className="splash-footer">
          <span className="splash-sponsor-label">주관</span>
          <img
            className="splash-sponsor-logo"
            src="/jb-logo.png"
            alt="전북특별자치도 평생교육장학진흥원"
          />
        </footer>

        <div className="splash-cta-area">
          <button type="button" className="splash-cta-start" onClick={onStart}>
            시작하기
            <span className="splash-arrow-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12 H19 M13 6 L19 12 L13 18" />
              </svg>
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

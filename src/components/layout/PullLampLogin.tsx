import { useRef, useState } from 'react';

interface PullLampLoginProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  password: string;
  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
  loginError: string;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

const PULL_THRESHOLD = 34;
const MAX_DRAG = 72;
const BASE_STRING_LEN = 46;

export default function PullLampLogin({
  isOpen,
  onClose,
  username,
  password,
  setUsername,
  setPassword,
  loginError,
  onSubmit,
  isSubmitting = false,
}: PullLampLoginProps) {
  // Cố định tiếng Việt, không theo i18n.language của trang public: khu vực
  // admin không cần đa ngôn ngữ, và tránh trường hợp khách vừa đổi site sang
  // 'en' khiến admin (người Việt) mở form đăng nhập thấy toàn tiếng Anh.
  const [lit, setLit] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [flicker, setFlicker] = useState(false);
  const startYRef = useRef(0);
  const flickerTimer = useRef<number | null>(null);

  const handleBeadDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    startYRef.current = e.clientY;
    setDragging(true);
    setDragY(0);
  };

  const handleBeadMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = e.clientY - startYRef.current;
    setDragY(Math.max(0, Math.min(MAX_DRAG, delta)));
  };

  const handleBeadUp = () => {
    if (!dragging) return;
    const pulled = dragY > PULL_THRESHOLD;
    setDragging(false);
    setDragY(0);
    if (pulled) {
      setLit((v) => !v);
      setFlicker(true);
      if (flickerTimer.current) window.clearTimeout(flickerTimer.current);
      flickerTimer.current = window.setTimeout(() => setFlicker(false), 450);
    }
  };

  const stringLen = BASE_STRING_LEN + dragY;
  const snapTransition = dragging ? 'none' : 'height .5s cubic-bezier(.22,1.6,.36,1)';
  const beadTransition = dragging ? 'none' : 'transform .5s cubic-bezier(.22,1.6,.36,1)';

  const hintText = dragging
    ? dragY > PULL_THRESHOLD
      ? `Thả ra để ${lit ? 'tắt' : 'bật'} đèn`
      : 'Kéo tiếp xuống...'
    : lit
    ? 'Kéo dây để tắt đèn'
    : 'Kéo dây xuống để bật đèn';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      <style>{`
        @keyframes pll-flicker { 0% { opacity: .3; } 8% { opacity: 1; } 14% { opacity: .4; } 20% { opacity: 1; } 100% { opacity: 1; } }
        @keyframes pll-dust { 0% { transform: translateY(0) translateX(0); opacity: 0; } 15% { opacity: .5; } 100% { transform: translateY(-70px) translateX(6px); opacity: 0; } }
        @keyframes pll-card-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .pll-flicker { animation: pll-flicker .5s ease; }
        .pll-dust { animation: pll-dust 3.2s ease-in infinite; }
        .pll-card-in { animation: pll-card-in .45s cubic-bezier(.16,1,.3,1) both; }
        .pll-bead { cursor: grab; touch-action: none; }
        .pll-bead:active { cursor: grabbing; }
      `}</style>

      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div
        className="relative w-full max-w-3xl rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16"
        style={{
          background: 'radial-gradient(ellipse 700px 500px at 30% 40%, rgba(255,190,110,' + (lit ? 0.12 : 0) + '), transparent 65%), #0a0a0b',
          border: '1px solid #232327',
          transition: 'background 0.5s ease',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5f5f68] hover:text-[#e8e8ea] transition-colors z-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* LAMP SCENE */}
        <div className="relative shrink-0" style={{ width: 240, height: 300, userSelect: 'none' }}>
          <div className="flex flex-col items-center" style={{ width: 240 }}>
            {/* dome shade */}
            <div
              style={{
                width: 160,
                height: 84,
                borderRadius: '160px 160px 12px 12px',
                background: 'linear-gradient(180deg,#efe6d5,#d8cbae)',
                position: 'relative',
                boxShadow: 'inset 0 -8px 15px rgba(0,0,0,.15), 0 8px 24px rgba(0,0,0,.5)',
                zIndex: 3,
              }}
            >
              <div style={{ position: 'absolute', bottom: 5, left: 7, right: 7, height: 8, borderRadius: 999, background: 'rgba(0,0,0,.08)' }} />
              <div
                style={{
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 12,
                  height: 8,
                  borderRadius: 3,
                  background: 'linear-gradient(180deg,#5a5a60,#2c2c30)',
                  zIndex: 4,
                }}
              />
            </div>

            {/* chain */}
            <div
              style={{
                position: 'absolute',
                top: 80,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 7,
                touchAction: 'none',
              }}
            >
              <div
                style={{
                  width: 1.5,
                  height: stringLen,
                  background: 'linear-gradient(180deg,#6a6a70,#8a8a90)',
                  transition: snapTransition,
                }}
              />
              <div
                className="pll-bead"
                onPointerDown={handleBeadDown}
                onPointerMove={handleBeadMove}
                onPointerUp={handleBeadUp}
                onPointerCancel={handleBeadUp}
                style={{
                  position: 'relative',
                  width: 14,
                  height: 19,
                  borderRadius: '7px 7px 9px 9px',
                  background: 'linear-gradient(160deg,#e0ab55,#8a5a1f)',
                  boxShadow: '0 3px 7px rgba(0,0,0,.5)',
                  transform: `translateY(${dragY}px)`,
                  transition: beadTransition,
                }}
              >
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.35)', position: 'absolute', top: 3, left: 3 }} />
              </div>
            </div>

            {/* bulb + glow */}
            <div className="relative w-full flex justify-center" style={{ marginTop: -3 }}>
              <div
                className={flicker ? 'pll-flicker' : ''}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  marginTop: -12,
                  background: lit
                    ? 'radial-gradient(circle,#fff2cf,#ffd98a 55%,#c98a2e 100%)'
                    : 'radial-gradient(circle,#4a443c,#3a352f)',
                  boxShadow: lit ? '0 0 34px 12px rgba(255,200,110,.55), 0 0 76px 34px rgba(255,180,90,.25)' : 'none',
                  transition: 'background .4s ease, box-shadow .4s ease',
                  position: 'relative',
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  width: 280,
                  height: 300,
                  borderRadius: '50%',
                  background: `radial-gradient(ellipse at top, rgba(255,205,120,${lit ? 0.16 : 0}) 0%, transparent 60%)`,
                  transition: 'background .5s ease',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              {lit &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="pll-dust"
                    style={{
                      position: 'absolute',
                      bottom: 50 + (i % 3) * 16,
                      left: 34 + ((i * 17) % 100),
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: '#ffe3a6',
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
            </div>

            {/* pole */}
            <div style={{ width: 7, height: 110, background: 'linear-gradient(90deg,#3a3a3f,#57575e,#3a3a3f)', borderRadius: 3, marginTop: 6 }} />

            {/* base */}
            <div style={{ width: 120, height: 13, borderRadius: 999, background: 'linear-gradient(180deg,#4a4a50,#26262a)', boxShadow: '0 5px 14px rgba(0,0,0,.5)', marginTop: -2 }} />
            <div style={{ width: 150, height: 5, borderRadius: 999, background: 'rgba(0,0,0,.4)', filter: 'blur(4px)', marginTop: 5 }} />
          </div>

          <p
            style={{
              position: 'absolute',
              bottom: -26,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              textAlign: 'center',
              fontSize: 10.5,
              color: '#5f5f68',
              fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {hintText}
          </p>
        </div>

        {/* LOGIN CARD */}
        <div
          style={{
            pointerEvents: lit ? 'auto' : 'none',
            opacity: lit ? 1 : 0,
            transform: `translateY(${lit ? 0 : 14}px)`,
            transition: 'opacity .45s ease, transform .45s ease',
          }}
        >
          <div
            className="pll-card-in"
            style={{
              width: 320,
              background: '#111114',
              border: '1px solid #2c2c31',
              borderRadius: 14,
              padding: 28,
            }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#f26522] flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#08080a" strokeWidth={2.4}>
                  <path d="M3 9l9-6 9 6-9 6-9-6z" />
                  <path d="M3 9v6l9 6 9-6V9" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-[#e8e8ea]">Quản trị PlatiHub</div>
                <div className="text-[10.5px] text-[#5b5b63]" style={{ fontFamily: 'ui-monospace, monospace' }}>đăng nhập để tiếp tục</div>
              </div>
            </div>

            {loginError && (
              <div className="mb-4 bg-[#ef5a5a1a] text-[#ef5a5a] text-xs font-medium px-3 py-2.5 rounded-lg border border-[#ef5a5a33] text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <label className="block text-[11px] font-semibold text-[#8b8b93] mb-1.5">Tài khoản</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                tabIndex={lit ? 0 : -1}
                className="w-full bg-[#08080a] border border-[#232327] rounded-lg px-3.5 py-2.5 text-[#e8e8ea] text-sm mb-4 focus:outline-none focus:border-[#f2652255]"
                placeholder="admin@platihub.vn"
                required
              />
              <label className="block text-[11px] font-semibold text-[#8b8b93] mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                tabIndex={lit ? 0 : -1}
                className="w-full bg-[#08080a] border border-[#232327] rounded-lg px-3.5 py-2.5 text-[#e8e8ea] text-sm mb-5 focus:outline-none focus:border-[#f2652255]"
                placeholder="••••••••"
                required
              />
              <button
                type="submit"
                tabIndex={lit ? 0 : -1}
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-bold text-sm text-[#08080a] bg-[#f26522] hover:bg-[#ff7638] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

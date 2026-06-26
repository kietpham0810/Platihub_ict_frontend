// src/components/layout/MegaMenu.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/images/logo.jpg';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount before enter animation
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleTransitionEnd = () => {
    if (!isOpen && !isAnimating) {
      setShouldRender(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  if (!shouldRender) return null;

  const productCategories = [
    { name: 'Tất cả sản phẩm', path: '/san-pham' },
    { name: 'Thiết bị máy tính', path: '/san-pham?category=pc' },
    { name: 'Linh kiện, thiết bị ngoại vi', path: '/san-pham?category=components' },
    { name: 'Điện thoại, thiết bị thông minh', path: '/san-pham?category=mobile' },
    { name: 'Giải pháp CNTT', path: '/san-pham?category=solutions' }
  ];

  return (
    <div 
      onTransitionEnd={handleTransitionEnd}
      className={`fixed inset-0 z-[70] bg-white/95 text-slate-900 overflow-y-auto w-full h-screen transition-all duration-300 ease-out transform shadow-2xl ring-1 ring-slate-100 backdrop-blur-sm ${
        isAnimating ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-6 md:px-12 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-300"
          >
            <img
              src={logo}
              alt="Platihub Logo"
              className="h-16 md:h-20 w-auto object-contain opacity-95"
              style={{ filter: 'contrast(1.1)' }}
            />
          </Link>
        </div>

        <button
          onClick={onClose}
          className="mt-4 md:mt-0 w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xl transition-all duration-300"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <div className="px-6 py-10 md:px-12 max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        <div className={`relative overflow-hidden transition-all duration-500 delay-100 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-white border border-slate-200/80 rounded-[28px] p-8 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.18)]`}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fef3e7] to-transparent opacity-80" />
          <h3 className="relative text-slate-900 font-semibold uppercase mb-6 tracking-[0.22em] text-sm">
            {t('menu.about')}
          </h3>
          <ul className="relative space-y-3">
            <li>
              <Link to="/" onClick={onClose} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-[#ffefe2] transition-all">
                <span className="text-[#f26522] font-semibold text-lg transition-transform group-hover:translate-x-1">›</span>
                <span className="font-medium">{t('menu.about')}</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className={`relative overflow-hidden transition-all duration-500 delay-200 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-white border border-slate-200/80 rounded-[28px] p-8 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.18)]`}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100 to-transparent opacity-80" />
          <div className="relative space-y-8">
            <div>
              <h3 className="text-slate-900 font-semibold uppercase mb-6 tracking-[0.22em] text-sm">
                {t('menu.news')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/khuyen-mai" onClick={onClose} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-[#ffefe2] transition-all">
                    <span className="text-[#f26522] font-semibold text-lg transition-transform group-hover:translate-x-1">›</span>
                    <span className="font-medium">{t('menu.promotion')}</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold uppercase mb-6 tracking-[0.22em] text-sm">
                {t('menu.contact')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/lien-he" onClick={onClose} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-[#ffefe2] transition-all">
                    <span className="text-[#f26522] font-semibold text-lg transition-transform group-hover:translate-x-1">›</span>
                    <span className="font-medium">{t('menu.contact')}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`relative overflow-hidden transition-all duration-500 delay-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-white border border-slate-200/80 rounded-[28px] p-8 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.18)]`}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fef3e7] to-transparent opacity-80" />
          <h3 className="relative text-slate-900 font-semibold uppercase mb-6 tracking-[0.22em] text-sm">
            {t('menu.products')}
          </h3>
          <ul className="relative space-y-3">
            {productCategories.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-[#ffefe2] transition-all text-sm font-medium"
                >
                  <span className="text-[#f26522] font-semibold text-lg transition-transform group-hover:translate-x-1">›</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={`relative overflow-hidden transition-all duration-500 delay-400 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-white border border-slate-200/80 rounded-[28px] p-8 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.18)]`}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100 to-transparent opacity-80" />
          <div className="relative flex flex-col gap-4">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Language</p>
            <button
              onClick={() => changeLanguage('vn')}
              className={`flex items-center justify-between gap-3 w-full rounded-2xl border px-4 py-3 transition-all duration-300 ${
                i18n.language === 'vn'
                  ? 'bg-[#f26522] border-[#f26522] text-white shadow-lg'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:-translate-y-0.5'
              }`}
            >
              <span className={`font-semibold ${i18n.language === 'vn' ? 'text-white' : 'text-slate-700'}`}>Tiếng Việt</span>
              <img src="https://flagcdn.com/w40/vn.png" alt="Vietnam Flag" className="w-8 h-auto rounded-sm" />
            </button>

            <button
              onClick={() => changeLanguage('en')}
              className={`flex items-center justify-between gap-3 w-full rounded-2xl border px-4 py-3 transition-all duration-300 ${
                i18n.language === 'en'
                  ? 'bg-[#f26522] border-[#f26522] text-white shadow-lg'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:-translate-y-0.5'
              }`}
            >
              <span className={`font-semibold ${i18n.language === 'en' ? 'text-white' : 'text-slate-700'}`}>English</span>
              <img src="https://flagcdn.com/w40/us.png" alt="USA Flag" className="w-8 h-auto rounded-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
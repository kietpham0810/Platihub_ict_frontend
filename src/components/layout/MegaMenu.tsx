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
      // Đã đổi z-50 thành z-[70] để đè lên Header (z-[60])
      className={`fixed inset-0 z-[70] bg-white text-slate-900 overflow-y-auto w-full h-screen transition-all duration-300 ease-out transform shadow-2xl ring-1 ring-slate-100 ${
        isAnimating ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}
    >
      <div className="flex justify-between items-center px-6 py-6 md:px-12 border-b border-slate-200/80 backdrop-blur-md bg-white/90">
        
        <div className="flex items-center gap-3 md:pl-12">
          <Link 
            to="/" 
            onClick={onClose} 
            className="flex items-center hover:scale-105 transition-transform duration-300 shrink-0"
          >
            <img 
              src={logo} 
              alt="Platihub Logo" 
              className="h-16 md:h-20 w-auto object-contain opacity-95 shrink-0"
              style={{ filter: 'contrast(1.1)' }} 
            />
          </Link>
        </div>

        <button 
          onClick={onClose} 
          className="w-12 h-12 rounded-full bg-[#f26522] hover:bg-[#d9531e] flex items-center justify-center text-xl font-bold transition-colors shadow-lg"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <div className="px-6 py-10 md:px-12 max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        <div className={`transition-all duration-500 delay-100 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-slate-50/80 border border-slate-200 rounded-[28px] p-8 shadow-sm`}> 
          <h3 className="text-slate-500 font-bold uppercase mb-6 tracking-widest text-sm border-b border-slate-200 pb-4">
            {t('menu.about')}
          </h3>
          <ul className="space-y-3">
            <li>
              <Link to="/" onClick={onClose} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-white transition-all group">
                <span className="text-[#f26522] font-bold text-lg transition-transform group-hover:translate-x-1">›</span> 
                {t('menu.about')}
              </Link>
            </li>
          </ul>
        </div>

        <div className={`transition-all duration-500 delay-200 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-slate-50/80 border border-slate-200 rounded-[28px] p-8 shadow-sm`}> 
          <div className="space-y-8">
            <div>
              <h3 className="text-slate-500 font-bold uppercase mb-6 tracking-widest text-sm border-b border-slate-200 pb-4">
                {t('menu.news')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/khuyen-mai" onClick={onClose} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-white transition-all group">
                    <span className="text-[#f26522] font-bold text-lg transition-transform group-hover:translate-x-1">›</span> 
                    {t('menu.promotion')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-500 font-bold uppercase mb-6 tracking-widest text-sm border-b border-slate-200 pb-4">
                {t('menu.contact')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/lien-he" onClick={onClose} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-white transition-all group">
                    <span className="text-[#f26522] font-bold text-lg transition-transform group-hover:translate-x-1">›</span> 
                    {t('menu.contact')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-500 delay-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-slate-50/80 border border-slate-200 rounded-[28px] p-8 shadow-sm`}> 
          <h3 className="text-slate-900 font-bold uppercase mb-6 tracking-widest text-sm border-b border-slate-200 pb-4">
            {t('menu.products')}
          </h3>
          <ul className="space-y-3">
            {productCategories.map((item, idx) => (
              <li key={idx}>
                <Link 
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 hover:text-[#f26522] hover:bg-white transition-all group text-sm"
                >
                  <span className="text-[#f26522] font-bold text-lg transition-transform group-hover:translate-x-1">›</span> 
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={`transition-all duration-500 delay-400 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} bg-slate-50/80 border border-slate-200 rounded-[28px] p-8 shadow-sm`}> 
          <div className="flex flex-col gap-4">
            
            <button 
              onClick={() => changeLanguage('vn')}
              className={`flex items-center gap-4 w-32 px-4 py-3 rounded-xl border transition-all group ${
                i18n.language === 'vn'
                  ? 'bg-[#f26522] border-[#f26522] text-white shadow-lg'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className={`font-bold text-lg transition-transform group-hover:translate-x-1 ${i18n.language === 'vn' ? 'text-white' : 'text-slate-400'}`}>›</span> 
              <img src="https://flagcdn.com/w40/vn.png" alt="Vietnam Flag" className="w-8 h-auto shadow-sm rounded-sm" />
            </button>
            
            <button 
              onClick={() => changeLanguage('en')}
              className={`flex items-center gap-4 w-32 px-4 py-3 rounded-xl border transition-all group ${
                i18n.language === 'en'
                  ? 'bg-[#f26522] border-[#f26522] text-white shadow-lg'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className={`font-bold text-lg transition-transform group-hover:translate-x-1 ${i18n.language === 'en' ? 'text-white' : 'text-slate-400'}`}>›</span> 
              <img src="https://flagcdn.com/w40/us.png" alt="USA Flag" className="w-8 h-auto shadow-sm rounded-sm" />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
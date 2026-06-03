// src/components/layout/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import logo from '../../assets/images/logo.jpg';
// BƯỚC 1: IMPORT CONFIG API
import { API_CONFIG, buildApiUrl } from '../../constants/config';

interface SearchResult {
  id: string;
  product_name: string;
  image_url: string;
  description: string;
  manufacturer: string;
  product_type: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // STATES TÌM KIẾM THÔNG MINH
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [globalProducts, setGlobalProducts] = useState<SearchResult[]>([]); 
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'platihubict' && password === 'platihub2026') {
      setIsLoginOpen(false);
      setUsername('');
      setPassword('');
      setLoginError('');
      navigate('/admin');
    } else {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  // FETCH DỮ LIỆU TÌM KIẾM BẰNG CONFIG API
  useEffect(() => {
    const fetchAllProductsForSearch = async () => {
      try {
        // SỬ DỤNG BUILDER THAY VÌ HARDCODE
        const apiUrl = `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=approved`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data.status === 'success') {
          setGlobalProducts(data.data);
          console.log("✅ [Search Engine] Đã tải xong:", data.data.length, "sản phẩm");
        }
      } catch (error) {
        console.error("❌ [Search Engine] Lỗi khi tải kho dữ liệu:", error);
      }
    };

    fetchAllProductsForSearch();
  }, []);

  // LỌC DỮ LIỆU TỐC ĐỘ CAO
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    const query = searchQuery.toLowerCase();
    
    const filtered = globalProducts.filter(p => {
      const safeName = p.product_name ? p.product_name.toLowerCase() : '';
      const safeCategory = p.product_type ? p.product_type.toLowerCase() : '';
      const safeManufacturer = p.manufacturer ? p.manufacturer.toLowerCase() : '';
      
      return safeName.includes(query) || safeCategory.includes(query) || safeManufacturer.includes(query);
    });
    
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, globalProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`relative w-full flex flex-col pt-[84px] ${isHomePage ? 'h-screen min-h-[600px]' : ''}`}>
      <div className="fixed top-0 left-0 w-full bg-gray-100/95 backdrop-blur-md shadow-md border-b border-gray-200 z-[60] transition-all duration-300">
        <nav className="flex items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto h-[84px]">
          
          <div className="flex items-center gap-4 md:gap-6 h-full">
            <Link to="/" className="flex items-center h-full py-2 shrink-0 pr-4">
              <img src={logo} alt="Platihub Logo" className="h-12 md:h-16 w-auto object-contain contrast-125 hover:opacity-80 transition-opacity" style={{ mixBlendMode: 'multiply' }} />
            </Link>

            <div className="hidden lg:flex items-center gap-6 mr-4 border-l border-gray-300 pl-6 h-8">
              <Link to="/" className="flex items-center gap-2 text-gray-800 hover:text-[#f26522] font-bold uppercase text-sm tracking-wider transition-colors group">Trang chủ</Link>
              <a href={isHomePage ? "#about" : "/#about"} className="flex items-center gap-2 text-gray-800 hover:text-[#f26522] font-bold uppercase text-sm tracking-wider transition-colors group">Về chúng tôi</a>
              <Link to="/san-pham" className="flex items-center gap-2 text-gray-800 hover:text-[#f26522] font-bold uppercase text-sm tracking-wider transition-colors group">Sản phẩm</Link>
            </div>

            <button onClick={() => setIsMenuOpen(true)} className="text-gray-800 hover:text-[#f26522] transition-colors focus:outline-none flex items-center group shrink-0" aria-label="Mở menu">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="hidden md:block w-px h-6 bg-gray-300 mx-2"></div>

            <button onClick={() => setIsLoginOpen(true)} className="hidden md:flex text-gray-700 hover:text-[#f26522] transition-colors items-center shrink-0" title={i18n.language === 'vn' ? 'Quản trị viên' : 'Admin'}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </button>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg ml-auto justify-end">
            <div className="relative w-full max-w-md" ref={searchContainerRef}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)} placeholder={i18n.language === 'vn' ? 'Tìm kiếm linh kiện, máy tính...' : 'Search...'} className="w-full bg-white text-gray-700 rounded-full py-2.5 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-[#f26522] border border-gray-300 transition-all shadow-sm" />
              <button className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 bg-gray-300 hover:bg-[#f26522] text-white rounded-full transition-colors flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>

              {showSuggestions && (
                <div className="absolute top-[110%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[70] animate-fade-in-up">
                  {searchResults.length === 0 ? (
                    <div className="py-6 text-center text-gray-500 text-sm">Không tìm thấy sản phẩm nào khớp với "{searchQuery}"</div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Gợi ý sản phẩm</div>
                      <ul className="max-h-[350px] overflow-y-auto">
                        {searchResults.map((item) => (
                          <li key={item.id} className="border-b border-gray-50 last:border-0">
                            <Link to={`/san-pham`} onClick={() => { setShowSuggestions(false); setSearchQuery(''); }} className="flex items-center px-4 py-3 hover:bg-orange-50 transition-colors group">
                              <div className="h-12 w-12 bg-white border border-gray-100 rounded-md overflow-hidden shrink-0">
                                <img src={item.image_url || 'https://via.placeholder.com/50'} alt={item.product_name} className="w-full h-full object-cover" />
                              </div>
                              <div className="ml-4 flex-1 flex flex-col justify-center">
                                <h4 className="text-sm font-bold text-gray-800 group-hover:text-[#f26522] line-clamp-1">{item.product_name}</h4>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-sm">{item.product_type}</span>
                                  <span className="text-sm font-black text-[#f26522]">Liên hệ</span>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link to={`/san-pham`} onClick={() => setShowSuggestions(false)} className="block w-full bg-gray-50 hover:bg-gray-100 text-center py-3 text-sm font-bold text-[#16223f] transition-colors border-t border-gray-100">
                        Xem tất cả kết quả cho "{searchQuery}" &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {isHomePage && (
        <div className="relative flex-1 flex flex-col">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=2070" alt="Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 uppercase tracking-tight drop-shadow-2xl">
              {t('hero.slogan')}
            </h1>
          </div>
        </div>
      )}

      <MegaMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* POPUP LOGIN */}
      <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-all duration-300 ${isLoginOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsLoginOpen(false)}></div>
        <div className={`relative bg-white w-full max-w-md p-8 rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-transform duration-500 ease-out ${isLoginOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <button onClick={() => setIsLoginOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-[#f26522]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">QUẢN TRỊ VIÊN</h2>
          </div>
          {loginError && <div className="mb-5 bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-lg border border-red-100 text-center animate-pulse">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên đăng nhập</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f26522]" placeholder="Tài khoản" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f26522]" placeholder="Password" required />
            </div>
            <button type="submit" className="w-full bg-[#16223f] hover:bg-[#1f2f54] text-white font-bold py-4 rounded-lg shadow-lg transition-colors mt-4 uppercase tracking-widest text-lg flex justify-center items-center gap-2">
              Vào Hệ Thống
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
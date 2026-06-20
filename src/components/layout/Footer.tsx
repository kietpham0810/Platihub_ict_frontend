
import logo from '../../assets/images/logo.jpg';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 py-16 px-6 md:px-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        
        {/* ================= CỘT TRÁI: THƯƠNG HIỆU & MẠNG XÃ HỘI ================= */}
        <div className="flex flex-col items-start max-w-sm">
          {/* Logo Platihub */}
          <div className="mb-6">
            <img 
              src={logo} 
              alt="Platihub Logo" 
              className="h-20 md:h-24 w-auto object-contain contrast-125"
              style={{ mixBlendMode: 'multiply' }} 
            />
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug mb-8">
            Global IT solutions & <br /> services.
          </h3>
          
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 text-lg">Connect with us</p>
            <div className="flex gap-4">
              
              {/* Nút Facebook đã gắn Link và cấu hình chuẩn Security */}
              <a 
                href="https://web.facebook.com/share/1AhWWJ1X9L/?mibextid=wwXIfr&_rdc=1&_rdr" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook" 
                className="text-gray-900 hover:text-[#f26522] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              
              {/* Nút X (Twitter) để sẵn khung Security, chờ cậu gắn link vào href */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter" 
                className="text-gray-900 hover:text-[#f26522] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: THÔNG TIN LIÊN HỆ ================= */}
        <div className="flex flex-col text-gray-600 text-base md:text-lg space-y-6 max-w-xl">
          
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-800 w-20 shrink-0">Address:</span>
            <p className="leading-relaxed">
              159C De Tham Street, Cau Ong Lanh Ward, Ho Chi Minh City, Vietnam
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-800 w-20 shrink-0">Email:</span>
            <div className="flex flex-col space-y-1">
              <a href="mailto:software@platihub.com" className="hover:text-blue-600 transition-colors">software@platihub.com</a>
              <a href="mailto:ict@platihub.com" className="hover:text-blue-600 transition-colors">ict@platihub.com</a>
              <a href="mailto:hr@platihub.com" className="hover:text-blue-600 transition-colors">hr@platihub.com</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-800 w-20 shrink-0">Phone:</span>
            <a href="tel:+84918227719" className="hover:text-blue-600 transition-colors">
              +84918227719
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
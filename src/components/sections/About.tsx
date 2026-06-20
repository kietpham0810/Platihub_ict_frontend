
import { useTranslation } from 'react-i18next'; // 1. Import hook đa ngôn ngữ
import { ADMIN_PHONE } from '../../constants/config';

export default function About() {
  const { t } = useTranslation(); // 2. Khởi tạo hook translation

  return (
    <section className="py-20 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* ================= CỘT TRÁI: NỘI DUNG ================= */}
        <div className="flex flex-col justify-center space-y-6 order-2 md:order-1">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#16223f] leading-tight uppercase">
            {t('about.title')} {/* 3. Gắn biến dịch tiêu đề */}
          </h2>
          
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed text-justify">
            <p>
              {t('about.p1')} {/* Gắn biến dịch đoạn văn 1 */}
            </p>
            <p>
              {t('about.p2')} {/* Gắn biến dịch đoạn văn 2 */}
            </p>
          </div>

          {/* Căn lề trái cho khu vực gọi điện thoại */}
          <div className="text-left pt-6 border-t border-gray-200 mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              {t('about.contactLabel')} {/* Gắn biến dịch nhãn liên hệ */}
            </p>
            <a 
              href={`tel:${ADMIN_PHONE.replace(/\s/g, '')}`} 
              className="inline-block text-3xl font-black text-[#f26522] hover:text-[#d9531e] transition-colors"
            >
              {ADMIN_PHONE}
            </a>
          </div>
        </div>

        {/* ================= CỘT PHẢI: HÌNH ẢNH ================= */}
        <div className="rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=2069" 
            alt="Platihub Sales Staff" 
            className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>

      </div>
    </section>
  );
}
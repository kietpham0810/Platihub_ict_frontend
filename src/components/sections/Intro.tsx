import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { ADMIN_PHONE } from '../../constants/config';

export default function Intro() {
  const { t } = useTranslation(); // 2. Khởi tạo hook

  return (
    <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* ================= CỘT TRÁI: NỘI DUNG ================= */}
        <div className="flex flex-col justify-center space-y-6 order-2 lg:order-1">
          
          {/* Tiêu đề chính */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#16223f] leading-tight">
            {t('intro.title')} {/* 3. Dùng biến từ điển */}
          </h2>

          {/* Đoạn text giới thiệu Platihub */}
          <p className="text-gray-600 text-lg leading-relaxed text-justify">
            {t('intro.description')}
          </p>

          {/* Khối Liên hệ */}
          <div className="text-left pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              {t('intro.contactLabel')}
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
        <div className="rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
            alt="Platihub Building" 
            className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>

      </div>
    </section>
  );
}
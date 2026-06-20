
import { SITE_CONFIG } from '../../constants/config';

export default function Contact() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto bg-white">
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#16223f] mb-12">Yêu cầu thông tin</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
        
        {/* ================= CỘT TRÁI: FORM LIÊN HỆ ================= */}
        <div className="lg:col-span-3">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Họ và tên" className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#f26522] transition-colors" />
              <input type="email" placeholder="Email" className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#f26522] transition-colors" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="tel" placeholder="Điện thoại" className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#f26522] transition-colors" />
              <input type="text" placeholder="Chức danh (không bắt buộc)" className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#f26522] transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Công ty / Tổ chức (không bắt buộc)" className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#f26522] transition-colors" />
              <select className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#f26522] transition-colors bg-white text-gray-500">
                <option value="">Chọn loại dịch vụ</option>
                <option value="ict">Phân phối thiết bị ICT</option>
                <option value="software">Phát triển phần mềm</option>
              </select>
            </div>

            <textarea placeholder="Lời nhắn (không bắt buộc)" rows={5} className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-[#f26522] transition-colors resize-y"></textarea>
            
            <button type="submit" className="bg-[#f26522] hover:bg-[#d9531e] text-white font-bold py-3 px-10 rounded transition-colors shadow-md">
              Gửi đi
            </button>
          </form>
        </div>

        {/* ================= CỘT PHẢI: THÔNG TIN CẤU HÌNH ĐỘNG ================= */}
        <div className="lg:col-span-2 text-gray-700 space-y-8">
          
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Địa chỉ</h4>
            <p className="leading-relaxed">{SITE_CONFIG.address}</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Email :</h4>
            <div className="flex flex-col space-y-1">
              {SITE_CONFIG.emails.map((email, idx) => (
                <a key={idx} href={`mailto:${email}`} className="hover:text-[#f26522] transition-colors">{email}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Điện thoại :</h4>
            <div className="flex flex-col space-y-1">
              {SITE_CONFIG.phones.map((phone, idx) => (
                <a key={idx} href={`tel:${phone}`} className="hover:text-[#f26522] transition-colors">{phone}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Thời gian làm việc :</h4>
            <p>{SITE_CONFIG.workingHours}</p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-[#f26522] hover:text-[#d9531e] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="#" className="text-[#f26522] hover:text-[#d9531e] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="#" className="text-[#f26522] hover:text-[#d9531e] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.253 4 12 4 12 4s-6.253 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.747 2 12 2 12s0 4.253.418 5.814c.23.86.908 1.538 1.768 1.768 1.561.418 7.814.418 7.814.418s6.253 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.253 22 12 22 12s0-4.253-.418-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
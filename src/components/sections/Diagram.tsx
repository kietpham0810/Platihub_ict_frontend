import { useTranslation } from 'react-i18next';

export default function Diagram() {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-4 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Vùng bọc sơ đồ để cuộn ngang trên thiết bị di động quá nhỏ */}
        <div className="w-full overflow-x-auto pb-8">
          <div className="flex flex-col items-center min-w-[700px] mt-8">
            
            {/* ================= NÚT GỐC (ROOT) ================= */}
            <div className="bg-[#16223f] text-white py-6 px-10 rounded-lg shadow-2xl z-10 w-96 text-center border-b-4 border-[#f26522] transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-extrabold text-xl uppercase tracking-wide mb-1">
                {t('diagram.rootTitle')}
              </h3>
              <p className="text-gray-300 text-sm font-medium tracking-wider">
                {t('diagram.rootSub')}
              </p>
            </div>
            
            {/* Đường nối dọc từ Root xuống ngang */}
            <div className="w-1 h-12 bg-gray-300"></div>
            
            {/* Đường nối ngang chia nhánh */}
            <div className="w-full max-w-4xl border-t-2 border-gray-300 flex justify-between relative">
              {/* Đường nối dọc phụ cho nhánh trái (ở vị trí 25%) */}
              <div className="w-1 h-12 bg-gray-300 absolute left-1/4 transform -translate-x-1/2"></div>
              {/* Đường nối dọc phụ cho nhánh phải (ở vị trí 75%) */}
              <div className="w-1 h-12 bg-gray-300 absolute right-1/4 transform translate-x-1/2"></div>
            </div>
            
            {/* ================= CÁC NÚT CON ================= */}
            <div className="w-full max-w-4xl flex justify-around mt-[48px]">
              
              {/* Nhánh Trái */}
              <div className="w-[340px] bg-white border border-gray-200 shadow-xl rounded-lg px-6 py-8 text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-2 duration-300 group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <h4 className="font-bold text-gray-800 text-lg uppercase mb-1">
                  {t('diagram.leftTitle')}
                </h4>
                <p className="text-gray-500 text-sm font-medium">
                  {t('diagram.leftSub')}
                </p>
              </div>

              {/* Nhánh Phải */}
              <div className="w-[340px] bg-white border border-gray-200 shadow-xl rounded-lg px-6 py-8 text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-2 duration-300 group">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h4 className="font-bold text-gray-800 text-lg uppercase mb-1">
                  {t('diagram.rightTitle')}
                </h4>
                <p className="text-gray-500 text-sm font-medium">
                  {t('diagram.rightSub')}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
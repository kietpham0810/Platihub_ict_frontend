
// Định nghĩa Props mô phỏng dữ liệu từ Admin nhập vào
interface PromotionProps {
  imageUrl?: string;
  description?: string;
}

export default function Promotion({ 
  imageUrl = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2070", 
  description = "Chương trình ưu đãi đặc biệt dành cho các đối tác đăng ký phân phối phần cứng tại Platihub trong tháng này. Áp dụng cho mọi thiết bị linh kiện ngoại vi."
}: PromotionProps) {
  return (
    <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Vùng hiển thị ảnh (Admin upload) */}
        <div className="relative h-[400px] w-full">
          <img 
            src={imageUrl} 
            alt="Promotion Banner" 
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-[#f26522] text-white px-4 py-1 rounded font-bold uppercase tracking-wider text-sm shadow-md">
            Khuyến mãi
          </div>
        </div>
        
        <div className="p-8 md:p-12 text-center flex flex-col items-center">
          
          {/* Vùng văn bản (Admin nhập) */}
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-10 max-w-3xl">
            {description}
          </p>
          
          {/* Dòng text ghim cứng theo yêu cầu */}
          <div className="bg-blue-50 border-l-4 border-blue-600 px-6 py-4 inline-block shadow-sm">
            <p className="text-blue-800 font-bold text-lg md:text-xl uppercase tracking-wide">
              Vui lòng liên hệ với chúng tôi để nhận thông tin khuyến mãi
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vn: {
    translation: {
      menu: {
        home: "Trang chủ",
        about: "Về chúng tôi",
        news: "Tin tức",
        promotion: "Khuyến mại",
        contact: "Liên hệ",
        products: "Sản phẩm",
        language: "Ngôn ngữ",
        openMenu: "Mở menu",
        closeMenu: "Đóng menu",
        allProducts: "Tất cả sản phẩm",
        computerEquipment: "Thiết bị máy tính",
        peripherals: "Linh kiện, thiết bị ngoại vi",
        mobileDevices: "Điện thoại, thiết bị thông minh",
        itSolutions: "Giải pháp CNTT"
      },
      hero: {
        slogan: "CÔNG NGHỆ VƯƠN XA"
      },
      intro: {
        title: "Nhà phân phối sản phẩm công nghệ hàng đầu Việt Nam",
        description: "Platihub sở hữu đội ngũ chuyên gia giàu năng lực, luôn mang đến sản phẩm chất lượng và dịch vụ uy tín. Chúng tôi không chỉ phân phối sản phẩm, chúng tôi hoạt động với phương châm sự thành công của khách hàng là nhiệm vụ của chúng tôi. Hãy gọi ngay cho chúng tôi khi bạn cần tư vấn.",
        contactLabel: "Liên hệ hợp tác"
      },
      about: {
        title: "Về Platihub",
        p1: "Platihub tự hào sở hữu đội ngũ chuyên gia giàu kiến thức và tận tâm với hơn 20 năm kinh nghiệm trong lĩnh vực phân phối phần cứng. Công ty luôn đặt chất lượng sản phẩm và dịch vụ lên hàng đầu, mang đến cho khách hàng những giải pháp công nghệ tối ưu, bền vững và hiệu quả.",
        p2: "Chúng tôi không chỉ là nhà phân phối đáng tin cậy mà còn là đối tác chiến lược, đồng hành cùng khách hàng trong quá trình phát triển và đổi mới. Sự chuyên nghiệp, uy tín và tinh thần trách nhiệm đã giúp chúng tôi xây dựng được vị thế vững chắc trên thị trường và niềm tin từ đối tác, khách hàng.",
        contactLabel: "Liên hệ với chúng tôi ngay hôm nay:"
      },
      diagram: {
        rootTitle: "Công ty TNHH Platihub",
        rootSub: "Platihub Co Ltd",
        leftTitle: "Đội ngũ phân phối thiết bị công nghệ",
        leftSub: "Platihub ICT",
        rightTitle: "Đội ngũ phát triển phần mềm",
        rightSub: "Platihub Software"
      },
      header: {
        adminTooltip: "Quản trị viên",
        searchPlaceholder: "Tìm kiếm linh kiện, máy tính...",
        noResultsFor: 'Không tìm thấy sản phẩm nào khớp với "{{query}}"',
        suggestions: "Gợi ý sản phẩm",
        topMatch: "Top match",
        viewAllResultsFor: 'Xem tất cả kết quả cho "{{query}}" →',
        viewDetail: "Chi tiết →"
        // Lưu ý: thông báo của luồng đăng nhập admin (PullLampLogin, lỗi
        // đăng nhập, redirect từ RequireAdminAuth) cố tình để tiếng Việt
        // cứng, không qua i18n - xem comment trong Header.tsx/PullLampLogin.tsx.
      },
      products: {
        filters: "Bộ lọc",
        categoriesTitle: "Danh mục",
        allProducts: "Tất cả sản phẩm",
        noResultsTitle: "Không tìm thấy sản phẩm phù hợp",
        noResultsDesc: "Thử bỏ bớt bộ lọc hoặc thay đổi từ khóa tìm kiếm.",
        clearAllFilters: "Xóa tất cả bộ lọc",
        loadErrorTitle: "Không thể tải danh sách sản phẩm",
        loadErrorDesc: "Đã có lỗi kết nối tới máy chủ. Vui lòng thử lại.",
        retry: "Thử lại",
        contactForPrice: "Liên hệ",
        viewDetails: "Xem chi tiết",
        filtersFor: "Bộ lọc cho {{category}}",
        viewResults: "Xem {{count}} kết quả",
        clearSelection: "Bỏ chọn ({{count}})",
        searchTitle: 'Tìm kiếm: "{{keyword}}"'
      },
      category: {
        PC: "PC",
        Laptop: "Laptop",
        CPU: "CPU",
        Mainboard: "Mainboard",
        VGA: "VGA",
        "Linh kiện": "Linh kiện máy tính",
        "Màn hình": "Màn hình máy tính",
        "HDD-SSD": "HDD-SSD",
        "Tản Nhiệt": "Tản Nhiệt",
        "Tai nghe": "Tai nghe"
      },
      filterLabel: {
        "Hãng sản xuất": "Hãng sản xuất",
        "Nhu cầu": "Nhu cầu",
        "CPU": "CPU",
        "RAM": "RAM",
        "Ổ cứng": "Ổ cứng",
        "Kích thước": "Kích thước",
        "Tần số quét": "Tần số quét",
        "Độ phân giải": "Độ phân giải",
        "Socket": "Socket",
        "Dung lượng VRAM": "Dung lượng VRAM",
        "Thương hiệu": "Thương hiệu",
        "Kiểu kết nối": "Kiểu kết nối",
        "Mức giá": "Mức giá"
      },
      priceRange: {
        "Dưới 2 triệu": "Dưới 2 triệu",
        "Từ 2 - 4 triệu": "Từ 2 - 4 triệu",
        "Từ 4 - 7 triệu": "Từ 4 - 7 triệu",
        "Từ 7 - 13 triệu": "Từ 7 - 13 triệu",
        "Từ 13 - 20 triệu": "Từ 13 - 20 triệu",
        "Trên 20 triệu": "Trên 20 triệu"
      },
      productDetail: {
        home: "Trang chủ",
        priceLabel: "GIÁ (Gồm VAT):",
        contactForPrice: "LIÊN HỆ",
        callForAdvice: "GỌI TƯ VẤN",
        notFoundTitle: "Opps! Cụt đường rồi...",
        notFoundDesc: "Không tìm thấy sản phẩm này.",
        connectionError: "Lỗi kết nối đến máy chủ.",
        goBack: "Quay lại trang trước",
        specsTitle: "Thông số kỹ thuật chi tiết",
        contactModalTitle: "Liên hệ CSKH",
        contactModalSubtitle: "Thông tin hỗ trợ khách hàng Platihub",
        addressLabel: "Địa chỉ",
        emailLabel: "Email",
        phoneLabel: "Điện thoại",
        close: "Đóng"
      },
      footer: {
        tagline: "Giải pháp & dịch vụ CNTT toàn diện.",
        connectWithUs: "Kết nối với chúng tôi",
        address: "Địa chỉ:",
        email: "Email:",
        phone: "Điện thoại:"
      },
      promotion: {
        badge: "Khuyến mãi",
        defaultDescription: "Chương trình ưu đãi đặc biệt dành cho các đối tác đăng ký phân phối phần cứng tại Platihub trong tháng này. Áp dụng cho mọi thiết bị linh kiện ngoại vi.",
        contactNote: "Vui lòng liên hệ với chúng tôi để nhận thông tin khuyến mãi"
      },
      contact: {
        title: "Yêu cầu thông tin",
        fullNamePlaceholder: "Họ và tên",
        emailPlaceholder: "Email",
        phonePlaceholder: "Điện thoại",
        titlePlaceholder: "Chức danh (không bắt buộc)",
        companyPlaceholder: "Công ty / Tổ chức (không bắt buộc)",
        selectServiceType: "Chọn loại dịch vụ",
        serviceIct: "Phân phối thiết bị ICT",
        serviceSoftware: "Phát triển phần mềm",
        messagePlaceholder: "Lời nhắn (không bắt buộc)",
        send: "Gửi đi",
        addressLabel: "Địa chỉ",
        emailLabel: "Email :",
        phoneLabel: "Điện thoại :",
        workingHoursLabel: "Thời gian làm việc :"
      }
    }
  },
  en: {
    translation: {
      menu: {
        home: "Home",
        about: "About Us",
        news: "News",
        promotion: "Promotions",
        contact: "Contact",
        products: "Products",
        language: "Language",
        openMenu: "Open menu",
        closeMenu: "Close menu",
        allProducts: "All Products",
        computerEquipment: "Computer Equipment",
        peripherals: "Components & Peripherals",
        mobileDevices: "Phones & Smart Devices",
        itSolutions: "IT Solutions"
      },
      hero: {
        slogan: "TECHNOLOGY REACHES FURTHER"
      },
      intro: {
        title: "Vietnam's Leading Technology Product Distributor",
        description: "Platihub possesses a highly capable team of experts, always delivering quality products and reputable services. We don't just distribute products; we operate with the motto that our customers' success is our mission. Call us immediately when you need consultation.",
        contactLabel: "Contact for cooperation"
      },
      about: {
        title: "About Platihub",
        p1: "Platihub is proud to have a knowledgeable and dedicated team of experts with over 20 years of experience in hardware distribution. The company always prioritizes product and service quality, providing customers with optimal, sustainable, and effective technological solutions.",
        p2: "We are not just a reliable distributor but also a strategic partner, accompanying customers in their development and innovation journey. Our professionalism, prestige, and sense of responsibility have helped us build a solid position in the market and earn trust from partners and customers.",
        contactLabel: "Contact us today:"
      },
      diagram: {
        rootTitle: "Platihub Co Ltd",
        rootSub: "Platihub Company Limited",
        leftTitle: "Tech Equipment Distribution Team",
        leftSub: "Platihub ICT",
        rightTitle: "Software Development Team",
        rightSub: "Platihub Software"
      },
      header: {
        adminTooltip: "Admin",
        searchPlaceholder: "Search...",
        noResultsFor: 'No products found matching "{{query}}"',
        suggestions: "Suggested products",
        topMatch: "Top match",
        viewAllResultsFor: 'View all results for "{{query}}" →',
        viewDetail: "Details →"
      },
      products: {
        filters: "Filters",
        categoriesTitle: "Categories",
        allProducts: "All Products",
        noResultsTitle: "No matching products found",
        noResultsDesc: "Try removing some filters or changing your search keyword.",
        clearAllFilters: "Clear all filters",
        loadErrorTitle: "Unable to load the product list",
        loadErrorDesc: "There was a connection error. Please try again.",
        retry: "Retry",
        contactForPrice: "Contact us",
        viewDetails: "View details",
        filtersFor: "Filters for {{category}}",
        viewResults: "View {{count}} results",
        clearSelection: "Clear selection ({{count}})",
        searchTitle: 'Search: "{{keyword}}"'
      },
      category: {
        PC: "PC",
        Laptop: "Laptop",
        CPU: "CPU",
        Mainboard: "Mainboard",
        VGA: "VGA",
        "Linh kiện": "Computer Components",
        "Màn hình": "Monitors",
        "HDD-SSD": "HDD-SSD",
        "Tản Nhiệt": "Cooling",
        "Tai nghe": "Headphones"
      },
      filterLabel: {
        "Hãng sản xuất": "Manufacturer",
        "Nhu cầu": "Usage",
        "CPU": "CPU",
        "RAM": "RAM",
        "Ổ cứng": "Storage",
        "Kích thước": "Size",
        "Tần số quét": "Refresh rate",
        "Độ phân giải": "Resolution",
        "Socket": "Socket",
        "Dung lượng VRAM": "VRAM capacity",
        "Thương hiệu": "Brand",
        "Kiểu kết nối": "Connection type",
        "Mức giá": "Price range"
      },
      priceRange: {
        "Dưới 2 triệu": "Under 2M",
        "Từ 2 - 4 triệu": "2M - 4M",
        "Từ 4 - 7 triệu": "4M - 7M",
        "Từ 7 - 13 triệu": "7M - 13M",
        "Từ 13 - 20 triệu": "13M - 20M",
        "Trên 20 triệu": "Over 20M"
      },
      productDetail: {
        home: "Home",
        priceLabel: "PRICE (VAT included):",
        contactForPrice: "CONTACT US",
        callForAdvice: "CALL FOR ADVICE",
        notFoundTitle: "Oops! Dead end...",
        notFoundDesc: "This product could not be found.",
        connectionError: "Failed to connect to the server.",
        goBack: "Go back",
        specsTitle: "Detailed Specifications",
        contactModalTitle: "Customer Support",
        contactModalSubtitle: "Platihub customer support information",
        addressLabel: "Address",
        emailLabel: "Email",
        phoneLabel: "Phone",
        close: "Close"
      },
      footer: {
        tagline: "Global IT solutions & services.",
        connectWithUs: "Connect with us",
        address: "Address:",
        email: "Email:",
        phone: "Phone:"
      },
      promotion: {
        badge: "Promotion",
        defaultDescription: "A special offer for partners registering for hardware distribution at Platihub this month. Applicable to all peripheral component devices.",
        contactNote: "Please contact us to receive promotional information"
      },
      contact: {
        title: "Request Information",
        fullNamePlaceholder: "Full name",
        emailPlaceholder: "Email",
        phonePlaceholder: "Phone",
        titlePlaceholder: "Job title (optional)",
        companyPlaceholder: "Company / Organization (optional)",
        selectServiceType: "Select service type",
        serviceIct: "ICT Equipment Distribution",
        serviceSoftware: "Software Development",
        messagePlaceholder: "Message (optional)",
        send: "Send",
        addressLabel: "Address",
        emailLabel: "Email:",
        phoneLabel: "Phone:",
        workingHoursLabel: "Working hours:"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vn", // Ngôn ngữ mặc định
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React đã tự động chống XSS
    }
  });

export default i18n;

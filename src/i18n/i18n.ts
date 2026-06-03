// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vn: {
    translation: {
      menu: {
        about: "Về chúng tôi",
        news: "Tin tức",
        promotion: "Khuyến mại",
        contact: "Liên hệ",
        products: "Sản phẩm"
      },
      hero: {
        slogan: "CÔNG NGHỆ VƯƠN XA"
      },
      // Thêm vào bên trong translation của 'vn'
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
    }

    // Thêm vào bên trong translation của 'en'
    
      // Thêm các từ vựng khác vào đây trong tương lai...
    }
  },
  en: {
    translation: {
      menu: {
        about: "About Us",
        news: "News",
        promotion: "Promotions",
        contact: "Contact",
        products: "Products"
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
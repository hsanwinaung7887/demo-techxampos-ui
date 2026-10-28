import { useState, useEffect } from "react";
import "../../shared-style/user-css/servicePage.css";

// ============================================================
// ✅ Service Data
// ============================================================
const SERVICES = [
  {
    id: 1,
    icon: "fas fa-utensils",
    color: "#f8720a",
    colorLight: "rgba(248, 114, 10, 0.1)",
    title: {
      en: "Restaurant Management Software",
      my: "စားသောက်ဆိုင် စီမံခန့်ခွဲမှု ဆော့ဝဲလ်"
    },
    description: {
      en: "Complete solution for restaurants, cafes, and food businesses. Manage orders, tables, menu, inventory, and staff efficiently.",
      my: "စားသောက်ဆိုင်များ၊ ကော်ဖီဆိုင်များအတွက် အပြည့်အစုံ ဖြေရှင်းချက်။ အော်ဒါ၊ စားပွဲ၊ မီနူး၊ စတော့နှင့် ဝန်ထမ်းများကို ထိရောက်စွာ စီမံနိုင်သည်။"
    },
    features: {
      en: ["Table Management", "Order Tracking", "Kitchen Display", "Menu Editor"],
      my: ["စားပွဲ စီမံခန့်ခွဲမှု", "အော်ဒါ ခြေရာခံ", "မီးဖိုချောင် ပြသမှု", "မီနူး တည်းဖြတ်"]
    },
    // url: "https://restaurant.example.com",
    badge: {
      en: "New",
      my: "အသစ်"
    }
  },
  {
    id: 2,
    icon: "fas fa-building",
    color: "#4361ee",
    colorLight: "rgba(67, 97, 238, 0.1)",
    title: {
      en: "AeinYar.com",
      my: "အိမ်ခြံမြေ AeinYar.com"
    },
    subtitle: {
      en: "Real Estate • Buy & Sell • Hotel • Guest House",
      my: "အိမ်ခြံမြေ • အရောင်းအဝယ် • ဟိုတယ် • အဆောင် • တည်းခိုခန်း"
    },
    description: {
      en: "Complete platform for real estate business, hotel booking, guest house management, and property buy/sell transactions.",
      my: "အိမ်ခြံမြေ လုပ်ငန်း၊ ဟိုတယ် ကြိုတင်မှာယူမှု၊ အဆောင် စီမံခန့်ခွဲမှုနှင့် ပစ္စည်း အရောင်းအဝယ် အားလုံးအတွက် ပလက်ဖောင်း။"
    },
    features: {
      en: ["Property Listings", "Hotel Booking", "Guest House", "Buy & Sell"],
      my: ["အိမ်ခြံမြေ စာရင်း", "ဟိုတယ် ကြိုတင်မှာယူ", "တည်းခိုခန်း", "အရောင်းအဝယ်"]
    },
    url: "https://aeinyar.com",
        badge: {
      en: "Popular",
      my: "လူကြိုက်များ"
    }
  },
  {
    id: 3,
    icon: "fas fa-file-invoice-dollar",
    color: "#27ae60",
    colorLight: "rgba(39, 174, 96, 0.1)",
    title: {
      en: "Invoice Generator Software",
      my: "ဘောင်ချာ ဖန်တီး ဆော့ဝဲလ်"
    },
    description: {
      en: "Generate professional invoices, receipts, and quotations in seconds. Perfect for freelancers, small businesses, and shops.",
      my: "ပရော်ဖက်ရှင်နယ် ဘောင်ချာ၊ လက်ခံဘောင်၊ နှင့် စျေးနှုန်းစာရင်းများကို စက္ကန့်ပိုင်းအတွင်း ဖန်တီးပါ။ အလွတ်တန်း၊ လုပ်ငန်းငယ်နှင့် ဆိုင်များအတွက် သင့်တော်သည်။"
    },
    features: {
      en: ["PDF Export", "Custom Templates", "Auto Calculation", "Multi-Currency"],
      my: ["PDF ထုတ်ယူ", "စိတ်ကြိုက် ပုံစံ", "အလိုအလျောက် တွက်ချက်", "ငွေကြေး အမျိုးမျိုး"]
    },
    // url: "https://invoice.example.com",
    badge: {
      en: "New",
      my: "အသစ်"
    }
  }
];

// ============================================================
// ✅ Service Page Component
// ============================================================
const ServicePage = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("appLanguage") || 
    localStorage.getItem("pos-language") || 
    "mm"
  );

  // ✅ Language change listener
  useEffect(() => {
    const handleLanguageChange = (e) => {
      setLanguage(e.detail.language);
    };
    window.addEventListener("appLanguageChanged", handleLanguageChange);
    return () => window.removeEventListener("appLanguageChanged", handleLanguageChange);
  }, []);

  // ✅ Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const t = {
    title: language === "mm" ? "ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများ" : "Our Services",
    subtitle: language === "mm" 
      ? "သင့်လုပ်ငန်းအတွက် အကောင်းဆုံး ဆော့ဝဲလ် ဖြေရှင်းချက်များ" 
      : "Best software solutions for your business",
    ctaButton: language === "mm" ? "အသေးစိတ်ကြည့်ရန်" : "Learn More",
    featuresLabel: language === "mm" ? "အင်္ဂါရပ်များ" : "Features",
    footerText: language === "mm" 
      ? "နောက်ထပ် ဝန်ဆောင်မှုများ လိုအပ်ပါက ဆက်သွယ်ပါ" 
      : "Need more services? Contact us",
    contactButton: language === "mm" ? "ဆက်သွယ်ရန်" : "Contact Us"
  };

  return (
    <div className="service-page-main">
      {/* ===== Hero Header ===== */}
      <div className="service-hero">
        <div className="service-hero-content">
          <h1 className="service-hero-title">{t.title}</h1>
          <p className="service-hero-subtitle">{t.subtitle}</p>
          <div className="service-hero-line"></div>
        </div>
      </div>

      {/* ===== Services Grid ===== */}
      <div className="service-container">
        <div className="service-grid">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="service-card"
              style={{
                "--card-color": service.color,
                "--card-color-light": service.colorLight,
              }}
            >
              {/* Badge */}
              {service.badge && (
                <div className="service-badge">
                  {service.badge[language] || service.badge.en}
                </div>
              )}

              {/* Icon */}
              <div className="service-card-icon">
                <i className={service.icon}></i>
              </div>

              {/* Title */}
              <h3 className="service-card-title">
                {service.title[language] || service.title.en}
              </h3>

              {/* Subtitle (optional) */}
              {service.subtitle && (
                <p className="service-card-subtitle">
                  {service.subtitle[language] || service.subtitle.en}
                </p>
              )}

              {/* Description */}
              <p className="service-card-description">
                {service.description[language] || service.description.en}
              </p>

              {/* Features */}
              <div className="service-features">
                <div className="service-features-label">{t.featuresLabel}:</div>
                <div className="service-features-list">
                  {(service.features[language] || service.features.en).map((feature, idx) => (
                    <div key={idx} className="service-feature-item">
                      <i className="fas fa-check-circle"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="service-card-button"
              >
                <span>{t.ctaButton}</span>
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          ))}
        </div>

        {/* ===== Footer Note ===== */}
        <div className="service-footer-note">
          <p>{t.footerText}</p>
          <a href="/contact" className="service-contact-button">
            <i className="fas fa-envelope"></i>
            <span>{t.contactButton}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
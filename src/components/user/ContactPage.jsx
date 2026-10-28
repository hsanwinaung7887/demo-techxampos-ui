import { useState, useEffect } from "react";
import "../../shared-style/user-css/contactPage.css";
import { getApiBaseUrl } from "../utils/defineConfig";

const API_BASE_URL = getApiBaseUrl();

// ============================================================
// ✅ Contact Info Data
// ============================================================
const CONTACT_INFO = {
  website: "techxam.com",
  email: "contact@techxam.com",
  phones: ["09779002423", "09761800150"],
  location: {
    en: "Mandalay, Myanmar",
    my: "မန္တလေး၊ မြန်မာ"
  }
};

// ============================================================
// ✅ Social Media Links
// ============================================================
const SOCIAL_LINKS = [
  { name: "Facebook", icon: "fab fa-facebook-f", url: "https://facebook.com/techxam", color: "#1877f2" },
  { name: "TikTok", icon: "fab fa-tiktok", url: "https://www.tiktok.com/@techxam440", color: "#000000" },
  { name: "Telegram", icon: "fab fa-telegram-plane", url: "https://t.me/techxam_software", color: "#0088cc" },
  { name: "Viber", icon: "fab fa-viber", url: "viber://chat?number=09779002423", color: "#7360f2" },
  { name: "Website", icon: "fas fa-globe", url: "https://techxam.com", color: "#f8720a" }
];

// ============================================================
// ✅ Contact Page Component
// ============================================================
const ContactPage = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("appLanguage") ||
    localStorage.getItem("pos-language") ||
    "mm"
  );

  // ✅ Send Mail Modal states
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailForm, setMailForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [mailSending, setMailSending] = useState(false);
  const [mailStatus, setMailStatus] = useState({ type: "", text: "" });

  // ✅ Language listener
  useEffect(() => {
    const handleLanguageChange = (e) => setLanguage(e.detail.language);
    window.addEventListener("appLanguageChanged", handleLanguageChange);
    return () => window.removeEventListener("appLanguageChanged", handleLanguageChange);
  }, []);

  // ✅ Scroll top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const t = {
    title: language === "mm" ? "ဆက်သွယ်ရန်" : "Contact Us",
    subtitle: language === "mm"
      ? "ကျွန်ုပ်တို့နှင့် ဆက်သွယ်ရန် အချက်အလက်များ"
      : "Get in touch with us",
    introText: language === "mm"
      ? "မေးခွန်းများ၊ အကြံပြုချက်များ သို့မဟုတ် အကူအညီလိုအပ်ပါက အောက်ပါ နည်းလမ်းများဖြင့် ဆက်သွယ်နိုင်ပါသည်။"
      : "For questions, suggestions, or support, you can reach us through the following channels.",
    websiteLabel: language === "mm" ? "ဝဘ်ဆိုဒ်" : "Website",
    emailLabel: language === "mm" ? "အီးမေးလ်" : "Email",
    phoneLabel: language === "mm" ? "ဖုန်း" : "Phone",
    locationLabel: language === "mm" ? "တည်နေရာ" : "Location",
    socialLabel: language === "mm" ? "လူမှုကွန်ရက်" : "Follow Us",
    callNow: language === "mm" ? "ဖုန်းဆက်ရန်" : "Call Now",
    sendEmail: language === "mm" ? "အီးမေးလ်ပို့ရန်" : "Send Email",
    visitWebsite: language === "mm" ? "ဝဘ်ဆိုဒ်သွားရန်" : "Visit Website",
    openMap: language === "mm" ? "မြေပုံကြည့်ရန်" : "View on Map",
    officeHours: language === "mm" ? "ရုံးဖွင့်ချိန်" : "Office Hours",
    officeHoursWeekday: language === "mm"
      ? "တနင်္လာ - သောကြာ: ၉:၀၀ - ၁၇:၀၀"
      : "Mon - Fri: 9:00 AM - 5:00 PM",
    officeHoursSaturday: language === "mm"
      ? "စနေ: ၉:၀၀ - ၁၂:၀၀"
      : "Saturday: 9:00 AM - 12:00 PM",
    officeHoursSunday: language === "mm"
      ? "တနင်္ဂနွေ: ပိတ်"
      : "Sunday: Closed",
    footerText: language === "mm"
      ? "သင့်ကို အမြန်ဆုံး ပြန်လည်ဖြေကြားပေးပါမည်"
      : "We'll get back to you as soon as possible",
    // ✅ Mail Modal
    mailModalTitle: language === "mm" ? "အီးမေးလ် ပို့ရန်" : "Send us a message",
    nameLabel: language === "mm" ? "သင့်အမည်" : "Your Name",
    namePlaceholder: language === "mm" ? "အမည် ထည့်ပါ" : "Enter your name",
    emailLabel2: language === "mm" ? "သင့်အီးမေးလ်" : "Your Email",
    emailPlaceholder: language === "mm" ? "အီးမေးလ် ထည့်ပါ" : "Enter your email",
    phoneLabel2: language === "mm" ? "ဖုန်းနံပါတ်" : "Phone Number",
    phonePlaceholder: language === "mm" ? "ဖုန်းနံပါတ် ထည့်ပါ" : "Enter your phone",
    subjectLabel: language === "mm" ? "ခေါင်းစဉ်" : "Subject",
    subjectPlaceholder: language === "mm" ? "ခေါင်းစဉ် ထည့်ပါ" : "Enter subject",
    messageLabel: language === "mm" ? "မက်ဆေ့ခ်ျ" : "Message",
    messagePlaceholder: language === "mm" ? "သင့်မက်ဆေ့ခ်ျကို ရေးပါ..." : "Write your message...",
    sendBtn: language === "mm" ? "ပို့ရန်" : "Send Message",
    sendingBtn: language === "mm" ? "ပို့နေသည်..." : "Sending...",
    cancelBtn: language === "mm" ? "ပယ်ဖျက်" : "Cancel",
    requiredField: language === "mm" ? "လိုအပ်ပါသည်" : "is required",
    invalidEmail: language === "mm" ? "အီးမေးလ် မှားနေပါသည်" : "Invalid email",
    successMsg: language === "mm"
      ? "သင့်မက်ဆေ့ခ်ျကို အောင်မြင်စွာ ပို့ပြီးပါပြီ။ မကြာမီ ပြန်လည်ဆက်သွယ်ပါမည်။"
      : "Your message has been sent successfully. We'll get back to you soon.",
    errorMsg: language === "mm"
      ? "မက်ဆေ့ခ်ျ ပို့ရန် မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။"
      : "Failed to send message. Please try again."
  };

  // ✅ Handlers
  const handleEmailClick = () => {
    setShowMailModal(true);
    setMailStatus({ type: "", text: "" });
  };

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMapClick = () => {
    const location = CONTACT_INFO.location.en;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, "_blank");
  };

  const handleWebsiteClick = () => {
    window.open(`https://${CONTACT_INFO.website}`, "_blank");
  };

  // ✅ Mail Form Handlers
  const handleMailChange = (e) => {
    const { name, value } = e.target;
    setMailForm(prev => ({ ...prev, [name]: value }));
    if (mailStatus.text) setMailStatus({ type: "", text: "" });
  };

  // ✅ Send Mail - ONE CLICK, ONE EMAIL
  const handleSendMail = async (e) => {
    e.preventDefault();

    // Validation
    if (!mailForm.name.trim()) {
      setMailStatus({ type: "error", text: `${t.nameLabel} ${t.requiredField}` });
      return;
    }
    if (!mailForm.email.trim()) {
      setMailStatus({ type: "error", text: `${t.emailLabel2} ${t.requiredField}` });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailForm.email)) {
      setMailStatus({ type: "error", text: t.invalidEmail });
      return;
    }
    if (!mailForm.message.trim()) {
      setMailStatus({ type: "error", text: `${t.messageLabel} ${t.requiredField}` });
      return;
    }

    setMailSending(true);
    setMailStatus({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/contact/send-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mailForm.name.trim(),
          email: mailForm.email.trim(),
          phone: mailForm.phone.trim() || "N/A",
          subject: mailForm.subject.trim() || `Contact from ${mailForm.name}`,
          message: mailForm.message.trim(),
          toEmail: CONTACT_INFO.email
        })
      });

      const data = await response.json();

      if (data.success) {
        setMailStatus({ type: "success", text: t.successMsg });
        setMailForm({ name: "", email: "", phone: "", subject: "", message: "" });

        // ✅ 3 sec ကြာရင် modal ပိတ်
        setTimeout(() => {
          setShowMailModal(false);
          setMailStatus({ type: "", text: "" });
        }, 3000);
      } else {
        setMailStatus({ type: "error", text: data.message || t.errorMsg });
      }
    } catch (error) {
      console.error("Send mail error:", error);
      setMailStatus({ type: "error", text: t.errorMsg });
    } finally {
      setMailSending(false);
    }
  };

  const closeMailModal = () => {
    if (mailSending) return;
    setShowMailModal(false);
    setMailStatus({ type: "", text: "" });
  };

  return (
    <div className="contact-page-main">
      {/* ===== Hero ===== */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">{t.title}</h1>
          <p className="contact-hero-subtitle">{t.subtitle}</p>
          <div className="contact-hero-line"></div>
        </div>
      </div>

      {/* ===== Container ===== */}
      <div className="contact-container">
        <p className="contact-intro-text">{t.introText}</p>

        {/* ===== Contact Cards ===== */}
        <div className="contact-grid">

          {/* Website */}
          <div className="contact-card contact-card-website">
            <div className="contact-card-icon"><i className="fas fa-globe"></i></div>
            <h3 className="contact-card-title">{t.websiteLabel}</h3>
            <p className="contact-card-value">{CONTACT_INFO.website}</p>
            <button className="contact-card-button" onClick={handleWebsiteClick}>
              <i className="fas fa-external-link-alt"></i>
              <span>{t.visitWebsite}</span>
            </button>
          </div>

          {/* Email - Send Mail Modal ဖွင့် */}
          <div className="contact-card contact-card-email">
            <div className="contact-card-icon"><i className="fas fa-envelope"></i></div>
            <h3 className="contact-card-title">{t.emailLabel}</h3>
            <p className="contact-card-value">{CONTACT_INFO.email}</p>
            <button className="contact-card-button" onClick={handleEmailClick}>
              <i className="fas fa-paper-plane"></i>
              <span>{t.sendEmail}</span>
            </button>
          </div>

          {/* Phone */}
          <div className="contact-card contact-card-phone">
            <div className="contact-card-icon"><i className="fas fa-phone-alt"></i></div>
            <h3 className="contact-card-title">{t.phoneLabel}</h3>
            <div className="contact-phone-list">
              {CONTACT_INFO.phones.map((phone, idx) => (
                <button
                  key={idx}
                  className="contact-phone-item"
                  onClick={() => handlePhoneClick(phone)}
                >
                  <i className="fas fa-phone"></i>
                  <span>{phone}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="contact-card contact-card-location">
            <div className="contact-card-icon"><i className="fas fa-map-marker-alt"></i></div>
            <h3 className="contact-card-title">{t.locationLabel}</h3>
            <p className="contact-card-value">
              {CONTACT_INFO.location[language] || CONTACT_INFO.location.en}
            </p>
            <button className="contact-card-button" onClick={handleMapClick}>
              <i className="fas fa-map"></i>
              <span>{t.openMap}</span>
            </button>
          </div>
        </div>

        {/* Office Hours */}
        <div className="contact-hours-section">
          <div className="contact-hours-icon"><i className="fas fa-clock"></i></div>
          <div className="contact-hours-content">
            <h3 className="contact-hours-title">{t.officeHours}</h3>
            <div className="contact-hours-list">
              <div className="contact-hours-item">
                <i className="fas fa-calendar-day"></i>
                <span>{t.officeHoursWeekday}</span>
              </div>
              <div className="contact-hours-item">
                <i className="fas fa-calendar-day"></i>
                <span>{t.officeHoursSaturday}</span>
              </div>
              <div className="contact-hours-item contact-hours-closed">
                <i className="fas fa-calendar-times"></i>
                <span>{t.officeHoursSunday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="contact-social-section">
          <h3 className="contact-social-title">{t.socialLabel}</h3>
          <div className="contact-social-list">
            {SOCIAL_LINKS.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-item"
                style={{ "--social-color": social.color }}
                title={social.name}
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="contact-footer-note">
          <i className="fas fa-heart"></i>
          <p>{t.footerText}</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ✅ SEND MAIL MODAL */}
      {/* ============================================================ */}
      {showMailModal && (
        <div className="contact-mail-overlay" onClick={closeMailModal}>
          <div className="contact-mail-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="contact-mail-header">
              <div className="contact-mail-header-title">
                <i className="fas fa-paper-plane"></i>
                <h3>{t.mailModalTitle}</h3>
              </div>
              <button className="contact-mail-close" onClick={closeMailModal} disabled={mailSending}>
                ✕
              </button>
            </div>

            {/* Success Message */}
            {mailStatus.type === "success" && (
              <div className="contact-mail-success">
                <div className="contact-mail-success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <p>{mailStatus.text}</p>
              </div>
            )}

            {/* Form */}
            {mailStatus.type !== "success" && (
              <form className="contact-mail-form" onSubmit={handleSendMail}>

                {/* Error */}
                {mailStatus.type === "error" && (
                  <div className="contact-mail-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{mailStatus.text}</span>
                  </div>
                )}

                {/* Name + Email Row */}
                <div className="contact-mail-row">
                  <div className="contact-mail-group">
                    <label>
                      <i className="fas fa-user"></i>
                      {t.nameLabel} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={mailForm.name}
                      onChange={handleMailChange}
                      placeholder={t.namePlaceholder}
                      disabled={mailSending}
                    />
                  </div>

                  <div className="contact-mail-group">
                    <label>
                      <i className="fas fa-envelope"></i>
                      {t.emailLabel2} <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={mailForm.email}
                      onChange={handleMailChange}
                      placeholder={t.emailPlaceholder}
                      disabled={mailSending}
                    />
                  </div>
                </div>

                {/* Phone + Subject Row */}
                <div className="contact-mail-row">
                  <div className="contact-mail-group">
                    <label>
                      <i className="fas fa-phone"></i>
                      {t.phoneLabel2}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={mailForm.phone}
                      onChange={handleMailChange}
                      placeholder={t.phonePlaceholder}
                      disabled={mailSending}
                    />
                  </div>

                  <div className="contact-mail-group">
                    <label>
                      <i className="fas fa-tag"></i>
                      {t.subjectLabel}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={mailForm.subject}
                      onChange={handleMailChange}
                      placeholder={t.subjectPlaceholder}
                      disabled={mailSending}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="contact-mail-group">
                  <label>
                    <i className="fas fa-comment-dots"></i>
                    {t.messageLabel} <span className="required">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={mailForm.message}
                    onChange={handleMailChange}
                    placeholder={t.messagePlaceholder}
                    rows="5"
                    disabled={mailSending}
                  ></textarea>
                </div>

                {/* Buttons */}
                <div className="contact-mail-actions">
                  <button
                    type="button"
                    className="contact-mail-btn cancel"
                    onClick={closeMailModal}
                    disabled={mailSending}
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    className="contact-mail-btn send"
                    disabled={mailSending}
                  >
                    {mailSending ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>{t.sendingBtn}</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span>{t.sendBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
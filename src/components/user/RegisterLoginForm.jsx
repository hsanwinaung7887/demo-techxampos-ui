import { useState } from "react";
import "../../shared-style/user-css/RegistrationForm-shared.css";
import "../../light-style/user-css/RegistrationForm.css"

const translations = {
  en: {
    welcomeBack: "Welcome back to TechXamPOS!",
    createAccount: "Create Account",
    loginDesc: "Login to manage your Cloud POS",
    registerDesc: "Register your shop and start selling",
    toggleTo: { login: "Login", register: "Register" },
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    password_login: "Password",
    shopName: "Shop Name",
    address: "Address",
    phone: "Phone",
  },
  my: {
    welcomeBack: "TechXamPOS မှပြန်လည်ကြိုဆိုပါသည်။",
    createAccount: "အကောင့်အသစ်ဖန်တီးပါ။",
    loginDesc: "သင့် Cloud POS ကိုစီမံရန် Login ဝင်ပါ။",
    registerDesc: "သင့်ဆိုင်ကို register လုပ်ပြီး ရောင်းချပါ။",
    toggleTo: { login: "Login", register: "Register" },
    login: "Login",
    register: "Register",
    email: "အီးမေးလ်",
    password: "စကားဝှက်",
    password_login: "စကားဝှက်",
    shopName: "ဆိုင်အမည်",
    address: "ဆိုင်လိပ်စာ",
    phone: "ဖုန်းနံပါတ်",
  },
};

const RegisterLoginForm = ({ theme, language }) => {
  const t = translations[language];
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="pos-auth-wrapper">
      <div className={`auth-card ${isLogin ? "login" : "register"}`}>
        <div className="auth-info">
          <h2>{isLogin ? t.welcomeBack : t.createAccount}</h2>
          <p>{isLogin ? t.loginDesc : t.registerDesc}</p>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? t.toggleTo.register : t.toggleTo.login}
          </button>
        </div>

        <div className="auth-form">
          {isLogin ? (
            <form>
              <h3 className="log-reg">{t.login}</h3>
              <input type="email" placeholder={t.email} required />
              <input type="password" placeholder={t.password_login} required />
              <button type="submit">{t.login}</button>
            </form>
          ) : (
            <form className="form">
              <h3 className="log-reg">{t.register}</h3>
              <input type="text" placeholder={t.shopName} required />
              <input type="text" placeholder={t.address} required />
              <input type="text" placeholder={t.phone} required />
              <input type="email" placeholder={t.email} required />
              <input type="text" placeholder={t.shopName} required />
              <input type="text" placeholder={t.address} required />
              <input type="text" placeholder={t.phone} required />
              <input type="email" placeholder={t.email} required />              <input type="text" placeholder={t.shopName} required />
              <input type="text" placeholder={t.address} required />
              <input type="text" placeholder={t.phone} required />
              <input type="email" placeholder={t.email} required />

              <input type="password" placeholder={t.password} required />
              <button type="submit">{t.register}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterLoginForm;

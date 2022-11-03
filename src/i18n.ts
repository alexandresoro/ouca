import i18n from "i18next";
import i18nextHttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

void i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(i18nextHttpBackend)
  .init({
    lng: "fr", // if you're using a language detector, do not define the lng option
    fallbackLng: "fr",

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

export default i18n;

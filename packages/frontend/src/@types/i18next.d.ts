import "i18next";
import type translation from "../../public/locales/fr/translation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof translation;
    };
  }
}

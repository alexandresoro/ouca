import "i18next";
import type translation from "../../public/locales/fr/translation.json";

declare module "i18next" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CustomTypeOptions {
    resources: {
      translation: typeof translation;
    };
  }
}

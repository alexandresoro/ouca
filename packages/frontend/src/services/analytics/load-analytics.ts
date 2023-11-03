import { type AppConfig } from "@services/config/config";

export default (umami: AppConfig["umami"]): void => {
  if (umami) {
    const scriptEl = document.createElement("script");
    scriptEl.src = umami.url;
    scriptEl.async = true;
    scriptEl.defer = true;
    scriptEl.setAttribute("data-website-id", umami.id);

    document.head.appendChild(scriptEl);
  }
};

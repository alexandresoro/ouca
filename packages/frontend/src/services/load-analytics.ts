import { type AppConfig } from "../types/AppConfig";

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

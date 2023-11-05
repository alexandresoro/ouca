export type UmamiConfig = {
  url: string;
  id: string;
};

export const loadAnalytics = (umami: UmamiConfig): void => {
  const scriptEl = document.createElement("script");
  scriptEl.src = umami.url;
  scriptEl.async = true;
  scriptEl.defer = true;
  scriptEl.setAttribute("data-website-id", umami.id);

  document.head.appendChild(scriptEl);
};

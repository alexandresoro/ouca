import { atom } from "jotai";

export const isBrowserUsingDarkModeAtom = atom<boolean>();
isBrowserUsingDarkModeAtom.onMount = (set) => {
  const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
  const setMode = () => {
    set(darkModePreference.matches);
  };

  setMode();

  darkModePreference.addEventListener("change", setMode);
  return () => {
    darkModePreference.removeEventListener("change", setMode);
  };
};

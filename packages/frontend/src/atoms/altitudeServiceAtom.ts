import { atom } from "jotai";

export const altitudeServiceStatusAtom = atom<"idle" | "ongoing" | "error">("idle");

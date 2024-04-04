import { atom } from "jotai";
import type { MapProvider } from "./map-style-providers";

export const mapStyleAtom = atom<MapProvider>("ign");

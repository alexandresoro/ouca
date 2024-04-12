import { atom, useAtomValue } from "jotai";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Features = {};

const DEFAULT_FEATURES = {} satisfies Features;

export const appFeaturesAtom = atom<Features>(DEFAULT_FEATURES);

export const useFeatures = () => useAtomValue(appFeaturesAtom);

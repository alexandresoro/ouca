import { atom, useAtomValue } from "jotai";

export type Features = {
  tmp_export_search_results: boolean;
};

const DEFAULT_FEATURES = {
  tmp_export_search_results: false,
} satisfies Features;

export const appFeaturesAtom = atom<Features>(DEFAULT_FEATURES);

export const useFeatures = () => useAtomValue(appFeaturesAtom);

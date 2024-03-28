import { atom, useAtomValue } from "jotai";

export type Features = {
  tmp_only_own_observations_filter: boolean;
  tmp_export_search_results: boolean;
};

const DEFAULT_FEATURES = {
  tmp_only_own_observations_filter: false,
  tmp_export_search_results: false,
} satisfies Features;

export const appFeaturesAtom = atom<Features>(DEFAULT_FEATURES);

export const useFeatures = () => useAtomValue(appFeaturesAtom);

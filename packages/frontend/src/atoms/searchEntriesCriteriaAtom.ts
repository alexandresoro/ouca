import { type SearchCriteriaParams } from "@ou-ca/common/api/common/search-criteria";
import { atom } from "jotai";

export const searchEntriesCriteriaAtom = atom<SearchCriteriaParams>({});

import type { GetMeResponse } from "@ou-ca/common/api/me";
import { atom } from "jotai";

export const settingsAtom = atom<GetMeResponse["settings"]>(null);

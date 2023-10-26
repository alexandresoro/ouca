import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { inventoryLocalityAtom } from "./inventoryFormAtoms";

export const departmentIdAtom = atomWithReset<string | null>(null);
export const townIdAtom = atomWithReset<string | null>(null);

export type LocalitySelectionType = {
  type: "department" | "town" | "locality";
  id: string;
} | null;

export const localitySelectionAtom = atom((get) => {
  const locality = get(inventoryLocalityAtom);
  const townId = get(townIdAtom);
  const departmentId = get(departmentIdAtom);

  if (locality?.id != null) {
    return {
      type: "locality",
      id: locality.id,
    } as const;
  }

  if (townId != null) {
    return {
      type: "town",
      id: townId,
    } as const;
  }

  if (departmentId != null) {
    return {
      type: "department",
      id: departmentId,
    } as const;
  }

  return null;
});

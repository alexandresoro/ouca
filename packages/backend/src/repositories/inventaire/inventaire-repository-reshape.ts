import { type Inventaire, type RawInventaire } from "./inventaire-repository-types.js";

export function reshapeRawInventaire(rawInventaire: null): null;
export function reshapeRawInventaire(rawInventaire: RawInventaire): Inventaire;
export function reshapeRawInventaire(rawInventaire: RawInventaire | null): Inventaire | null;
export function reshapeRawInventaire(rawInventaire: RawInventaire | null): Inventaire | null {
  if (!rawInventaire) {
    return null;
  }

  const { altitude, latitude, longitude, ...restInventaire } = rawInventaire;

  const customizedCoordinates =
    altitude != null && latitude != null && longitude != null
      ? {
          altitude,
          latitude,
          longitude,
        }
      : null;

  return {
    ...restInventaire,
    customizedCoordinates,
  };
}

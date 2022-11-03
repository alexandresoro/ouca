import { Inventaire } from "../gql/graphql";

export const getInventaireCoordinates = (
  inventaire: Inventaire
): { latitude: number; longitude: number; altitude: number } => {
  // Customized coordinates are defined
  if (inventaire.customizedCoordinates && inventaire.customizedCoordinates.longitude != null) {
    return {
      latitude: inventaire.customizedCoordinates.latitude,
      longitude: inventaire.customizedCoordinates.longitude,
      altitude: inventaire.customizedCoordinates.altitude
    };
  }

  // Default lieu-dit coordinates are used
  return {
    latitude: inventaire.lieuDit.latitude,
    longitude: inventaire.lieuDit.longitude,
    altitude: inventaire.lieuDit.altitude
  };
};

import { getDefaultStore } from "jotai";
import { altitudeServiceStatusAtom } from "../atoms/altitudeServiceAtom";
import { queryClient } from "../query/query-client";
import { type CoordinatesWithAltitude } from "../types/Coordinates";
import { getAltitudeForCoordinates } from "./ign-alticodage-service";

const defaultAtomStore = getDefaultStore();

type AltitudeToDisplayResult =
  | {
      outcome: "success";
      source: "customCoordinates" | "localityCoordinates" | "ign";
      altitude: number;
    }
  | {
      outcome: "error";
    };

// Method that handles the altitude that corresponds to the given coordinates and parameters
export const getAltitudeToDisplay = async (
  {
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  },
  localityCoordinates: CoordinatesWithAltitude,
  customizedCoordinates: CoordinatesWithAltitude | null
): Promise<AltitudeToDisplayResult> => {
  defaultAtomStore.set(altitudeServiceStatusAtom, "ongoing");

  // Return altitude from custom inventory one when coordinates match
  if (latitude === customizedCoordinates?.lat && longitude === customizedCoordinates.lng) {
    defaultAtomStore.set(altitudeServiceStatusAtom, "idle");
    return {
      outcome: "success",
      source: "customCoordinates",
      altitude: customizedCoordinates.altitude,
    };
  }

  // Return altitude from locality one when coordinates match
  if (latitude === localityCoordinates.lat && longitude === localityCoordinates.lng) {
    defaultAtomStore.set(altitudeServiceStatusAtom, "idle");
    return {
      outcome: "success",
      source: "localityCoordinates",
      altitude: localityCoordinates.altitude,
    };
  }

  // Otherwise, retrieve the altitude from the ign service
  return queryClient
    .fetchQuery({
      queryKey: ["IGN", "altimetrie", { latitude, longitude }],
      queryFn: () => getAltitudeForCoordinates({ latitude, longitude }),
      staleTime: Infinity,
    })
    .then((ignAltimetrieServiceResult) => {
      switch (ignAltimetrieServiceResult.outcome) {
        case "success":
          defaultAtomStore.set(altitudeServiceStatusAtom, "idle");
          return {
            outcome: "success",
            source: "ign",
            // Round the altitude returned by the service
            altitude: Math.round(ignAltimetrieServiceResult.altitude),
          };
        case "error":
          defaultAtomStore.set(altitudeServiceStatusAtom, "error");
          return {
            outcome: "error",
          };
      }
    });
};

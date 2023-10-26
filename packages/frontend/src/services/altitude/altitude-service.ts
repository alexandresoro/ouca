import { type CoordinatesWithAltitude } from "@typings/Coordinates";
import { atom, getDefaultStore } from "jotai";
import { LRUCache } from "lru-cache";
import { getAltitudeForCoordinates } from "./providers/ign-alticodage-service";

const altitudeServiceCache = new LRUCache<string, number>({
  max: 1000,
  fetchMethod: async (key) => {
    const coordinates = JSON.parse(key) as {
      latitude: number;
      longitude: number;
    };
    const ignAltimetrieServiceResult = await getAltitudeForCoordinates(coordinates);
    switch (ignAltimetrieServiceResult.outcome) {
      case "success":
        // Round the altitude returned by the service
        return Math.round(ignAltimetrieServiceResult.altitude);
      case "error":
        return undefined;
    }
  },
});

const defaultAtomStore = getDefaultStore();

// Atom to retrieve the current status of altitude retrieval
export const altitudeServiceStatusAtom = atom<"idle" | "ongoing" | "error">("idle");

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

  // Check in the LRU cache if the altitude is already present
  // Otherwise, retrieve the altitude from the ign service
  const altitude = await altitudeServiceCache.fetch(JSON.stringify({ latitude, longitude }));

  if (altitude !== undefined) {
    defaultAtomStore.set(altitudeServiceStatusAtom, "idle");
    return {
      outcome: "success",
      source: "ign",
      // Round the altitude returned by the service
      altitude,
    };
  } else {
    defaultAtomStore.set(altitudeServiceStatusAtom, "error");
    return {
      outcome: "error",
    };
  }
};

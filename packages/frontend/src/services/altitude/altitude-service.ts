import { fetchApiAltitude } from "@services/api/altitude/api-altitude-queries";
import type { CoordinatesWithAltitude } from "@typings/Coordinates";
import { FetchError } from "@utils/fetch-api";
import { atom, getDefaultStore } from "jotai";
import { LRUCache } from "lru-cache";

type AltitudeServiceResult =
  | {
      outcome: "success";
      altitude: number;
    }
  | {
      outcome: "error";
      reason: "unsupportedCoordinates" | "unknownError";
    };

const altitudeServiceCache = new LRUCache<string, AltitudeServiceResult>({
  max: 1000,
  fetchMethod: async (key) => {
    const { latitude, longitude, apiUrl, token } = JSON.parse(key) as {
      apiUrl: string;
      token: string;
      latitude: number;
      longitude: number;
    };

    try {
      const ignAltimetrieServiceResult = await fetchApiAltitude(
        {
          latitude,
          longitude,
        },
        {
          apiUrl,
          token,
        },
      );
      // Round the altitude returned by the service
      return {
        outcome: "success",
        altitude: Math.round(ignAltimetrieServiceResult.altitude),
      };
    } catch (error) {
      if (error instanceof FetchError && error.status === 404) {
        return {
          outcome: "error",
          reason: "unsupportedCoordinates",
        };
      }

      return {
        outcome: "error",
        reason: "unknownError",
      };
    }
  },
});

const defaultAtomStore = getDefaultStore();

// Atom to retrieve the current status of altitude retrieval
export const altitudeServiceStatusAtom = atom<"idle" | "ongoing" | "unsupportedArea" | "error">("idle");

type AltitudeToDisplayResult =
  | {
      outcome: "success";
      source: "customCoordinates" | "localityCoordinates" | "api";
      altitude: number;
    }
  | {
      outcome: "error";
      reason: "unsupportedCoordinates" | "unknownError";
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
  customizedCoordinates: CoordinatesWithAltitude | null,
  {
    apiUrl,
    token,
  }: {
    apiUrl: string;
    token: string;
  },
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
  // Otherwise, retrieve the altitude from the api
  const altitudeResult = await altitudeServiceCache.fetch(JSON.stringify({ latitude, longitude, apiUrl, token }));

  if (altitudeResult !== undefined) {
    if (altitudeResult.outcome === "error") {
      defaultAtomStore.set(
        altitudeServiceStatusAtom,
        altitudeResult.reason === "unsupportedCoordinates" ? "unsupportedArea" : "error",
      );
      return {
        outcome: "error",
        reason: altitudeResult.reason,
      };
    }

    defaultAtomStore.set(altitudeServiceStatusAtom, "idle");
    return {
      outcome: "success",
      source: "api",
      // Round the altitude returned by the service
      altitude: altitudeResult.altitude,
    };
  }

  defaultAtomStore.set(altitudeServiceStatusAtom, "error");
  return {
    outcome: "error",
    reason: "unknownError",
  };
};

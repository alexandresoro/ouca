import { type Inventory } from "@ou-ca/common/entities/inventory";
import { type Locality } from "@ou-ca/common/entities/locality";
import { atom } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { getAltitudeToDisplay } from "../services/altitude-service";
import { type Coordinates, type CoordinatesWithAltitude } from "../types/Coordinates";

// The current coordinates
const inventoryLatitudeInternal = atomWithReset<number | null>(null);
export const inventoryLatitudeAtom = atom(
  (get) => {
    return get(inventoryLatitudeInternal);
  },
  async (get, set, newLatitude: number | null | typeof RESET) => {
    // Update altitude
    if (newLatitude != null && newLatitude !== RESET) {
      const longitude = get(inventoryLongitudeAtom);

      const localityCoordinates = get(inventoryLocalityAtom)?.coordinates;
      const customizedCoordinates = get(storedCustomizedCoordinatesAtom);

      if (longitude != null && localityCoordinates != null) {
        const altitudeResult = await getAltitudeToDisplay(
          {
            latitude: newLatitude,
            longitude,
          },
          {
            lat: localityCoordinates.latitude,
            lng: localityCoordinates.longitude,
            altitude: localityCoordinates.altitude,
          },
          customizedCoordinates
        );
        if (altitudeResult.outcome === "success") {
          set(inventoryAltitudeAtom, altitudeResult.altitude);
        }
      }
    }
    set(inventoryLatitudeInternal, newLatitude);
  }
);

export const inventoryLongitudeInternal = atomWithReset<number | null>(null);
export const inventoryLongitudeAtom = atom(
  (get) => {
    return get(inventoryLongitudeInternal);
  },
  async (get, set, newLongitude: number | null | typeof RESET) => {
    // Update altitude
    if (newLongitude != null && newLongitude !== RESET) {
      const latitude = get(inventoryLatitudeAtom);

      const localityCoordinates = get(inventoryLocalityAtom)?.coordinates;
      const customizedCoordinates = get(storedCustomizedCoordinatesAtom);

      if (latitude != null && localityCoordinates != null) {
        const altitudeResult = await getAltitudeToDisplay(
          {
            latitude,
            longitude: newLongitude,
          },
          {
            lat: localityCoordinates.latitude,
            lng: localityCoordinates.longitude,
            altitude: localityCoordinates.altitude,
          },
          customizedCoordinates
        );
        if (altitudeResult.outcome === "success") {
          set(inventoryAltitudeAtom, altitudeResult.altitude);
        }
      }
    }
    set(inventoryLongitudeInternal, newLongitude);
  }
);

export const inventoryAltitudeAtom = atomWithReset<number | null>(null);

// The stored custom coordinates, if any
export const storedCustomizedCoordinatesAtom = atomWithReset<CoordinatesWithAltitude | null>(null);

export const inventoryCoordinatesAtom = atom(
  (get) => {
    const lat = get(inventoryLatitudeAtom);
    const lng = get(inventoryLongitudeAtom);
    if (lat != null && lng != null) {
      return {
        lat,
        lng,
      };
    }
    return undefined;
  },
  async (get, set, newCoordinates: Coordinates | typeof RESET) => {
    set(inventoryLatitudeInternal, newCoordinates === RESET ? newCoordinates : newCoordinates.lat);
    set(inventoryLongitudeInternal, newCoordinates === RESET ? newCoordinates : newCoordinates.lng);

    // Update altitude
    if (newCoordinates !== RESET) {
      const localityCoordinates = get(inventoryLocalityAtom)?.coordinates;
      const customizedCoordinates = get(storedCustomizedCoordinatesAtom);

      if (localityCoordinates != null) {
        const altitudeResult = await getAltitudeToDisplay(
          {
            latitude: newCoordinates.lat,
            longitude: newCoordinates.lng,
          },
          {
            lat: localityCoordinates.latitude,
            lng: localityCoordinates.longitude,
            altitude: localityCoordinates.altitude,
          },
          customizedCoordinates
        );
        if (altitudeResult.outcome === "success") {
          set(inventoryAltitudeAtom, altitudeResult.altitude);
        }
      }
    }
  }
);

const inventoryCoordinatesWithAltitudeSetAtom = atom(
  null,
  async (get, set, newCoordinates: CoordinatesWithAltitude | typeof RESET) => {
    await set(inventoryCoordinatesAtom, newCoordinates);
    set(inventoryAltitudeAtom, newCoordinates === RESET ? newCoordinates : newCoordinates.altitude);
  }
);

// To make sure that when the locality is set/reset, the coordinates are also set/reset
const inventoryLocalityInternal = atomWithReset<Locality | null>(null);
export const inventoryLocalityAtom = atom(
  (get) => {
    return get(inventoryLocalityInternal);
  },
  async (get, set, newValue: Locality | null | typeof RESET) => {
    const currentLocality = get(inventoryLocalityInternal);
    set(inventoryLocalityInternal, newValue);
    if (newValue === RESET || newValue === null) {
      await set(inventoryCoordinatesWithAltitudeSetAtom, RESET);
    } else if (newValue?.id !== currentLocality?.id) {
      // Update the coordinates
      // It is necessary only if the locality is updated
      const coordinates = {
        lat: newValue.coordinates.latitude,
        lng: newValue.coordinates.longitude,
        altitude: newValue.coordinates.altitude,
      };
      await set(inventoryCoordinatesWithAltitudeSetAtom, coordinates);
    }
  }
);

// Write-only atom to update data when a new inventory is the current one
export const inventorySetAtom = atom(null, async (get, set, newInventory: Inventory | typeof RESET) => {
  if (newInventory === RESET) {
    set(storedCustomizedCoordinatesAtom, RESET);
    await set(inventoryLocalityAtom, RESET);
  } else {
    await set(inventoryLocalityAtom, newInventory.locality);
    const customizedCoordinates = newInventory.customizedCoordinates;
    if (customizedCoordinates != null) {
      const customCoordinates = {
        lat: customizedCoordinates.latitude,
        lng: customizedCoordinates.longitude,
        altitude: customizedCoordinates.altitude,
      };
      set(storedCustomizedCoordinatesAtom, customCoordinates);
      await set(inventoryCoordinatesWithAltitudeSetAtom, customCoordinates);
    } else {
      const localityCoordinates = {
        lat: newInventory.locality.coordinates.latitude,
        lng: newInventory.locality.coordinates.longitude,
        altitude: newInventory.locality.coordinates.altitude,
      };
      set(storedCustomizedCoordinatesAtom, RESET);
      await set(inventoryCoordinatesWithAltitudeSetAtom, localityCoordinates);
    }
  }
});

// Returns true if and only if the current coordinates are defined, a locality is defined,
// and the current coordinates are different from the locality ones
const areCoordinatesDifferentFromLocalityAtom = atom((get) => {
  const currentLocality = get(inventoryLocalityAtom);
  const currentCoordinates = get(inventoryCoordinatesAtom);

  return (
    currentLocality != null &&
    currentCoordinates != null &&
    (currentLocality.coordinates.latitude !== currentCoordinates.lat ||
      currentLocality.coordinates.longitude !== currentCoordinates.lng)
  );
});

// Returns true if and only if the current coordinates are defined, a locality is defined,
// and the current coordinates are different from the locality ones, including the altitude
export const areCoordinatesCustomizedFromLocalityAtom = atom((get) => {
  const areCoordinatesDifferentFromLocality = get(areCoordinatesDifferentFromLocalityAtom);
  const currentLocality = get(inventoryLocalityAtom);
  const currentAltitude = get(inventoryAltitudeAtom);

  return (
    currentLocality != null &&
    currentAltitude != null &&
    (areCoordinatesDifferentFromLocality || currentLocality.coordinates.altitude !== currentAltitude)
  );
});

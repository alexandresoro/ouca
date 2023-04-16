import { createContext } from "react";
import { type LngLat } from "react-map-gl";

export type Coordinates = Pick<LngLat, "lat" | "lng">;

export const EntryCustomCoordinatesContext = createContext<{
  customCoordinates: Coordinates;
  updateCustomCoordinates: (customCoordinates: Coordinates) => void;
}>({
  customCoordinates: { lat: 0, lng: 0 },
  updateCustomCoordinates: () => {
    /**/
  },
});

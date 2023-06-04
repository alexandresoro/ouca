import { type LngLat } from "react-map-gl";

export type Coordinates = Pick<LngLat, "lat" | "lng">;
export type CoordinatesWithAltitude = Coordinates & { altitude: number };

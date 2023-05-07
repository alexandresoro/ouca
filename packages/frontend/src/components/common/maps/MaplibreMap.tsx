import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { type FunctionComponent } from "react";
import { Map as ReactMapGl } from "react-map-gl";

// This is just a wrapper aroung Maplibre so that we make sure that its CSS is imported too
const MaplibreMap: FunctionComponent<typeof ReactMapGl["defaultProps"]> = ({ ...props }) => {
  return <ReactMapGl mapLib={maplibregl} {...props}></ReactMapGl>;
};

export default MaplibreMap;

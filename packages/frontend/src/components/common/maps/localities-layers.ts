import { type LayerProps } from "react-map-gl/maplibre";

export const clusterLayer: LayerProps = {
  id: "clusters-localities",
  type: "circle",
  source: "localities",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "interpolate",
      ["cubic-bezier", 0.15, 0.85, 0.85, 0.6],
      ["get", "point_count"],
      1,
      "#3FB1CE",
      25000,
      "#24BD5A",
    ],
    "circle-radius": ["interpolate", ["cubic-bezier", 0, 0.85, 0.9, 0.6], ["get", "point_count"], 2, 10, 25000, 75],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#fff",
  },
};

export const clusterCountLayer: LayerProps = {
  id: "cluster-locality-count",
  type: "symbol",
  source: "localities",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["Open Sans Regular"],
    "text-size": 13,
  },
};

export const singleLocalityLayer: LayerProps = {
  id: "single-locality-point",
  type: "circle",
  source: "localities",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 8,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

export const selectionLayer: LayerProps = {
  id: "selection-layer",
  beforeId: "clusters-localities",
  type: "line",
  source: "selected-localities",
  paint: {
    "line-color": "#5C7F67",
    "line-width": 3,
    "line-opacity": 0.85,
  },
};

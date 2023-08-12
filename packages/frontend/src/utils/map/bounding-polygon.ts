import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import convex from "@turf/convex";
// eslint-disable-next-line import/no-unresolved
import { type Feature, type FeatureCollection, type Point, type Polygon } from "geojson";

export const boundingPolygon = (
  pointsFeatureCollection: FeatureCollection<Point>,
  concavity: number
): Feature<Polygon> | null => {
  if (!pointsFeatureCollection.features.length) {
    return null;
  }

  // As it's not possible to construct a bounding polygon with less than 3 points,
  // compute a rectangle bounding box instead
  if (pointsFeatureCollection.features.length < 3) {
    return bboxPolygon(bbox(pointsFeatureCollection));
  }

  return convex(pointsFeatureCollection, {
    concavity,
  });
};

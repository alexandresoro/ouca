import * as _ from "lodash";
import { CoordinatesSystemType } from "ouca-common/coordinates-system/coordinates-system.object";
import { Coordinates } from "ouca-common/coordinates.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { Lieudit } from "ouca-common/lieudit.object";

export const getOriginCoordinates = (
  object: Lieudit | Inventaire
): Coordinates => {
  return object.coordinates[
    _.first(_.keys(object.coordinates) as CoordinatesSystemType[])
  ];
};

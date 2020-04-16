import * as _ from "lodash";
import { Commune } from "../commune.model";

export const findCommuneById = (communes: Commune[], id: number): Commune => {
  return _.find(communes, (commune) => {
    return id === commune.id;
  });
};

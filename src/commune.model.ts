import { CommuneCommon } from "./commune-common.model";

export interface Commune extends CommuneCommon {
  departementId: number;
}

import { CommuneCommon } from "./commune-common.model";

export type Commune = CommuneCommon & {
  departementId: number;
}

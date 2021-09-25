import { ComportementWithCounts } from "../graphql";
import { Age } from "../types/age.object";
import { Classe } from "../types/classe.object";
import { Espece } from "../types/espece.model";
import { EstimationDistance } from "../types/estimation-distance.object";
import { EstimationNombre } from "../types/estimation-nombre.object";
import { Milieu } from "../types/milieu.object";
import { Sexe } from "../types/sexe.object";

export interface WebsocketUpdateContent {
  classes?: Classe[];

  especes?: Espece[];

  sexes?: Sexe[];

  ages?: Age[];

  estimationsDistance?: EstimationDistance[];

  estimationsNombre?: EstimationNombre[];

  comportements?: ComportementWithCounts[];

  milieux?: Milieu[];
}

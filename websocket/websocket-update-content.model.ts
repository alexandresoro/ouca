import { Age } from "../types/age.object";
import { AppConfiguration } from "../types/app-configuration.object";
import { Classe } from "../types/classe.object";
import { Commune } from "../types/commune.model";
import { Comportement } from "../types/comportement.object";
import { Departement } from "../types/departement.object";
import { Espece } from "../types/espece.model";
import { EstimationDistance } from "../types/estimation-distance.object";
import { EstimationNombre } from "../types/estimation-nombre.object";
import { Lieudit } from "../types/lieudit.model";
import { Meteo } from "../types/meteo.object";
import { Milieu } from "../types/milieu.object";
import { Observateur } from "../types/observateur.object";
import { Sexe } from "../types/sexe.object";
import { AppVersion } from "./websocket-appversion.type";

export interface WebsocketUpdateContent {
  configuration?: AppConfiguration;

  observateurs?: Observateur[];

  lieuxdits?: Lieudit[];

  communes?: Commune[];

  departements?: Departement[];

  classes?: Classe[];

  especes?: Espece[];

  sexes?: Sexe[];

  ages?: Age[];

  estimationsDistance?: EstimationDistance[];

  estimationsNombre?: EstimationNombre[];

  comportements?: Comportement[];

  milieux?: Milieu[];

  meteos?: Meteo[];

  version?: AppVersion;
}

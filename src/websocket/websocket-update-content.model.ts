import { AppConfiguration } from "../app-configuration.object";
import { Observateur } from "../observateur.object";
import { Lieudit } from "../lieudit.model";
import { Commune } from "../commune.model";
import { Departement } from "../departement.object";
import { Classe } from "../classe.object";
import { Espece } from "../espece.model";
import { Sexe } from "../sexe.object";
import { Age } from "../age.object";
import { EstimationDistance } from "../estimation-distance.object";
import { EstimationNombre } from "../estimation-nombre.object";
import { Comportement } from "../comportement.object";
import { Milieu } from "../milieu.object";
import { Meteo } from "../meteo.object";

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
}

import { Age } from "./age.object";
import { Classe } from "./classe.object";
import { Commune } from "./commune.object";
import { Comportement } from "./comportement.object";
import { Departement } from "./departement.object";
import { Donnee } from "./donnee.object";
import { Espece } from "./espece.object";
import { EstimationDistance } from "./estimation-distance.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Lieudit } from "./lieudit.object";
import { Meteo } from "./meteo.object";
import { Milieu } from "./milieu.object";
import { Observateur } from "./observateur.object";
import { Sexe } from "./sexe.object";
import { ObjectId } from "bson";
import { CoordinatesSystem } from "./coordinates-system/coordinates-system.object";

export interface CreationPage {
  defaultDepartementId: number;
  defaultObservateurId: number;
  defaultEstimationNombreId: number;
  defaultNombre: number;
  defaultSexeId: number;
  defaultAgeId: number;

  areAssociesDisplayed: boolean;
  isMeteoDisplayed: boolean;
  isDistanceDisplayed: boolean;
  isRegroupementDisplayed: boolean;

  coordinatesSystem: CoordinatesSystem;

  lastDonnee?: Donnee;
  lastDonneeId?: ObjectId;
  numberOfDonnees: number;

  nextRegroupement: number;

  observateurs: Observateur[];
  departements: Departement[];
  communes: Commune[];
  lieudits: Lieudit[];
  meteos: Meteo[];
  classes: Classe[];
  especes: Espece[];
  ages: Age[];
  sexes: Sexe[];
  estimationsNombre: EstimationNombre[];
  estimationsDistance: EstimationDistance[];
  comportements: Comportement[];
  milieux: Milieu[];
}

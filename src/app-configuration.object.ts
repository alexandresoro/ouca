import { Age } from "./age.object";
import { CoordinatesSystemType } from "./coordinates-system/coordinates-system.object";
import { Departement } from "./departement.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Observateur } from "./observateur.object";
import { Sexe } from "./sexe.object";

export interface AppConfiguration {
  id: number;

  defaultObservateur: Observateur;

  defaultDepartement: Departement;

  coordinatesSystem: CoordinatesSystemType;

  defaultEstimationNombre: EstimationNombre;

  defaultNombre: number;

  defaultSexe: Sexe;

  defaultAge: Age;

  areAssociesDisplayed: boolean;

  isMeteoDisplayed: boolean;

  isDistanceDisplayed: boolean;

  isRegroupementDisplayed: boolean;
}

import { Age } from "./age.object";
import { Departement } from "./departement.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Observateur } from "./observateur.object";
import { Sexe } from "./sexe.object";
import { CoordinatesSystem } from "./coordinates-system/coordinates-system.object";

export interface AppConfiguration {
  defaultObservateur: Observateur;

  defaultDepartement: Departement;

  coordinatesSystem: CoordinatesSystem;

  defaultEstimationNombre: EstimationNombre;

  defaultNombre: number;

  defaultSexe: Sexe;

  defaultAge: Age;

  areAssociesDisplayed: boolean;

  isMeteoDisplayed: boolean;

  isDistanceDisplayed: boolean;

  isRegroupementDisplayed: boolean;
}

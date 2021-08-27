import { CoordinatesSystemType } from "../coordinates-system/coordinates-system.object";
import { Age } from "./age.object";
import { Departement } from "./departement.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Observateur } from "./observateur.object";
import { Sexe } from "./sexe.object";

export type AppConfiguration = {
  id: number;

  defaultObservateur: Omit<Observateur, 'nbDonnees'>;

  defaultDepartement: Omit<Departement, 'nbDonnees' | 'nbCommunes' | 'nbLieuxdits'>;

  coordinatesSystem: CoordinatesSystemType;

  defaultEstimationNombre: Omit<EstimationNombre, 'nbDonnees'>;

  defaultNombre: number;

  defaultSexe: Omit<Sexe, 'nbDonnees'>;

  defaultAge: Omit<Age, 'nbDonnees'>;

  areAssociesDisplayed: boolean;

  isMeteoDisplayed: boolean;

  isDistanceDisplayed: boolean;

  isRegroupementDisplayed: boolean;
}

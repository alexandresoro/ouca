import { Age } from "./age.object";
import { AppConfiguration } from "./app-configuration.object";
import { Departement } from "./departement.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Observateur } from "./observateur.object";
import { Sexe } from "./sexe.object";
import { CoordinatesSystem } from "./coordinates-system.object";

export interface ConfigurationPage {
  appConfiguration: AppConfiguration;

  observateurs: Observateur[];

  departements: Departement[];

  coordinatesSystems: CoordinatesSystem[];

  estimationsNombre: EstimationNombre[];

  sexes: Sexe[];

  ages: Age[];
}

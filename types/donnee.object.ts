import { Age, Comportement, Espece, EstimationDistance, EstimationNombre, Milieu, Sexe } from "../graphql";
import { Inventaire } from "./inventaire.object";


export type Donnee = {
  id: number;

  inventaire?: Inventaire;

  inventaireId: number;

  espece?: Espece;

  especeId: number;

  estimationNombre?: EstimationNombre;

  estimationNombreId: number;

  nombre: number;

  age?: Age;

  ageId?: number;

  sexe?: Sexe;

  sexeId: number;

  estimationDistance?: EstimationDistance;

  estimationDistanceId: number;

  distance: number;

  regroupement: number;

  comportements?: Comportement[];

  comportementsIds: number[];

  milieux?: Milieu[];

  milieuxIds: number[];

  commentaire: string;
}

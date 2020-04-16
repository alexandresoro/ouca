import { Age } from "./age.object";
import { Comportement } from "./comportement.object";
import { EntiteSimple } from "./entite-simple.object";
import { Espece } from "./espece.model";
import { EstimationDistance } from "./estimation-distance.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Inventaire } from "./inventaire.object";
import { Milieu } from "./milieu.object";
import { Sexe } from "./sexe.object";

export interface Donnee extends EntiteSimple {
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

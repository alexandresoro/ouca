import { Age } from "./age.object";
import { Comportement } from "./comportement.object";
import { EntiteSimple } from "./entite-simple.object";
import { Espece } from "./espece.object";
import { EstimationDistance } from "./estimation-distance.object";
import { EstimationNombre } from "./estimation-nombre.object";
import { Inventaire } from "./inventaire.object";
import { Milieu } from "./milieu.object";
import { Sexe } from "./sexe.object";

export interface Donnee extends EntiteSimple {
  id: number;

  inventaire?: Inventaire;

  inventaireId: number;

  espece: Espece;

  estimationNombre: EstimationNombre;

  nombre: number;

  age: Age;

  sexe: Sexe;

  estimationDistance: EstimationDistance;

  distance: number;

  regroupement: number;

  comportements: Comportement[];

  milieux: Milieu[];

  commentaire: string;
}

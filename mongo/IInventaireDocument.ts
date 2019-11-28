import { IDocumentWithObjectId } from "./IDocumentWithObjectId";
import { ObjectId } from "bson";

export interface IInventaireDocument extends IDocumentWithObjectId {
  associes?: ObjectId[];

  date: Date;

  duree?: string;

  heure?: string;

  lieuditId: ObjectId;

  altitude?: number;

  longitude?: number;

  latitude?: number;

  meteos?: ObjectId[];

  observateurId: ObjectId;

  temperature?: number;
}

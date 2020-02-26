import { IDocumentWithObjectId } from "./IDocumentWithObjectId";
import { ObjectId } from "bson";

export interface IDonneeDocument extends IDocumentWithObjectId {
  id: number;

  inventaireId: ObjectId;

  especeId: ObjectId;

  estimationNombreId: ObjectId;

  nombre?: number;

  ageId: ObjectId;

  sexeId: ObjectId;

  estimationDistanceId?: ObjectId;

  distance?: number;

  regroupement?: number;

  comportements?: ObjectId[];

  milieux?: ObjectId[];

  commentaire?: string;

  date_creation: Date;
}

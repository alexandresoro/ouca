import { IDocumentWithObjectId } from "./IDocumentWithObjectId";
import { ObjectId } from "bson";

export interface ILieuDitDocument extends IDocumentWithObjectId {
  communeId: ObjectId;

  nom: string;

  altitude: number;

  latitude: number;

  longitude: number;
}

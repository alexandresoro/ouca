import { IDocumentWithObjectId } from "./IDocumentWithObjectId";
import { ObjectId } from "bson";

export interface ICommuneDocument extends IDocumentWithObjectId {
  departementId: ObjectId;

  code: string;

  nom: string;
}

import { IDocumentWithObjectId } from "./IDocumentWithObjectId";
import { ObjectId } from "bson";

export interface IEspeceDocument extends IDocumentWithObjectId {
  classeId: ObjectId;

  code: string;

  nomFrancais: string;

  nomLatin: string;
}

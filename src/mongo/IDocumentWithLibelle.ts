import { IDocumentWithObjectId } from "./IDocumentWithObjectId";

export interface IDocumentWithLibelle extends IDocumentWithObjectId {
  libelle: string;
}

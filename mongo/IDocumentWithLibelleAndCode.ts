import { IDocumentWithLibelle } from "./IDocumentWithLibelle";

export interface IDocumentWithLibelleAndCode extends IDocumentWithLibelle {
  code: string;
}

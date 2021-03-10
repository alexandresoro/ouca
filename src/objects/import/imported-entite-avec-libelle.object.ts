import { EntiteAvecLibelle } from "../../model/types/entite-avec-libelle.object";

const LIBELLE_INDEX = 0;

const LIBELLE_MAX_LENGTH = 100;

export class ImportedEntiteAvecLibelle {

  libelle: string;

  constructor(entiteAvecLibelleTab: string[]) {
    this.libelle = entiteAvecLibelleTab[LIBELLE_INDEX].trim();
  }

  buildEntiteAvecLibelle = (): EntiteAvecLibelle => {
    return {
      id: null,
      libelle: this.libelle
    };
  };

  checkValidity = (): string => {
    const libelleError = this.checkLibelleValidity();
    if (libelleError) {
      return libelleError;
    }

    return null;
  }

  protected checkLibelleValidity = (): string => {
    if (!this.libelle) {
      return "Le libellé ne peut pas être vide";
    }

    if (this.libelle.length > LIBELLE_MAX_LENGTH) {
      return (
        `La longueur maximale du libellé est de ${LIBELLE_MAX_LENGTH} caractères`
      );
    }

    return null;
  };

}
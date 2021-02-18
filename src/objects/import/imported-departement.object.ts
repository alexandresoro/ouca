import { Departement } from "@ou-ca/ouca-model";

const CODE_INDEX = 0;
const CODE_MAX_LENGTH = 100;

export class ImportedDepartement {

  code: string;

  constructor(departementTab: string[]) {
    this.code = departementTab[CODE_INDEX].trim();
  }

  buildDepartement = (): Departement => {
    return {
      id: null,
      code: this.code
    };
  };

  checkValidity = (): string => {
    const codeError = this.checkCodeValidity();
    if (codeError) {
      return codeError;
    }
    return null;
  }

  private checkCodeValidity = (): string => {
    if (!this.code) {
      return "Le département ne peut pas être vide";
    }

    if (this.code.length > CODE_MAX_LENGTH) {
      return `La longueur maximale du département est de ${CODE_MAX_LENGTH} caractères`;
    }

    return null;
  };
}
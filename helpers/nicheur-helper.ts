import { NicheurCode, NICHEUR_VALUES } from "../types/nicheur.model";

export const getNicheurStatusToDisplay = (comportements: { nicheur?: NicheurCode | null }[], noNicheurFoundText: string): string => {

  // Compute nicheur status for the Donnée (i.e. highest nicheur status of the comportements)
  // First we keep only the comportements having a nicheur status
  const nicheurStatuses = comportements?.filter(
    (comportement) => {
      return !!comportement.nicheur;
    }
  ).map(
    (comportement) => {
      return comportement.nicheur as NicheurCode;
    }
  ) ?? [];

  // Then we keep the highest nicheur status
  const nicheurStatusCode = nicheurStatuses?.length && nicheurStatuses.reduce(
    (nicheurStatusOne, nicheurStatusTwo) => {
      return NICHEUR_VALUES[nicheurStatusOne].weight >= NICHEUR_VALUES[nicheurStatusTwo].weight ? nicheurStatusOne : nicheurStatusTwo
    }
  );

  return nicheurStatusCode ? NICHEUR_VALUES[nicheurStatusCode].name : noNicheurFoundText;
}
import { HttpParameters } from "../http/httpParameters";
import { countSpecimensByAgeForEspeceId, countSpecimensBySexeForEspeceId } from "../services/entities/donnee-service";

export const getEspeceDetailsByAgeRequest = (
  httpParameters: HttpParameters
): Promise<{ name: string; value: number }[]> => {
  const especeId: number = +httpParameters.query.id;
  return countSpecimensByAgeForEspeceId(especeId);
};

export const getEspeceDetailsBySexeRequest = (
  httpParameters: HttpParameters
): Promise<{ name: string; value: number }[]> => {
  const especeId: number = +httpParameters.query.id;
  return countSpecimensBySexeForEspeceId(especeId);
};

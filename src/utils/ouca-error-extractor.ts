import { CombinedError } from "urql";

export const getOucaError = (error: CombinedError): string | undefined => {
  return (error.graphQLErrors?.[0]?.extensions as { code?: string } | undefined)?.code;
};

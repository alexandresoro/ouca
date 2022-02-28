import { ApolloError } from "@apollo/client";

export const getOucaError = (e: ApolloError): string | undefined => {
  return (e.graphQLErrors?.[0]?.extensions?.exception as { name?: string })?.name;
};

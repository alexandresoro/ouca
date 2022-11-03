import { useContext } from "react";
import { GraphQLRequestContext } from "../contexts/GraphQLRequestContext";

export default function useGraphQLRequestContext() {
  const graphQLRequestContext = useContext(GraphQLRequestContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return graphQLRequestContext!;
}

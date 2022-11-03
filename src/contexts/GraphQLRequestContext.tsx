import { GraphQLClient } from "graphql-request";
import { createContext } from "react";

export const GraphQLRequestContext = createContext<GraphQLClient | null>(null);

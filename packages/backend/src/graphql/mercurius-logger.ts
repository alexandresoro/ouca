import {
  type DocumentNode,
  type ExecutionResult,
  type FieldNode,
  type GraphQLSchema,
  type OperationDefinitionNode,
} from "graphql";
import { type MercuriusContext } from "mercurius";

const readOps = (document: DocumentNode, operation: string): string[] => {
  return document.definitions
    .filter((d): d is OperationDefinitionNode => d.kind === "OperationDefinition" && d.operation === operation)
    .flatMap((d) => d.selectionSet.selections)
    .map((selectionSet) => {
      const opName = (selectionSet as FieldNode).name.value;
      return opName;
    });
};

export const logQueries = async (
  schema: GraphQLSchema,
  document: DocumentNode,
  context: MercuriusContext
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
  const queryOps = readOps(document, "query");
  const mutationOps = readOps(document, "mutation");

  context.reply.request.log.debug(
    {
      graphql: {
        queries: queryOps.length > 0 ? queryOps : undefined,
        mutations: mutationOps.length > 0 ? mutationOps : undefined,
      },
    },
    "incoming GraphQL request"
  );
};

export const logResults = async (
  execution: ExecutionResult,
  context: MercuriusContext
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
  context.reply.request.log.trace(execution, "outgoing GraphQL execution result");
};

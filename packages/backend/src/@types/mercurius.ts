import { type Resolvers } from "../graphql/generated/graphql-types.js";
import { type buildGraphQLContext } from "../graphql/graphql-context.js";

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

declare module "mercurius" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface MercuriusContext extends PromiseType<ReturnType<ReturnType<typeof buildGraphQLContext>>> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/consistent-type-imports
  interface IResolvers extends Resolvers<import("mercurius").MercuriusContext> {}
}

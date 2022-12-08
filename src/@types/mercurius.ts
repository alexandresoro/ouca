import { type Resolvers } from "../graphql/generated/graphql-types";

declare module "mercurius" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/consistent-type-imports
  interface IResolvers extends Resolvers<import("mercurius").MercuriusContext> {}
}

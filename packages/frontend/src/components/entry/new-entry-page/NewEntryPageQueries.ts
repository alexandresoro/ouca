import { graphql } from "../../../gql";

export const GET_LAST_DONNEE_ID = graphql(`
  query GetLastDonneeId {
    lastDonneeId
  }
`);

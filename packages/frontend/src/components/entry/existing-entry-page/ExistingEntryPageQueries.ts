import { graphql } from "../../../gql";

export const DONNEE_QUERY = graphql(`
  query GetDonneeNavigation($id: Int!) {
    donnee(id: $id) {
      id
      donnee{
        inventaire {
          id
        }
      }
    }
  }
`);

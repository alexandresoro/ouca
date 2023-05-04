import { graphql } from "../../../gql";

export const COMPORTEMENT_QUERY = graphql(`
  query GetComportement($id: Int!) {
    comportement(id: $id) {
      id
      code
      libelle
      nicheur
    }
  }
`);

export const PAGINATED_COMPORTEMENTS_QUERY = graphql(`
  query ListComportements($searchParams: SearchParams, $orderBy: ComportementsOrderBy, $sortOrder: SortOrder) {
    comportements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        libelle
        nicheur
        editable
        nbDonnees
      }
    }
  }
`);

export const UPSERT_COMPORTEMENT = graphql(`
  mutation UpsertComportement($id: Int, $data: InputComportement!) {
    upsertComportement(id: $id, data: $data) {
      id
      code
      libelle
      nicheur
    }
  }
`);

export const DELETE_COMPORTEMENT = graphql(`
  mutation DeleteComportement($id: Int!) {
    deleteComportement(id: $id)
  }
`);

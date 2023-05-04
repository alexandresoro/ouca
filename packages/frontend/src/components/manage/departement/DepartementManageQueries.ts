import { graphql } from "../../../gql";

export const DEPARTEMENT_QUERY = graphql(`
  query GetDepartement($id: Int!) {
    departement(id: $id) {
      id
      code
    }
  }
`);

export const PAGINATED_DEPARTEMENTS_QUERY = graphql(`
  query ListDepartements($searchParams: SearchParams, $orderBy: DepartementsOrderBy, $sortOrder: SortOrder) {
    departements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        editable
        nbCommunes
        nbLieuxDits
        nbDonnees
      }
    }
  }
`);

export const UPSERT_DEPARTEMENT = graphql(`
  mutation UpsertDepartement($id: Int, $data: InputDepartement!) {
    upsertDepartement(id: $id, data: $data) {
      id
      code
    }
  }
`);

export const DELETE_DEPARTEMENT = graphql(`
  mutation DeleteDepartement($id: Int!) {
    deleteDepartement(id: $id)
  }
`);

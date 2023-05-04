import { graphql } from "../../../gql";

export const MILIEU_QUERY = graphql(`
  query GetMilieu($id: Int!) {
    milieu(id: $id) {
      id
      code
      libelle
    }
  }
`);

export const PAGINATED_MILIEUX_QUERY = graphql(`
  query ListMilieux($searchParams: SearchParams, $orderBy: MilieuxOrderBy, $sortOrder: SortOrder) {
    milieux(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        libelle
        editable
        nbDonnees
      }
    }
  }
`);

export const UPSERT_MILIEU = graphql(`
  mutation UpsertMilieu($id: Int, $data: InputMilieu!) {
    upsertMilieu(id: $id, data: $data) {
      id
      code
      libelle
    }
  }
`);

export const DELETE_MILIEU = graphql(`
  mutation DeleteMilieu($id: Int!) {
    deleteMilieu(id: $id)
  }
`);

import { graphql } from "../../../gql";

export const AGE_QUERY = graphql(`
  query GetAge($id: Int!) {
    age(id: $id) {
      id
      libelle
    }
  }
`);

export const PAGINATED_AGES_QUERY = graphql(`
  query ListAges($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    ages(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbDonnees
      }
    }
  }
`);

export const UPSERT_AGE = graphql(`
  mutation UpsertAge($id: Int, $data: InputAge!) {
    upsertAge(id: $id, data: $data) {
      id
      libelle
    }
  }
`);

export const DELETE_AGE = graphql(`
  mutation DeleteAge($id: Int!) {
    deleteAge(id: $id)
  }
`);

export const EXPORT_AGES_QUERY = graphql(`
  query ExportAges {
    exportAges
  }
`);

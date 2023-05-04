import { graphql } from "../../../gql";

export const SEXE_QUERY = graphql(`
  query GetSexe($id: Int!) {
    sexe(id: $id) {
      id
      libelle
    }
  }
`);

export const PAGINATED_SEXES_QUERY = graphql(`
  query ListSexes($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    sexes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
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

export const UPSERT_SEXE = graphql(`
  mutation UpsertSexe($id: Int, $data: InputSexe!) {
    upsertSexe(id: $id, data: $data) {
      id
      libelle
    }
  }
`);

export const DELETE_SEXE = graphql(`
  mutation DeleteSexe($id: Int!) {
    deleteSexe(id: $id)
  }
`);

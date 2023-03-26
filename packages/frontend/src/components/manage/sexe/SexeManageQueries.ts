import { graphql } from "../../../gql";

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

export const DELETE_SEXE = graphql(`
  mutation DeleteSexe($id: Int!) {
    deleteSexe(id: $id)
  }
`);

export const EXPORT_SEXES_QUERY = graphql(`
  query ExportSexes {
    exportSexes
  }
`);

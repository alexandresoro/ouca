import { graphql } from "../../../gql";

export const PAGINATED_ESPECES_QUERY = graphql(`
  query ListEspeces($searchParams: SearchParams, $orderBy: EspecesOrderBy, $sortOrder: SortOrder) {
    especes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        classe {
          id
          libelle
        }
        code
        editable
        nomFrancais
        nomLatin
        nbDonnees
      }
    }
  }
`);

export const DELETE_ESPECE = graphql(`
  mutation DeleteEspece($id: Int!) {
    deleteEspece(id: $id)
  }
`);

export const EXPORT_ESPECES_QUERY = graphql(`
  query ExportEspeces {
    exportEspeces
  }
`);

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

import { graphql } from "../../../gql";

export const PAGINATED_CLASSES_QUERY = graphql(`
  query ListClasses($searchParams: SearchParams, $orderBy: ClassesOrderBy, $sortOrder: SortOrder) {
    classes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbEspeces
        nbDonnees
      }
    }
  }
`);

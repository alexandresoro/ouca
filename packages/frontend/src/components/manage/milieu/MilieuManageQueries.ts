import { graphql } from "../../../gql";

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

import { graphql } from "../../../gql";

export const AUTOCOMPLETE_LOCALITIES_QUERY = graphql(`
  query ListLocalitiesAutocomplete($searchParams: SearchParams, $townId: Int, $orderBy: LieuxDitsOrderBy, $sortOrder: SortOrder) {
    lieuxDits(searchParams: $searchParams, townId: $townId, orderBy: $orderBy, sortOrder: $sortOrder) {
      data {
        id
        nom
        latitude
        longitude
        altitude
        coordinatesSystem
        commune {
          id
        }
      }
    }
  }
`);

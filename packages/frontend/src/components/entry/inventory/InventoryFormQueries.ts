import { graphql } from "../../../gql";

export const AUTOCOMPLETE_DEPARTMENTS_QUERY = graphql(`
  query ListDepartmentsAutocomplete($searchParams: SearchParams, $orderBy: DepartementsOrderBy, $sortOrder: SortOrder) {
    departements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      data {
        id
        code
      }
    }
  }
`);

export const AUTOCOMPLETE_TOWNS_QUERY = graphql(`
  query ListTownsAutocomplete($searchParams: SearchParams, $departmentId: Int, $orderBy: CommunesOrderBy, $sortOrder: SortOrder) {
    communes(searchParams: $searchParams, departmentId: $departmentId, orderBy: $orderBy, sortOrder: $sortOrder) {
      data {
        id
        code
        nom
        departement {
          id
        }
      }
    }
  }
`);

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

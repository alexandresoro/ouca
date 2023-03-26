import { graphql } from "../../../gql";

export const PAGINATED_METEOS_QUERY = graphql(`
  query ListMeteos($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    meteos(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
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

export const DELETE_METEO = graphql(`
  mutation DeleteMeteo($id: Int!) {
    deleteMeteo(id: $id)
  }
`);

export const EXPORT_METEOS_QUERY = graphql(`
  query ExportMeteos {
    exportMeteos
  }
`);

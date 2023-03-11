import { useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import { graphql } from "../../gql";
import { type EspecesOrderBy } from "../../gql/graphql";
import usePaginatedTableParams from "../../hooks/usePaginatedTableParams";
import Table from "../common/styled/table/Table";
import TableSortLabel from "../common/styled/table/TableSortLabel";

const PAGINATED_SEARCH_ESPECES_QUERY = graphql(`
  query PaginatedSearchEspeces(
    $searchParams: SearchParams
    $searchCriteria: SearchDonneeCriteria
    $orderBy: EspecesOrderBy
    $sortOrder: SortOrder
  ) {
    especes(searchParams: $searchParams, searchCriteria: $searchCriteria, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        nomFrancais
        nomLatin
        nbDonnees
        classe {
          id
          libelle
        }
      }
    }
  }
`);

const COLUMNS = [
  {
    key: "nomClasse",
    locKey: "speciesClass",
  },
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nomFrancais",
    locKey: "frenchName",
  },
  {
    key: "nomLatin",
    locKey: "scientificName",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const DonneesByEspeceTable: FunctionComponent = () => {
  const { t } = useTranslation();

  const { page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EspecesOrderBy>();

  useEffect(() => {
    setOrderBy("nbDonnees");
    setSortOrder("desc");
  }, [setOrderBy, setSortOrder]);

  const [{ data }] = useQuery({
    query: PAGINATED_SEARCH_ESPECES_QUERY,
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
      },
      orderBy,
      sortOrder,
      searchCriteria: null,
    },
    requestPolicy: "cache-and-network",
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EspecesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <Table
      tableHead={
        <>
          {COLUMNS.map((column) => (
            <th key={column.key}>
              <TableSortLabel
                active={orderBy === column.key}
                direction={orderBy === column.key ? sortOrder : "asc"}
                onClick={() => handleRequestSort(column.key)}
              >
                {t(column.locKey)}
              </TableSortLabel>
            </th>
          ))}
        </>
      }
      tableRows={data?.especes?.data?.map((espece) => {
        return (
          <tr className="hover" key={espece.id}>
            <td>{espece.classe.libelle}</td>
            <td>{espece.code}</td>
            <td>{espece.nomFrancais}</td>
            <td>{espece.nomLatin}</td>
            <td>{espece.nbDonnees ?? "0"}</td>
          </tr>
        );
      })}
      page={page}
      elementsPerPage={rowsPerPage}
      count={data?.especes?.count ?? 0}
      onPageChange={handleChangePage}
    ></Table>
  );
};

export default DonneesByEspeceTable;

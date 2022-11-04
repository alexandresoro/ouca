import { useQuery } from "@apollo/client";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { graphql } from "../../gql";
import { EspecesOrderBy } from "../../gql/graphql";
import usePaginatedTableParams from "../../hooks/usePaginatedTableParams";

const PAGINATED_SEARCH_ESPECES_QUERY = graphql(`
  query PaginatedSearchEspeces(
    $searchParams: SearchDonneeParams
    $searchCriteria: SearchDonneeCriteria
    $orderBy: EspecesOrderBy
    $sortOrder: SortOrder
  ) {
    searchEspeces(
      searchParams: $searchParams
      searchCriteria: $searchCriteria
      orderBy: $orderBy
      sortOrder: $sortOrder
    ) {
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

  const { page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EspecesOrderBy>();

  // TODO order by nbDonnees desc
  //setOrderBy("nbDonnees");
  //setSortOrder("desc");

  const { data } = useQuery(PAGINATED_SEARCH_ESPECES_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
      },
      orderBy,
      sortOrder,
      searchCriteria: null,
    },
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (sortingColumn: EspecesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableCell key={column.key}>
                  <TableSortLabel
                    active={orderBy === column.key}
                    direction={orderBy === column.key ? sortOrder : "asc"}
                    onClick={() => handleRequestSort(column.key)}
                  >
                    {t(column.locKey)}
                    {orderBy === column.key ? (
                      <Box component="span" sx={visuallyHidden}>
                        {sortOrder === "desc" ? t("aria-descendingSort") : t("aria-ascendingSort")}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.searchEspeces?.data?.map((espece) => {
              return (
                <TableRow hover key={espece?.id}>
                  <TableCell>{espece?.classe?.libelle}</TableCell>
                  <TableCell>{espece?.code}</TableCell>
                  <TableCell>{espece?.nomFrancais}</TableCell>
                  <TableCell>{espece?.nomLatin}</TableCell>
                  <TableCell>{espece?.nbDonnees ? espece?.nbDonnees : "0"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                count={data?.searchEspeces?.count ?? 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default DonneesByEspeceTable;

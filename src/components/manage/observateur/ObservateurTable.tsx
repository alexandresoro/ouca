import { gql, useQuery } from "@apollo/client";
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
  TableSortLabel
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  EntitesAvecLibelleOrderBy,
  ObservateursPaginatedResult,
  QueryPaginatedObservateursArgs,
  SortOrder
} from "../../../model/graphql";
import FilterTextField from "../common/FilterTextField";

type PaginatedObservateursQueryResult = {
  paginatedObservateurs: ObservateursPaginatedResult;
};

const PAGINATED_OBSERVATEURS_QUERY = gql`
  query PaginatedObservateurs($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    paginatedObservateurs(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      result {
        id
        libelle
        nbDonnees
      }
    }
  }
`;

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label"
  },
  {
    key: "nbDonnees",
    locKey: "speciesNumber"
  }
] as const;

export default function ObservateurTable(): ReactElement {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState<EntitesAvecLibelleOrderBy | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);

  const { data } = useQuery<PaginatedObservateursQueryResult, QueryPaginatedObservateursArgs>(
    PAGINATED_OBSERVATEURS_QUERY,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        searchParams: {
          pageNumber: page,
          pageSize: rowsPerPage,
          q: query
        },
        orderBy,
        sortOrder
      }
    }
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (sortingColumn: EntitesAvecLibelleOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <FilterTextField
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
        }}
      />
      <TableContainer
        component={Paper}
        sx={{
          mt: 2
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
                        {sortOrder === SortOrder.Desc ? t("aria-descendingSort") : t("aria-ascendingSort")}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.paginatedObservateurs?.result?.map((observateur) => {
              return (
                <TableRow hover key={observateur?.id}>
                  <TableCell>{observateur?.libelle}</TableCell>
                  <TableCell>{observateur?.nbDonnees}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[20, 50, 100]}
                count={data?.paginatedObservateurs?.count ?? 0}
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
}

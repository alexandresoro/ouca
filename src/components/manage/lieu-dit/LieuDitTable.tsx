import { gql, useMutation, useQuery } from "@apollo/client";
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
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  LieuDit,
  LieuxDitsOrderBy,
  LieuxDitsPaginatedResult,
  MutationDeleteLieuDitArgs,
  QueryLieuxDitsArgs
} from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedLieuxDitsQueryResult = {
  paginatedLieuxdits: LieuxDitsPaginatedResult;
};

type DeleteLieuDitMutationResult = {
  deleteLieuDit: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedLieuxDits(
    $searchParams: SearchParams
    $orderBy: LieuxDitsOrderBy
    $sortOrder: SortOrder
    $includeCounts: Boolean!
  ) {
    paginatedLieuxdits(
      searchParams: $searchParams
      orderBy: $orderBy
      sortOrder: $sortOrder
      includeCounts: $includeCounts
    ) {
      count
      result {
        id
        commune {
          departement {
            code
          }
          code
          nom
        }
        nom
        altitude
        longitude
        latitude
        nbDonnees
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteLieuDit($id: Int!) {
    deleteLieuDit(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "departement",
    locKey: "department"
  },
  {
    key: "codeCommune",
    locKey: "cityCode"
  },
  {
    key: "nomCommune",
    locKey: "cityName"
  },
  {
    key: "nom",
    locKey: "name"
  },
  {
    key: "latitude",
    locKey: "latitude"
  },
  {
    key: "longitude",
    locKey: "longitude"
  },
  {
    key: "altitude",
    locKey: "altitude"
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations"
  }
] as const;

const LieuDitTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<LieuxDitsOrderBy>();

  const [dialogLieuDit, setDialogLieuDit] = useState<LieuDit | null>(null);

  const { data } = useQuery<PaginatedLieuxDitsQueryResult, QueryLieuxDitsArgs>(PAGINATED_QUERY, {
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
  });

  const [deleteLieuDit] = useMutation<DeleteLieuDitMutationResult, MutationDeleteLieuDitArgs>(DELETE);

  const { setSnackbarContent } = useSnackbar();

  const handleEditLieuDit = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteLieuDit = (lieuDit: LieuDit | null) => {
    if (lieuDit) {
      setDialogLieuDit(lieuDit);
    }
  };

  const handleDeleteLieuDitConfirmation = async (lieuDit: LieuDit | null) => {
    if (lieuDit) {
      setDialogLieuDit(null);
      await deleteLieuDit({
        variables: {
          id: lieuDit.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteLieuDit) {
            setSnackbarContent({
              type: "success",
              message: t("deleteConfirmationMessage")
            });
          }
        })
        .catch(() => {
          setSnackbarContent({
            type: "error",
            message: t("deleteErrorMessage")
          });
        });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (sortingColumn: LieuxDitsOrderBy) => {
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
                        {sortOrder === "desc" ? t("aria-descendingSort") : t("aria-ascendingSort")}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.paginatedLieuxdits?.data?.map((lieuDit) => {
              return (
                <TableRow hover key={lieuDit?.id}>
                  <TableCell>{lieuDit?.commune?.departement?.code}</TableCell>
                  <TableCell>{lieuDit?.commune?.code}</TableCell>
                  <TableCell>{lieuDit?.commune?.nom}</TableCell>
                  <TableCell>{lieuDit?.nom}</TableCell>
                  <TableCell>{lieuDit?.latitude}</TableCell>
                  <TableCell>{lieuDit?.longitude}</TableCell>
                  <TableCell>{lieuDit?.altitude}</TableCell>
                  <TableCell>{lieuDit?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      disabled={!lieuDit.editable}
                      onEditClicked={() => handleEditLieuDit(lieuDit?.id)}
                      onDeleteClicked={() => handleDeleteLieuDit(lieuDit)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                count={data?.paginatedLieuxdits?.count ?? 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <DeletionConfirmationDialog
        open={!!dialogLieuDit}
        messageContent={t("deleteLieuDitDialogMsg", {
          name: dialogLieuDit?.nom,
          city: dialogLieuDit?.commune?.nom,
          department: dialogLieuDit?.commune?.departement?.code
        })}
        impactedItemsMessage={t("deleteLieuDitDialogMsgImpactedData", {
          nbOfObservations: dialogLieuDit?.nbDonnees ?? 0
        })}
        onCancelAction={() => setDialogLieuDit(null)}
        onConfirmAction={() => handleDeleteLieuDitConfirmation(dialogLieuDit)}
      />
    </>
  );
};

export default LieuDitTable;

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
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Milieu,
  MilieuxOrderBy,
  MilieuxPaginatedResult,
  MutationDeleteMilieuArgs,
  QueryMilieuxArgs,
} from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedMilieuxQueryResult = {
  paginatedMilieux: MilieuxPaginatedResult;
};

type DeleteMilieuMutationResult = {
  deleteMilieu: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedMilieux(
    $searchParams: SearchParams
    $orderBy: MilieuxOrderBy
    $sortOrder: SortOrder
    $includeCounts: Boolean!
  ) {
    paginatedMilieux(
      searchParams: $searchParams
      orderBy: $orderBy
      sortOrder: $sortOrder
      includeCounts: $includeCounts
    ) {
      count
      result {
        id
        code
        libelle
        nbDonnees
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteMilieu($id: Int!) {
    deleteMilieu(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const MilieuTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<MilieuxOrderBy>();

  const [dialogMilieu, setDialogMilieu] = useState<Milieu | null>(null);

  const { data } = useQuery<PaginatedMilieuxQueryResult, QueryMilieuxArgs>(PAGINATED_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
        q: query,
      },
      orderBy,
      sortOrder,
    },
  });

  const [deleteMilieu] = useMutation<DeleteMilieuMutationResult, MutationDeleteMilieuArgs>(DELETE);

  const { setSnackbarContent } = useSnackbar();

  const handleEditMilieu = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteMilieu = (milieu: Milieu | null) => {
    if (milieu) {
      setDialogMilieu(milieu);
    }
  };

  const handleDeleteMilieuConfirmation = async (milieu: Milieu | null) => {
    if (milieu) {
      setDialogMilieu(null);
      await deleteMilieu({
        variables: {
          id: milieu.id,
        },
        refetchQueries: [PAGINATED_QUERY],
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteMilieu) {
            setSnackbarContent({
              type: "success",
              message: t("deleteConfirmationMessage"),
            });
          }
        })
        .catch(() => {
          setSnackbarContent({
            type: "error",
            message: t("deleteErrorMessage"),
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

  const handleRequestSort = (sortingColumn: MilieuxOrderBy) => {
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
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.paginatedMilieux?.data?.map((milieu) => {
              return (
                <TableRow hover key={milieu?.id}>
                  <TableCell>{milieu?.code}</TableCell>
                  <TableCell>{milieu?.libelle}</TableCell>
                  <TableCell>{milieu?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      disabled={!milieu.editable}
                      onEditClicked={() => handleEditMilieu(milieu?.id)}
                      onDeleteClicked={() => handleDeleteMilieu(milieu)}
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
                count={data?.paginatedMilieux?.count ?? 0}
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
        open={!!dialogMilieu}
        messageContent={t("deleteEnvironmentDialogMsg", {
          name: dialogMilieu?.libelle,
        })}
        impactedItemsMessage={t("deleteEnvironmentDialogMsgImpactedData")}
        onCancelAction={() => setDialogMilieu(null)}
        onConfirmAction={() => handleDeleteMilieuConfirmation(dialogMilieu)}
      />
    </>
  );
};

export default MilieuTable;

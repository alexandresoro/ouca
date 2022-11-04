import { useMutation, useQuery } from "@apollo/client";
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
import { graphql } from "../../../gql";
import { Departement, DepartementsOrderBy } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query DepartementsTable($searchParams: SearchParams, $orderBy: DepartementsOrderBy, $sortOrder: SortOrder) {
    departements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        editable
        nbCommunes
        nbLieuxDits
        nbDonnees
      }
    }
  }
`);

const DELETE = graphql(`
  mutation DeleteDepartement($id: Int!) {
    deleteDepartement(id: $id)
  }
`);

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nbCommunes",
    locKey: "numberOfCities",
  },
  {
    key: "nbLieuxDits",
    locKey: "numberOfLocalities",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const DepartementTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<DepartementsOrderBy>();

  const [dialogDepartement, setDialogDepartement] = useState<Departement | null>(null);

  const { data } = useQuery(PAGINATED_QUERY, {
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

  const [deleteDepartement] = useMutation(DELETE);

  const { setSnackbarContent } = useSnackbar();

  const handleEditDepartement = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteDepartement = (departement: Departement | null) => {
    if (departement) {
      setDialogDepartement(departement);
    }
  };

  const handleDeleteDepartementConfirmation = async (departement: Departement | null) => {
    if (departement) {
      setDialogDepartement(null);
      await deleteDepartement({
        variables: {
          id: departement.id,
        },
        refetchQueries: [PAGINATED_QUERY],
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteDepartement) {
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

  const handleRequestSort = (sortingColumn: DepartementsOrderBy) => {
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
            {data?.departements?.data?.map((departement) => {
              return (
                <TableRow hover key={departement?.id}>
                  <TableCell>{departement?.code}</TableCell>
                  <TableCell>{departement?.nbCommunes}</TableCell>
                  <TableCell>{departement?.nbLieuxDits}</TableCell>
                  <TableCell>{departement?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      disabled={!departement.editable}
                      onEditClicked={() => handleEditDepartement(departement?.id)}
                      onDeleteClicked={() => handleDeleteDepartement(departement)}
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
                count={data?.departements?.count ?? 0}
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
        open={!!dialogDepartement}
        messageContent={t("deleteDepartmentDialogMsg", {
          code: dialogDepartement?.code,
        })}
        impactedItemsMessage={t("deleteDepartmentDialogMsgImpactedData", {
          nbOfObservations: dialogDepartement?.nbDonnees ?? 0,
          nbOfCities: dialogDepartement?.nbCommunes ?? 0,
          nbOfLocalities: dialogDepartement?.nbLieuxDits ?? 0,
        })}
        onCancelAction={() => setDialogDepartement(null)}
        onConfirmAction={() => handleDeleteDepartementConfirmation(dialogDepartement)}
      />
    </>
  );
};

export default DepartementTable;

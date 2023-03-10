import { Table, TableBody, TableFooter, TableHead, TablePagination, TableRow } from "@mui/material";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import { type EntitesAvecLibelleOrderBy, type Meteo } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query MeteosTable($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
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

const DELETE = graphql(`
  mutation DeleteMeteo($id: Int!) {
    deleteMeteo(id: $id)
  }
`);

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const MeteoTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogMeteo, setDialogMeteo] = useState<Meteo | null>(null);

  const [{ data }, reexecuteMeteos] = useQuery({
    query: PAGINATED_QUERY,
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

  const [_, deleteMeteo] = useMutation(DELETE);

  const { displayNotification } = useSnackbar();

  const handleEditMeteo = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteMeteo = (meteo: Meteo | null) => {
    if (meteo) {
      setDialogMeteo(meteo);
    }
  };

  const handleDeleteMeteoConfirmation = (meteo: Meteo | null) => {
    if (meteo) {
      setDialogMeteo(null);
      deleteMeteo({
        id: meteo.id,
      })
        .then(({ data, error }) => {
          reexecuteMeteos();
          if (!error && data?.deleteMeteo) {
            displayNotification({
              type: "success",
              message: t("deleteConfirmationMessage"),
            });
          } else {
            displayNotification({
              type: "error",
              message: t("deleteErrorMessage"),
            });
          }
        })
        .catch(() => {
          displayNotification({
            type: "error",
            message: t("deleteErrorMessage"),
          });
        });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EntitesAvecLibelleOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <ManageEntitiesHeader
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
        }}
        count={data?.meteos?.count}
      />
      <Table>
        <TableHead>
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
            <th align="right">{t("actions")}</th>
          </>
        </TableHead>
        <TableBody>
          {data?.meteos?.data?.map((meteo) => {
            return (
              <tr className="hover" key={meteo?.id}>
                <td>{meteo?.libelle}</td>
                <td>{meteo?.nbDonnees}</td>
                <td align="right">
                  <TableCellActionButtons
                    disabled={!meteo.editable}
                    onEditClicked={() => handleEditMeteo(meteo?.id)}
                    onDeleteClicked={() => handleDeleteMeteo(meteo)}
                  />
                </td>
              </tr>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              page={page}
              rowsPerPage={rowsPerPage}
              count={data?.meteos?.count ?? 0}
              onPageChange={handleChangePage}
            />
          </TableRow>
        </TableFooter>
      </Table>
      <DeletionConfirmationDialog
        open={!!dialogMeteo}
        messageContent={t("deleteWeatherDialogMsg", {
          name: dialogMeteo?.libelle,
        })}
        impactedItemsMessage={t("deleteWeatherDialogMsgImpactedData")}
        onCancelAction={() => setDialogMeteo(null)}
        onConfirmAction={() => handleDeleteMeteoConfirmation(dialogMeteo)}
      />
    </>
  );
};

export default MeteoTable;

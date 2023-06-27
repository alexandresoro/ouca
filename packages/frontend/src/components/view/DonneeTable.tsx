import { getEntriesExtendedResponse, type EntriesOrderBy } from "@ou-ca/common/api/entry";
import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../hooks/api/useApiMutation";
import useApiQuery from "../../hooks/api/useApiQuery";
import usePaginatedTableParams from "../../hooks/usePaginatedTableParams";
import useSnackbar from "../../hooks/useSnackbar";
import Table from "../common/styled/table/Table";
import TableSortLabel from "../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../manage/common/DeletionConfirmationDialog";
import DonneeDetailsRow from "./DonneeDetailsRow";

const COLUMNS = [
  {
    key: "nomFrancais",
    locKey: "observationsTable.header.species",
  },
  {
    key: "nombre",
    locKey: "observationsTable.header.number",
  },
  {
    key: "lieuDit",
    locKey: "observationsTable.header.locality",
  },
  {
    key: "date",
    locKey: "observationsTable.header.date",
  },
  {
    key: "observateur",
    locKey: "observationsTable.header.observer",
  },
] as const;

const DonneeTable: FunctionComponent = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntriesOrderBy>();

  const [deleteDialog, setDeleteDialog] = useState<EntryExtended | null>(null);

  const { displayNotification } = useSnackbar();

  const { data, refetch } = useApiQuery(
    {
      path: "/entries",
      queryParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
        orderBy,
        sortOrder,
        extended: true,
        // TODO add search criteria
      },
      schema: getEntriesExtendedResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { mutate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await refetch();
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const handleOpenDonneeDetails = (donnee: EntryExtended) => {
    if (donnee) {
      navigate(`/entry/${donnee.id}`);
    }
  };

  const handleDeleteDonnee = (donnee: EntryExtended | null) => {
    if (donnee) {
      setDeleteDialog(donnee);
    }
  };

  const handleDeleteDonneeConfirmation = (donnee: EntryExtended | null) => {
    if (donnee) {
      setDeleteDialog(null);
      mutate({ path: `/entry/${donnee.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EntriesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <Table
        tableHead={
          <>
            <th />
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
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.data.map((donnee) => {
          return donnee ? (
            <DonneeDetailsRow
              key={donnee.id}
              donnee={donnee}
              onViewAction={() => handleOpenDonneeDetails(donnee)}
              onDeleteAction={() => handleDeleteDonnee(donnee)}
            />
          ) : (
            <></>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.meta.count ?? 0}
        onPageChange={handleChangePage}
      />

      <DeletionConfirmationDialog
        open={!!deleteDialog}
        messageContent={t("deleteObservationDialogMsg", {
          species: deleteDialog?.species.nomFrancais,
          locality: deleteDialog?.inventory.locality.nom,
          city: deleteDialog?.inventory.locality.townName,
          department: deleteDialog?.inventory.locality.departmentCode,
          date: deleteDialog?.inventory.date,
        })}
        onCancelAction={() => setDeleteDialog(null)}
        onConfirmAction={() => handleDeleteDonneeConfirmation(deleteDialog)}
      />
    </>
  );
};

export default DonneeTable;

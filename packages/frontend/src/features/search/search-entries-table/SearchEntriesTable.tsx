import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import DeletionConfirmationDialog from "@components/common/DeletionConfirmationDialog";
import useApiInfiniteQuery from "@hooks/api/useApiInfiniteQuery";
import usePaginationParams from "@hooks/usePaginationParams";
import useSnackbar from "@hooks/useSnackbar";
import { getEntriesExtendedResponse, type EntriesOrderBy } from "@ou-ca/common/api/entry";
import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { useApiEntryDelete } from "@services/api/entry/api-entry-queries";
import { useAtomValue } from "jotai";
import { Fragment, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import EntryDetailsDialogContainer from "../../observation/entry/entry-details-dialog-container/EntryDetailsDialogContainer";
import { searchEntriesCriteriaAtom } from "../searchEntriesCriteriaAtom";
import SearchEntriesTableRow from "./SearchEntriesTableRow";

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

const SearchEntriesTable: FunctionComponent = () => {
  const { t } = useTranslation();

  const { orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<EntriesOrderBy>();

  const [deleteDialog, setDeleteDialog] = useState<EntryExtended | null>(null);
  const [viewEntryDialogEntry, setViewEntryDialogEntry] = useState<EntryExtended | undefined>();

  const { displayNotification } = useSnackbar();

  const searchCriteria = useAtomValue(searchEntriesCriteriaAtom);

  const { data, refetch, fetchNextPage, hasNextPage } = useApiInfiniteQuery(
    {
      path: "/entries",
      queryParams: {
        pageSize: 10,
        orderBy,
        sortOrder,
        extended: true,
        ...searchCriteria,
      },
      schema: getEntriesExtendedResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { mutate } = useApiEntryDelete({
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
  });

  const handleDeleteDonnee = (donnee: EntryExtended | null) => {
    if (donnee) {
      setDeleteDialog(donnee);
    }
  };

  const handleDeleteDonneeConfirmation = (donnee: EntryExtended | null) => {
    if (donnee) {
      setDeleteDialog(null);
      mutate({ entryId: donnee.id });
    }
  };

  const handleRequestSort = (sortingColumn: EntriesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <InfiniteTable
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
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((donnee) => {
                return (
                  <SearchEntriesTableRow
                    key={donnee.id}
                    donnee={donnee}
                    onViewAction={() => setViewEntryDialogEntry(donnee)}
                    onDeleteAction={() => handleDeleteDonnee(donnee)}
                  />
                );
              })}
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={fetchNextPage}
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

      <EntryDetailsDialogContainer
        entry={viewEntryDialogEntry}
        open={viewEntryDialogEntry != null}
        onClose={() => setViewEntryDialogEntry(undefined)}
      />
    </>
  );
};

export default SearchEntriesTable;

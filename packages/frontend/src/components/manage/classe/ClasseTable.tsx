import { getClassesExtendedResponse, type ClassesOrderBy } from "@ou-ca/common/api/species-class";
import { type SpeciesClassExtended } from "@ou-ca/common/entities/species-class";
import { Fragment, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginationParams from "../../../hooks/usePaginationParams";
import useSnackbar from "../../../hooks/useSnackbar";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbEspeces",
    locKey: "numberOfSpecies",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const ClasseTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<ClassesOrderBy>();

  const [dialogClasse, setDialogClasse] = useState<SpeciesClassExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery({
    path: "/classes",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getClassesExtendedResponse,
  });

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

  const { displayNotification } = useSnackbar();

  const handleEditClasse = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteClasse = (classe: SpeciesClassExtended | null) => {
    if (classe) {
      setDialogClasse(classe);
    }
  };

  const handleDeleteClasseConfirmation = (classe: SpeciesClassExtended | null) => {
    if (classe) {
      setDialogClasse(null);
      mutate({ path: `/classes/${classe.id}` });
    }
  };

  const handleRequestSort = (sortingColumn: ClassesOrderBy) => {
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
        count={data?.pages?.[0].meta.count}
      />
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
              {page.data.map((classe) => {
                return (
                  <tr className="hover:bg-base-200" key={classe?.id}>
                    <td>{classe.libelle}</td>
                    <td>{classe.speciesCount}</td>
                    <td>{classe.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabled={!classe.editable}
                        onEditClicked={() => handleEditClasse(classe?.id)}
                        onDeleteClicked={() => handleDeleteClasse(classe)}
                      />
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={fetchNextPage}
      />
      <DeletionConfirmationDialog
        open={!!dialogClasse}
        messageContent={t("deleteClassDialogMsg", {
          name: dialogClasse?.libelle,
        })}
        impactedItemsMessage={t("deleteClassDialogMsgImpactedData", {
          nbOfObservations: dialogClasse?.entriesCount ?? 0,
          nbOfSpecies: dialogClasse?.speciesCount ?? 0,
        })}
        onCancelAction={() => setDialogClasse(null)}
        onConfirmAction={() => handleDeleteClasseConfirmation(dialogClasse)}
      />
    </>
  );
};

export default ClasseTable;

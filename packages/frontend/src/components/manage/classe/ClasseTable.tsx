import { getClassesExtendedResponse, type ClassesOrderBy } from "@ou-ca/common/api/species-class";
import { type SpeciesClassExtended } from "@ou-ca/common/entities/species-class";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import { usePaginatedTableParams_legacy } from "../../../hooks/usePaginationParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
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

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams_legacy<ClassesOrderBy>();

  const [dialogClasse, setDialogClasse] = useState<SpeciesClassExtended | null>(null);

  const { data, refetch } = useApiQuery(
    {
      path: "/classes",
      queryParams: {
        q: query,
        pageNumber: page,
        pageSize: rowsPerPage,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getClassesExtendedResponse,
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
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
        count={data?.meta.count}
      />
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
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.data.map((classe) => {
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
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.meta.count}
        onPageChange={handleChangePage}
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

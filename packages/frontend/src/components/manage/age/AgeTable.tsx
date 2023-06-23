import { getAgesExtendedResponse } from "@ou-ca/common/api/age";
import { type EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { type AgeExtended } from "@ou-ca/common/entities/age";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
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
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const AgeTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitiesWithLabelOrderBy>();

  const [dialogAge, setDialogAge] = useState<AgeExtended | null>(null);

  const { data, refetch } = useApiQuery(
    {
      path: "/ages",
      queryParams: {
        q: query,
        pageNumber: page,
        pageSize: rowsPerPage,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getAgesExtendedResponse,
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

  const handleEditAge = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteAge = (age: AgeExtended) => {
    if (age) {
      setDialogAge(age);
    }
  };

  const handleDeleteAgeConfirmation = (age: AgeExtended | null) => {
    if (age) {
      setDialogAge(null);
      mutate({ path: `/ages/${age.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EntitiesWithLabelOrderBy) => {
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
        tableRows={data?.data.map((age) => {
          return (
            <tr className="hover:bg-base-200" key={age?.id}>
              <td>{age?.libelle}</td>
              <td>{age?.entriesCount}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!age.editable}
                  onEditClicked={() => handleEditAge(age.id)}
                  onDeleteClicked={() => handleDeleteAge(age)}
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
        open={!!dialogAge}
        messageContent={t("deleteAgeDialogMsg", {
          name: dialogAge?.libelle,
        })}
        impactedItemsMessage={t("deleteAgeDialogMsgImpactedData", {
          nbOfObservations: dialogAge?.entriesCount ?? 0,
        })}
        onCancelAction={() => setDialogAge(null)}
        onConfirmAction={() => handleDeleteAgeConfirmation(dialogAge)}
      />
    </>
  );
};

export default AgeTable;

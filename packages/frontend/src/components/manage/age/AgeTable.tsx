import { getAgesExtendedResponse } from "@ou-ca/common/api/age";
import { type EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { type AgeExtended } from "@ou-ca/common/entities/age";
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
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const AgeTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>();

  const [dialogAge, setDialogAge] = useState<AgeExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery({
    path: "/ages",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getAgesExtendedResponse,
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
              {page.data.map((age) => {
                return (
                  <tr className="hover:bg-base-200" key={age.id}>
                    <td>{age.libelle}</td>
                    <td>{age.entriesCount}</td>
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
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={fetchNextPage}
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

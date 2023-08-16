import { type EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { getSexesExtendedResponse } from "@ou-ca/common/api/sex";
import { type SexExtended } from "@ou-ca/common/entities/sex";
import { Fragment, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginationParams from "../../../hooks/usePaginationParams";
import useSnackbar from "../../../hooks/useSnackbar";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type SexeTableProps = {
  onClickUpdateSex: (id: string) => void;
  onClickDeleteSex: (sex: SexExtended) => void;
};

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

const SexeTable: FunctionComponent<SexeTableProps> = ({ onClickUpdateSex, onClickDeleteSex }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>();

  const [dialogSexe, setDialogSexe] = useState<SexExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery({
    path: "/sexes",
    queryKeyPrefix: "sexTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getSexesExtendedResponse,
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

  const handleDeleteSexe = (sexe: SexExtended | null) => {
    if (sexe) {
      setDialogSexe(sexe);
    }
  };

  const handleDeleteSexeConfirmation = (sexe: SexExtended | null) => {
    if (sexe) {
      setDialogSexe(null);
      mutate({ path: `/sexes/${sexe.id}` });
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
              {page.data.map((sexe) => {
                return (
                  <tr className="hover:bg-base-200" key={sexe?.id}>
                    <td>{sexe?.libelle}</td>
                    <td>{sexe?.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabled={!sexe.editable}
                        onEditClicked={() => onClickUpdateSex(sexe?.id)}
                        onDeleteClicked={() => handleDeleteSexe(sexe)}
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
        open={!!dialogSexe}
        messageContent={t("deleteGenderDialogMsg", {
          name: dialogSexe?.libelle,
        })}
        impactedItemsMessage={t("deleteGenderDialogMsgImpactedData", {
          nbOfObservations: dialogSexe?.entriesCount ?? 0,
        })}
        onCancelAction={() => setDialogSexe(null)}
        onConfirmAction={() => handleDeleteSexeConfirmation(dialogSexe)}
      />
    </>
  );
};

export default SexeTable;

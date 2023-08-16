import { getEnvironmentsExtendedResponse, type EnvironmentsOrderBy } from "@ou-ca/common/api/environment";
import { type Environment } from "@ou-ca/common/entities/environment";
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

type MilieuTableProps = {
  onClickUpdateEnvironment: (id: string) => void;
};

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

const MilieuTable: FunctionComponent<MilieuTableProps> = ({ onClickUpdateEnvironment }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<EnvironmentsOrderBy>();

  const [dialogMilieu, setDialogMilieu] = useState<Environment | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery({
    path: "/environments",
    queryKeyPrefix: "environmentTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getEnvironmentsExtendedResponse,
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

  const handleDeleteMilieu = (milieu: Environment | null) => {
    if (milieu) {
      setDialogMilieu(milieu);
    }
  };

  const handleDeleteMilieuConfirmation = (milieu: Environment | null) => {
    if (milieu) {
      setDialogMilieu(null);
      mutate({ path: `/environments/${milieu.id}` });
    }
  };

  const handleRequestSort = (sortingColumn: EnvironmentsOrderBy) => {
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
              {page.data.map((milieu) => {
                return (
                  <tr className="hover:bg-base-200" key={milieu?.id}>
                    <td>{milieu.code}</td>
                    <td>{milieu.libelle}</td>
                    <td>{milieu.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabled={!milieu.editable}
                        onEditClicked={() => onClickUpdateEnvironment(milieu?.id)}
                        onDeleteClicked={() => handleDeleteMilieu(milieu)}
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

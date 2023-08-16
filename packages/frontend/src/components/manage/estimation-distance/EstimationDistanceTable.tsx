import { type EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { getDistanceEstimatesExtendedResponse } from "@ou-ca/common/api/distance-estimate";
import { type DistanceEstimateExtended } from "@ou-ca/common/entities/distance-estimate";
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

type EstimationDistanceTableProps = {
  onClickUpdateDistanceEstimate: (id: string) => void;
  onClickDeleteDistanceEstimate: (distanceEstimate: DistanceEstimateExtended) => void;
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

const EstimationDistanceTable: FunctionComponent<EstimationDistanceTableProps> = ({ onClickUpdateDistanceEstimate, onClickDeleteDistanceEstimate }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
  usePaginationParams<EntitiesWithLabelOrderBy>();

  const [dialogEstimationDistance, setDialogEstimationDistance] = useState<DistanceEstimateExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery(
    {
      path: "/distance-estimates",
      queryKeyPrefix: "distanceEstimateTable",
      queryParams: {
        q: query,
        pageSize: 10,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getDistanceEstimatesExtendedResponse,
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

  const handleDeleteEstimationDistance = (estimationDistance: DistanceEstimateExtended) => {
    if (estimationDistance) {
      setDialogEstimationDistance(estimationDistance);
    }
  };

  const handleDeleteEstimationDistanceConfirmation = (estimationDistance: DistanceEstimateExtended | null) => {
    if (estimationDistance) {
      setDialogEstimationDistance(null);
      mutate({ path: `/distance-estimates/${estimationDistance.id}` });
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
              <th align="right" className="pr-8">{t("actions")}</th>
            </>}
        tableRows={data?.pages.map((page) => {
            return <Fragment key={page.meta.pageNumber}>{page.data.map((estimationDistance) => {
              return (
                <tr className="hover:bg-base-200" key={estimationDistance?.id}>
                  <td>{estimationDistance.libelle}</td>
                  <td>{estimationDistance.entriesCount}</td>
                  <td align="right" className="pr-6">
                    <TableCellActionButtons
                      disabled={!estimationDistance.editable}
                      onEditClicked={() => onClickUpdateDistanceEstimate(estimationDistance?.id)}
                      onDeleteClicked={() => handleDeleteEstimationDistance(estimationDistance)}
                    />
                  </td>
                </tr>
              );
            })}</Fragment>;
          })}
        enableScroll={hasNextPage}
        onMoreRequested={fetchNextPage}
      />
      <DeletionConfirmationDialog
        open={!!dialogEstimationDistance}
        messageContent={t("deleteDistancePrecisionDialogMsg", {
          name: dialogEstimationDistance?.libelle,
        })}
        impactedItemsMessage={t("deleteDistancePrecisionDialogMsgImpactedData", {
          nbOfObservations: dialogEstimationDistance?.entriesCount ?? 0,
        })}
        onCancelAction={() => setDialogEstimationDistance(null)}
        onConfirmAction={() => handleDeleteEstimationDistanceConfirmation(dialogEstimationDistance)}
      />
    </>
  );
};

export default EstimationDistanceTable;

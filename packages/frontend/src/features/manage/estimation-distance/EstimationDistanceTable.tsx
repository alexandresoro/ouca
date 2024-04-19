import type { EntitiesWithLabelOrderBy, SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import { getDistanceEstimatesResponse } from "@ou-ca/common/api/distance-estimate";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import DistanceEstimateTableRow from "./DistanceEstimateTableRow";

type EstimationDistanceTableProps = {
  distanceEstimates: DistanceEstimate[] | undefined;
  onClickUpdateDistanceEstimate: (distanceEstimate: DistanceEstimate) => void;
  onClickDeleteDistanceEstimate: (distanceEstimate: DistanceEstimate) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: EntitiesWithLabelOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: EntitiesWithLabelOrderBy) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const EstimationDistanceTable: FunctionComponent<EstimationDistanceTableProps> = ({
  distanceEstimates,
  onClickUpdateDistanceEstimate,
  onClickDeleteDistanceEstimate,
  onMoreRequested,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/distance-estimates",
    queryKeyPrefix: "distanceEstimateTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
    },
    schema: getDistanceEstimatesResponse,
  });

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
            <th className="w-32">
              <TableSortLabel
                active={orderBy === "nbDonnees"}
                direction={orderBy === "nbDonnees" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("nbDonnees")}
              >
                <span className="first-letter:capitalize">{t("numberOfObservations")}</span>
              </TableSortLabel>
            </th>
            <th align="center" className="w-32 first-letter:capitalize">
              {t("owner")}
            </th>
            <th align="center" className="w-32">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((distanceEstimate) => (
                <DistanceEstimateTableRow
                  key={distanceEstimate.id}
                  distanceEstimate={distanceEstimate}
                  onEditClicked={onClickUpdateDistanceEstimate}
                  onDeleteClicked={onClickDeleteDistanceEstimate}
                />
              ))}
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={fetchNextPage}
      />
    </>
  );
};

export default EstimationDistanceTable;

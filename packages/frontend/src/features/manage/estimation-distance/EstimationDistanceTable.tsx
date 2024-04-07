import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { getDistanceEstimatesExtendedResponse } from "@ou-ca/common/api/distance-estimate";
import type { DistanceEstimateExtended } from "@ou-ca/common/api/entities/distance-estimate";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type EstimationDistanceTableProps = {
  onClickUpdateDistanceEstimate: (distanceEstimate: DistanceEstimateExtended) => void;
  onClickDeleteDistanceEstimate: (distanceEstimate: DistanceEstimateExtended) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const EstimationDistanceTable: FunctionComponent<EstimationDistanceTableProps> = ({
  onClickUpdateDistanceEstimate,
  onClickDeleteDistanceEstimate,
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
      extended: true,
    },
    schema: getDistanceEstimatesExtendedResponse,
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
              {page.data.map((estimationDistance) => {
                return (
                  <tr className="hover:bg-base-200" key={estimationDistance?.id}>
                    <td>{estimationDistance.libelle}</td>
                    <td>{estimationDistance.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={estimationDistance.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!estimationDistance.editable}
                        disabledDelete={!estimationDistance.editable || estimationDistance.entriesCount > 0}
                        onEditClicked={() => onClickUpdateDistanceEstimate(estimationDistance)}
                        onDeleteClicked={() => onClickDeleteDistanceEstimate(estimationDistance)}
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
    </>
  );
};

export default EstimationDistanceTable;

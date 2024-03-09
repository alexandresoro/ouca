import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Observer } from "@ou-ca/common/api/entities/observer";
import { getObserversResponse } from "@ou-ca/common/api/observer";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import ObserverTableRow from "./ObserverTableRow";

type ObservateurTableProps = {
  onClickUpdateObserver: (observer: Observer) => void;
  onClickDeleteObserver: (observer: Observer) => void;
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

const ObservateurTable: FunctionComponent<ObservateurTableProps> = ({
  onClickUpdateObserver,
  onClickDeleteObserver,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>();

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/observers",
    queryKeyPrefix: "observerTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
    },
    schema: getObserversResponse,
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
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((observateur) => (
                <ObserverTableRow
                  id={observateur.id}
                  key={observateur.id}
                  onEditClicked={onClickUpdateObserver}
                  onDeleteClicked={onClickDeleteObserver}
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

export default ObservateurTable;

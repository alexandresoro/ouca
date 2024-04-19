import type { Locality } from "@ou-ca/common/api/entities/locality";
import { type LocalitiesOrderBy, getLocalitiesResponse } from "@ou-ca/common/api/locality";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import LocalityTableRow from "./LocalityTableRow";

type LieuDitTableProps = {
  localities: Locality[] | undefined;
  onClickUpdateLocality: (locality: Locality) => void;
  onClickDeleteLocality: (locality: Locality) => void;
};

const COLUMNS = [
  {
    key: "departement",
    locKey: "department",
  },
  {
    key: "codeCommune",
    locKey: "townCode",
  },
  {
    key: "nomCommune",
    locKey: "townName",
  },
  {
    key: "nom",
    locKey: "name",
  },
  {
    key: "latitude",
    locKey: "latitude",
  },
  {
    key: "longitude",
    locKey: "longitude",
  },
  {
    key: "altitude",
    locKey: "altitude",
  },
] as const;

const LieuDitTable: FunctionComponent<LieuDitTableProps> = ({
  localities,
  onClickUpdateLocality,
  onClickDeleteLocality,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<LocalitiesOrderBy>({
    orderBy: "nom",
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/localities",
    queryKeyPrefix: "localityTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
    },
    schema: getLocalitiesResponse,
  });

  const handleRequestSort = (sortingColumn: LocalitiesOrderBy) => {
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
              {page.data.map((locality) => (
                <LocalityTableRow
                  key={locality.id}
                  locality={locality}
                  onEditClicked={onClickUpdateLocality}
                  onDeleteClicked={onClickDeleteLocality}
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

export default LieuDitTable;

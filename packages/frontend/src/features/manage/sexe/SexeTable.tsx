import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Sex } from "@ou-ca/common/api/entities/sex";
import { getSexesResponse } from "@ou-ca/common/api/sex";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import SexTableRow from "./SexTableRow";

type SexeTableProps = {
  onClickUpdateSex: (sex: Sex) => void;
  onClickDeleteSex: (sex: Sex) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const SexeTable: FunctionComponent<SexeTableProps> = ({ onClickUpdateSex, onClickDeleteSex }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/sexes",
    queryKeyPrefix: "sexTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
    },
    schema: getSexesResponse,
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
              {page.data.map((sex) => (
                <SexTableRow
                  sex={sex}
                  key={sex.id}
                  onEditClicked={onClickUpdateSex}
                  onDeleteClicked={onClickDeleteSex}
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

export default SexeTable;

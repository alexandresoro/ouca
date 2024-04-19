import type { SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import { type ClassesOrderBy, getClassesResponse } from "@ou-ca/common/api/species-class";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import SpeciesClassTableRow from "./SpeciesClassTableRow";

type ClasseTableProps = {
  speciesClasses: SpeciesClass[] | undefined;
  onClickUpdateSpeciesClass: (speciesClass: SpeciesClass) => void;
  onClickDeleteSpeciesClass: (speciesClass: SpeciesClass) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const ClasseTable: FunctionComponent<ClasseTableProps> = ({
  speciesClasses,
  onClickUpdateSpeciesClass,
  onClickDeleteSpeciesClass,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<ClassesOrderBy>({
    orderBy: "libelle",
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/classes",
    queryKeyPrefix: "speciesClassTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
    },
    schema: getClassesResponse,
  });

  const handleRequestSort = (sortingColumn: ClassesOrderBy) => {
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
                active={orderBy === "nbEspeces"}
                direction={orderBy === "nbEspeces" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("nbEspeces")}
              >
                <span className="first-letter:capitalize">{t("numberOfSpecies")}</span>
              </TableSortLabel>
            </th>
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
              {page.data.map((speciesClass) => (
                <SpeciesClassTableRow
                  speciesClass={speciesClass}
                  key={speciesClass.id}
                  onEditClicked={onClickUpdateSpeciesClass}
                  onDeleteClicked={onClickDeleteSpeciesClass}
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

export default ClasseTable;

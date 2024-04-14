import usePaginationParams from "@hooks/usePaginationParams";
import type { SpeciesOrderBy } from "@ou-ca/common/api/species";
import { useApiSearchInfiniteSpecies } from "@services/api/search/api-search-queries";
import { useAtomValue } from "jotai";
import { Fragment, type FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import { searchEntriesCriteriaAtom } from "../searchEntriesCriteriaAtom";
import SearchSpeciesTableRow from "./SearchSpeciesTableRow";

const COLUMNS = [
  {
    key: "nomClasse",
    locKey: "speciesClass",
  },
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nomFrancais",
    locKey: "localizedName",
  },
  {
    key: "nomLatin",
    locKey: "scientificName",
  },
] as const;

const SearchSpeciesTable: FunctionComponent = () => {
  const { t } = useTranslation();

  const { orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<SpeciesOrderBy>();

  useEffect(() => {
    setOrderBy("nbDonnees");
    setSortOrder("desc");
  }, [setOrderBy, setSortOrder]);

  const searchCriteria = useAtomValue(searchEntriesCriteriaAtom);

  const { data, fetchNextPage, hasNextPage } = useApiSearchInfiniteSpecies({
    pageSize: 10,
    orderBy,
    sortOrder,
    ...searchCriteria,
  });

  const handleRequestSort = (sortingColumn: SpeciesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
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
              <span className="first-letter: capitalize">{t("numberOfObservations")}</span>
            </TableSortLabel>
          </th>
        </>
      }
      tableRows={data?.map((page) => {
        return (
          <Fragment key={page.meta.pageNumber}>
            {page.data.map((espece) => {
              return <SearchSpeciesTableRow key={espece.id} species={espece} />;
            })}
          </Fragment>
        );
      })}
      enableScroll={hasNextPage}
      onMoreRequested={fetchNextPage}
    />
  );
};

export default SearchSpeciesTable;

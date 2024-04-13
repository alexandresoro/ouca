import useApiInfiniteQuery from "@hooks/api/useApiInfiniteQuery";
import usePaginationParams from "@hooks/usePaginationParams";
import { type SpeciesOrderBy, getSpeciesPaginatedResponse } from "@ou-ca/common/api/species";
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

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery(
    {
      path: "/search/species",
      queryParams: {
        pageSize: 10,
        orderBy,
        sortOrder,
        ...searchCriteria,
      },
      schema: getSpeciesPaginatedResponse,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: "always",
    },
  );

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
      tableRows={data?.pages.map((page) => {
        return (
          <Fragment key={page.meta.pageNumber}>
            {page.data.map((espece) => {
              return <SearchSpeciesTableRow species={espece} />;
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

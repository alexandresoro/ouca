import useApiInfiniteQuery from "@hooks/api/useApiInfiniteQuery";
import usePaginationParams from "@hooks/usePaginationParams";
import { type SpeciesOrderBy, getSpeciesExtendedResponse } from "@ou-ca/common/api/species";
import { useAtomValue } from "jotai";
import { Fragment, type FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import { searchEntriesCriteriaAtom } from "../searchEntriesCriteriaAtom";

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
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
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
      path: "/species",
      queryParams: {
        pageSize: 10,
        orderBy,
        sortOrder,
        extended: true,
        ...searchCriteria,
      },
      schema: getSpeciesExtendedResponse,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: "always",
    }
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
        </>
      }
      tableRows={data?.pages.map((page) => {
        return (
          <Fragment key={page.meta.pageNumber}>
            {page.data.map((espece) => {
              return (
                <tr className="hover:bg-base-200" key={espece.id}>
                  <td>{espece.speciesClass?.libelle}</td>
                  <td>{espece.code}</td>
                  <td>{espece.nomFrancais}</td>
                  <td>{espece.nomLatin}</td>
                  <td>{espece.entriesCount}</td>
                </tr>
              );
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

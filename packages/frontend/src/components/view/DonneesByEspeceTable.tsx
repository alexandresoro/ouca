import { getSpeciesExtendedResponse, type SpeciesOrderBy } from "@ou-ca/common/api/species";
import { Fragment, useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiInfiniteQuery from "../../hooks/api/useApiInfiniteQuery";
import usePaginatedTableParams from "../../hooks/usePaginatedTableParams";
import InfiniteTable from "../common/styled/table/InfiniteTable";
import TableSortLabel from "../common/styled/table/TableSortLabel";

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

const DonneesByEspeceTable: FunctionComponent = () => {
  const { t } = useTranslation();

  const { orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginatedTableParams<SpeciesOrderBy>();

  useEffect(() => {
    setOrderBy("nbDonnees");
    setSortOrder("desc");
  }, [setOrderBy, setSortOrder]);

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery(
    {
      path: "/species",
      queryParams: {
        pageSize: 10,
        orderBy,
        sortOrder,
        extended: true,
        // TODO add search criteria
      },
      schema: getSpeciesExtendedResponse,
    },
    {
      staleTime: Infinity,
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
                  <td>{espece.speciesClassName}</td>
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
      onMoreRequested={() => fetchNextPage()}
    />
  );
};

export default DonneesByEspeceTable;

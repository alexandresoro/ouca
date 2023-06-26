import { getSpeciesExtendedResponse, type SpeciesOrderBy } from "@ou-ca/common/api/species";
import { useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../hooks/api/useApiQuery";
import usePaginatedTableParams from "../../hooks/usePaginatedTableParams";
import Table from "../common/styled/table/Table";
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

  const { page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<SpeciesOrderBy>();

  useEffect(() => {
    setOrderBy("nbDonnees");
    setSortOrder("desc");
  }, [setOrderBy, setSortOrder]);

  const { data } = useApiQuery(
    {
      path: "/species",
      queryParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: SpeciesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <Table
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
      tableRows={data?.data.map((espece) => {
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
      page={page}
      elementsPerPage={rowsPerPage}
      count={data?.meta.count ?? 0}
      onPageChange={handleChangePage}
    />
  );
};

export default DonneesByEspeceTable;

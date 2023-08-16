import { getLocalitiesExtendedResponse, type LocalitiesOrderBy } from "@ou-ca/common/api/locality";
import { type LocalityExtended } from "@ou-ca/common/entities/locality";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type LieuDitTableProps = {
  onClickUpdateLocality: (id: string) => void;
  onClickDeleteLocality: (locality: LocalityExtended) => void;
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
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const LieuDitTable: FunctionComponent<LieuDitTableProps> = ({ onClickUpdateLocality, onClickDeleteLocality }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<LocalitiesOrderBy>();

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/localities",
    queryKeyPrefix: "localityTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getLocalitiesExtendedResponse,
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
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((lieuDit) => {
                return (
                  <tr className="hover:bg-base-200" key={lieuDit?.id}>
                    <td>{lieuDit.departmentCode}</td>
                    <td>{lieuDit.townCode}</td>
                    <td>{lieuDit.townName}</td>
                    <td>{lieuDit.nom}</td>
                    <td>{lieuDit.coordinates.latitude}</td>
                    <td>{lieuDit.coordinates.longitude}</td>
                    <td>{lieuDit.coordinates.altitude}</td>
                    <td>{lieuDit.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabled={!lieuDit.editable}
                        onEditClicked={() => onClickUpdateLocality(lieuDit?.id)}
                        onDeleteClicked={() => onClickDeleteLocality(lieuDit)}
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

export default LieuDitTable;

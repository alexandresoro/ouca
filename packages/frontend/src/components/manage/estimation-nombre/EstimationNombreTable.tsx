import { getNumberEstimatesExtendedResponse, type NumberEstimatesOrderBy } from "@ou-ca/common/api/number-estimate";
import { type NumberEstimateExtended } from "@ou-ca/common/entities/number-estimate";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type EstimationNombreTableProps = {
  onClickUpdateNumberEstimate: (id: string) => void;
  onClickDeleteNumberEstimate: (numberEstimate: NumberEstimateExtended) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nonCompte",
    locKey: "undefinedNumber",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const EstimationNombreTable: FunctionComponent<EstimationNombreTableProps> = ({
  onClickUpdateNumberEstimate,
  onClickDeleteNumberEstimate,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<NumberEstimatesOrderBy>();

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/number-estimates",
    queryKeyPrefix: "numberEstimateTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getNumberEstimatesExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: NumberEstimatesOrderBy) => {
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
              {page.data.map((estimationNombre) => {
                return (
                  <tr className="hover:bg-base-200" key={estimationNombre?.id}>
                    <td>{estimationNombre.libelle}</td>
                    <td>{estimationNombre.nonCompte ? "Oui" : ""}</td>
                    <td>{estimationNombre.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabled={!estimationNombre.editable}
                        onEditClicked={() => onClickUpdateNumberEstimate(estimationNombre?.id)}
                        onDeleteClicked={() => onClickDeleteNumberEstimate(estimationNombre)}
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

export default EstimationNombreTable;

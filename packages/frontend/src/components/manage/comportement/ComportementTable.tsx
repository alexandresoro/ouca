import { getBehaviorsExtendedResponse, type BehaviorsOrderBy } from "@ou-ca/common/api/behavior";
import { type BehaviorExtended } from "@ou-ca/common/entities/behavior";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type ComportementTableProps = {
  onClickUpdateBehavior: (id: string) => void;
  onClickDeleteBehavior: (behavior: BehaviorExtended) => void;
};

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nicheur",
    locKey: "breeding",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const ComportementTable: FunctionComponent<ComportementTableProps> = ({
  onClickUpdateBehavior,
  onClickDeleteBehavior,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<BehaviorsOrderBy>();

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/behaviors",
    queryKeyPrefix: "behaviorTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getBehaviorsExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: BehaviorsOrderBy) => {
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
              {page.data.map((comportement) => {
                return (
                  <tr className="hover:bg-base-200" key={comportement?.id}>
                    <td>{comportement.code}</td>
                    <td>{comportement.libelle}</td>
                    <td>{comportement.nicheur ? t(`breedingStatus.${comportement?.nicheur}`) : ""}</td>
                    <td>{comportement.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabled={!comportement.editable}
                        onEditClicked={() => onClickUpdateBehavior(comportement?.id)}
                        onDeleteClicked={() => onClickDeleteBehavior(comportement)}
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

export default ComportementTable;

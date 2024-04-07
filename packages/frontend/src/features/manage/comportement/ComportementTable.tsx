import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { type BehaviorsOrderBy, getBehaviorsExtendedResponse } from "@ou-ca/common/api/behavior";
import type { BehaviorExtended } from "@ou-ca/common/api/entities/behavior";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type ComportementTableProps = {
  onClickUpdateBehavior: (behavior: BehaviorExtended) => void;
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
] as const;

const ComportementTable: FunctionComponent<ComportementTableProps> = ({
  onClickUpdateBehavior,
  onClickDeleteBehavior,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<BehaviorsOrderBy>({
    orderBy: "code",
  });

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
              {page.data.map((comportement) => {
                return (
                  <tr className="hover:bg-base-200" key={comportement?.id}>
                    <td>{comportement.code}</td>
                    <td>{comportement.libelle}</td>
                    <td>{comportement.nicheur ? t(`breedingStatus.${comportement?.nicheur}`) : ""}</td>
                    <td>{comportement.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={comportement.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!comportement.editable}
                        disabledDelete={!comportement.editable}
                        onEditClicked={() => onClickUpdateBehavior(comportement)}
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

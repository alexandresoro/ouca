import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import type { TownExtended } from "@ou-ca/common/api/entities/town";
import { type TownsOrderBy, getTownsExtendedResponse } from "@ou-ca/common/api/town";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type CommuneTableProps = {
  onClickUpdateTown: (town: TownExtended) => void;
  onClickDeleteTown: (town: TownExtended) => void;
};

const COLUMNS = [
  {
    key: "departement",
    locKey: "department",
  },
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nom",
    locKey: "name",
  },
  {
    key: "nbLieuxDits",
    locKey: "numberOfLocalities",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const CommuneTable: FunctionComponent<CommuneTableProps> = ({ onClickUpdateTown, onClickDeleteTown }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<TownsOrderBy>();

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/towns",
    queryKeyPrefix: "townTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getTownsExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: TownsOrderBy) => {
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
              {page.data.map((commune) => {
                return (
                  <tr className="hover:bg-base-200" key={commune?.id}>
                    <td>{commune.departmentCode}</td>
                    <td>{commune.code}</td>
                    <td>{commune.nom}</td>
                    <td>{commune.localitiesCount}</td>
                    <td>{commune.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={commune.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!commune.editable}
                        disabledDelete={!commune.editable || commune.localitiesCount > 0}
                        onEditClicked={() => onClickUpdateTown(commune)}
                        onDeleteClicked={() => onClickDeleteTown(commune)}
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

export default CommuneTable;

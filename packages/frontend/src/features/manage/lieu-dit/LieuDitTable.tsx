import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import type { LocalityExtended } from "@ou-ca/common/api/entities/locality";
import { type LocalitiesOrderBy, getLocalitiesExtendedResponse } from "@ou-ca/common/api/locality";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type LieuDitTableProps = {
  onClickUpdateLocality: (locality: LocalityExtended) => void;
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
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={lieuDit.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!lieuDit.editable}
                        disabledDelete={!lieuDit.editable || lieuDit.inventoriesCount > 0}
                        onEditClicked={() => onClickUpdateLocality(lieuDit)}
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

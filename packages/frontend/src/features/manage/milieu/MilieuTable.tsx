import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import type { EnvironmentExtended } from "@ou-ca/common/api/entities/environment";
import { type EnvironmentsOrderBy, getEnvironmentsExtendedResponse } from "@ou-ca/common/api/environment";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type MilieuTableProps = {
  onClickUpdateEnvironment: (environment: EnvironmentExtended) => void;
  onClickDeleteEnvironment: (environment: EnvironmentExtended) => void;
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
] as const;

const MilieuTable: FunctionComponent<MilieuTableProps> = ({ onClickUpdateEnvironment, onClickDeleteEnvironment }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<EnvironmentsOrderBy>({
    orderBy: "code",
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/environments",
    queryKeyPrefix: "environmentTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getEnvironmentsExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: EnvironmentsOrderBy) => {
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
              {page.data.map((milieu) => {
                return (
                  <tr className="hover:bg-base-200" key={milieu?.id}>
                    <td>{milieu.code}</td>
                    <td>{milieu.libelle}</td>
                    <td>{milieu.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={milieu.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!milieu.editable}
                        disabledDelete={!milieu.editable}
                        onEditClicked={() => onClickUpdateEnvironment(milieu)}
                        onDeleteClicked={() => onClickDeleteEnvironment(milieu)}
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

export default MilieuTable;

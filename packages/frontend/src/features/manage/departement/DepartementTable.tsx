import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import { type DepartmentsOrderBy, getDepartmentsExtendedResponse } from "@ou-ca/common/api/department";
import type { DepartmentExtended } from "@ou-ca/common/api/entities/department";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type DepartementTableProps = {
  onClickUpdateDepartment: (department: DepartmentExtended) => void;
  onClickDeleteDepartment: (department: DepartmentExtended) => void;
};

const COLUMNS = [
  {
    key: "code",
    locKey: "department",
  },
] as const;

const DepartementTable: FunctionComponent<DepartementTableProps> = ({
  onClickUpdateDepartment,
  onClickDeleteDepartment,
}) => {
  const { t } = useTranslation();

  const user = useUser();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<DepartmentsOrderBy>({
    orderBy: "code",
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/departments",
    queryKeyPrefix: "departmentTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getDepartmentsExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: DepartmentsOrderBy) => {
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
                active={orderBy === "nbCommunes"}
                direction={orderBy === "nbCommunes" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("nbCommunes")}
              >
                <span className="first-letter:capitalize">{t("numberOfCities")}</span>
              </TableSortLabel>
            </th>
            <th className="w-32">
              <TableSortLabel
                active={orderBy === "nbLieuxDits"}
                direction={orderBy === "nbLieuxDits" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("nbLieuxDits")}
              >
                <span className="first-letter:capitalize">{t("numberOfLocalities")}</span>
              </TableSortLabel>
            </th>
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
              {page.data.map((department) => {
                const isOwner = user != null && department?.ownerId === user.id;
                return (
                  <tr className="hover:bg-base-200" key={department?.id}>
                    <td>{department.code}</td>
                    <td>{department.townsCount}</td>
                    <td>{department.localitiesCount}</td>
                    <td>{department.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={department.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        canEdit={isOwner || user?.permissions.department.canEdit}
                        disabledDelete={!department.editable || department.townsCount > 0}
                        onEditClicked={() => onClickUpdateDepartment(department)}
                        onDeleteClicked={() => onClickDeleteDepartment(department)}
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

export default DepartementTable;

import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import type { SpeciesClassExtended } from "@ou-ca/common/api/entities/species-class";
import { type ClassesOrderBy, getClassesExtendedResponse } from "@ou-ca/common/api/species-class";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type ClasseTableProps = {
  onClickUpdateSpeciesClass: (speciesClass: SpeciesClassExtended) => void;
  onClickDeleteSpeciesClass: (speciesClass: SpeciesClassExtended) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const ClasseTable: FunctionComponent<ClasseTableProps> = ({ onClickUpdateSpeciesClass, onClickDeleteSpeciesClass }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<ClassesOrderBy>({
    orderBy: "libelle",
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/classes",
    queryKeyPrefix: "speciesClassTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getClassesExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: ClassesOrderBy) => {
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
                active={orderBy === "nbEspeces"}
                direction={orderBy === "nbEspeces" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("nbEspeces")}
              >
                <span className="first-letter:capitalize">{t("numberOfSpecies")}</span>
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
              {page.data.map((classe) => {
                return (
                  <tr className="hover:bg-base-200" key={classe?.id}>
                    <td>{classe.libelle}</td>
                    <td>{classe.speciesCount}</td>
                    <td>{classe.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={classe.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!classe.editable}
                        disabledDelete={!classe.editable || classe.speciesCount > 0}
                        onEditClicked={() => onClickUpdateSpeciesClass(classe)}
                        onDeleteClicked={() => onClickDeleteSpeciesClass(classe)}
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

export default ClasseTable;

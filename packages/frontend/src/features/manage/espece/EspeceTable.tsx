import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import type { SpeciesExtended } from "@ou-ca/common/api/entities/species";
import { type SpeciesOrderBy, getSpeciesExtendedResponse } from "@ou-ca/common/api/species";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type EspeceTableProps = {
  onClickUpdateSpecies: (species: SpeciesExtended) => void;
  onClickDeleteSpecies: (species: SpeciesExtended) => void;
};

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

const EspeceTable: FunctionComponent<EspeceTableProps> = ({ onClickUpdateSpecies, onClickDeleteSpecies }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<SpeciesOrderBy>({
    orderBy: "nomFrancais",
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/species",
    queryKeyPrefix: "speciesTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
      onlyOwnData: false,
    },
    schema: getSpeciesExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: SpeciesOrderBy) => {
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
              {page.data.map((espece) => {
                return (
                  <tr className="hover:bg-base-200" key={espece?.id}>
                    <td>{espece.speciesClass?.libelle}</td>
                    <td>{espece.code}</td>
                    <td>{espece.nomFrancais}</td>
                    <td>{espece.nomLatin}</td>
                    <td>{espece.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={espece.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!espece.editable}
                        disabledDelete={!espece.editable || espece.entriesCount > 0}
                        onEditClicked={() => onClickUpdateSpecies(espece)}
                        onDeleteClicked={() => onClickDeleteSpecies(espece)}
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

export default EspeceTable;

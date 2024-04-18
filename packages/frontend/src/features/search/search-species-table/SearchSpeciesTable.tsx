import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Species } from "@ou-ca/common/api/entities/species";
import type { SpeciesOrderBy } from "@ou-ca/common/api/species";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import SearchSpeciesTableRow from "./SearchSpeciesTableRow";

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
] as const;

type SearchSpeciesTableProps = {
  species: Species[];
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: SpeciesOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: SpeciesOrderBy) => void;
};

const SearchSpeciesTable: FunctionComponent<SearchSpeciesTableProps> = ({
  species,
  handleRequestSort,
  hasNextPage,
  onMoreRequested,
  orderBy,
  sortOrder,
}) => {
  const { t } = useTranslation();

  return (
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
              <span className="first-letter: capitalize">{t("numberOfObservations")}</span>
            </TableSortLabel>
          </th>
        </>
      }
      tableRows={species?.map((oneSpecies) => {
        return <SearchSpeciesTableRow key={oneSpecies.id} species={oneSpecies} />;
      })}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default SearchSpeciesTable;

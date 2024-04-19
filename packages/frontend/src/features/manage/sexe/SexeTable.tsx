import type { EntitiesWithLabelOrderBy, SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Sex } from "@ou-ca/common/api/entities/sex";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import SexTableRow from "./SexTableRow";

type SexeTableProps = {
  sexes: Sex[] | undefined;
  onClickUpdateSex: (sex: Sex) => void;
  onClickDeleteSex: (sex: Sex) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: EntitiesWithLabelOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: EntitiesWithLabelOrderBy) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
] as const;

const SexeTable: FunctionComponent<SexeTableProps> = ({
  sexes,
  onClickUpdateSex,
  onClickDeleteSex,
  hasNextPage,
  onMoreRequested,
  orderBy,
  sortOrder,
  handleRequestSort,
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
      tableRows={sexes?.map((sex) => (
        <SexTableRow sex={sex} key={sex.id} onEditClicked={onClickUpdateSex} onDeleteClicked={onClickDeleteSex} />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default SexeTable;

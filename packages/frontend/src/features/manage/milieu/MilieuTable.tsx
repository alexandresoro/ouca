import type { SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Environment } from "@ou-ca/common/api/entities/environment";
import type { EnvironmentsOrderBy } from "@ou-ca/common/api/environment";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import EnvironmentTableRow from "./EnvironmentTableRow";

type MilieuTableProps = {
  environments: Environment[] | undefined;
  onClickUpdateEnvironment: (environment: Environment) => void;
  onClickDeleteEnvironment: (environment: Environment) => void;
  hasNextPage?: boolean;
  onMoreRequested?: () => void;
  orderBy: EnvironmentsOrderBy | undefined;
  sortOrder: SortOrder;
  handleRequestSort: (sortingColumn: EnvironmentsOrderBy) => void;
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

const MilieuTable: FunctionComponent<MilieuTableProps> = ({
  environments,
  onClickUpdateEnvironment,
  onClickDeleteEnvironment,
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
      tableRows={environments?.map((environment) => (
        <EnvironmentTableRow
          key={environment.id}
          environment={environment}
          onEditClicked={onClickUpdateEnvironment}
          onDeleteClicked={onClickDeleteEnvironment}
        />
      ))}
      enableScroll={hasNextPage}
      onMoreRequested={onMoreRequested}
    />
  );
};

export default MilieuTable;

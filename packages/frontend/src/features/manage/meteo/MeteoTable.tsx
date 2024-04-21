import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import type { EntitiesWithLabelOrderBy, SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { Weather } from "@ou-ca/common/api/entities/weather";
import { Cloud, Wind } from "@styled-icons/boxicons-regular";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import WeatherTableRow from "./WeatherTableRow";

type MeteoTableProps = {
  weathers: Weather[] | undefined;
  onClickUpdateWeather: (weather: Weather) => void;
  onClickDeleteWeather: (weather: Weather) => void;
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

const MeteoTable: FunctionComponent<MeteoTableProps> = ({
  weathers,
  onClickUpdateWeather,
  onClickDeleteWeather,
  hasNextPage,
  onMoreRequested,
  orderBy,
  sortOrder,
  handleRequestSort,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col gap-2">
        <div role="alert" className="alert bg-info-content border-none">
          <Cloud className="h-6 w-6" />
          {t("weather.cloudCoverLegend")}
        </div>
        <div role="alert" className="alert bg-info-content border-none">
          <Wind className="h-6 w-6" />
          {t("weather.windLegend")}
        </div>
      </div>

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
        tableRows={weathers?.map((weather) => (
          <WeatherTableRow
            key={weather.id}
            weather={weather}
            onEditClicked={onClickUpdateWeather}
            onDeleteClicked={onClickDeleteWeather}
          />
        ))}
        enableScroll={hasNextPage}
        onMoreRequested={onMoreRequested}
      />
    </>
  );
};

export default MeteoTable;

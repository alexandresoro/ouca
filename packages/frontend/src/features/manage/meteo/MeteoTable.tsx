import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import type { EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import type { WeatherExtended } from "@ou-ca/common/api/entities/weather";
import { getWeathersExtendedResponse } from "@ou-ca/common/api/weather";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type MeteoTableProps = {
  onClickUpdateWeather: (weather: WeatherExtended) => void;
  onClickDeleteWeather: (weather: WeatherExtended) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const MeteoTable: FunctionComponent<MeteoTableProps> = ({ onClickUpdateWeather, onClickDeleteWeather }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>({ orderBy: "libelle" });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/weathers",
    queryKeyPrefix: "weatherTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getWeathersExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: EntitiesWithLabelOrderBy) => {
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
              {page.data.map((meteo) => {
                return (
                  <tr className="hover:bg-base-200" key={meteo?.id}>
                    <td>{meteo.libelle}</td>
                    <td>{meteo.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={meteo.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        disabledEdit={!meteo.editable}
                        disabledDelete={!meteo.editable}
                        onEditClicked={() => onClickUpdateWeather(meteo)}
                        onDeleteClicked={() => onClickDeleteWeather(meteo)}
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

export default MeteoTable;

import type { Town } from "@ou-ca/common/api/entities/town";
import { type TownsOrderBy, getTownsExtendedResponse } from "@ou-ca/common/api/town";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TownTableRow from "./TownTableRow";

type CommuneTableProps = {
  onClickUpdateTown: (town: Town) => void;
  onClickDeleteTown: (town: Town) => void;
};

const CommuneTable: FunctionComponent<CommuneTableProps> = ({ onClickUpdateTown, onClickDeleteTown }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<TownsOrderBy>({
    orderBy: "nom",
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/towns",
    queryKeyPrefix: "townTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getTownsExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: TownsOrderBy) => {
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
            <th>
              <TableSortLabel
                active={orderBy === "departement"}
                direction={orderBy === "departement" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("departement")}
              >
                {t("department")}
              </TableSortLabel>
            </th>
            <th>
              <TableSortLabel
                active={orderBy === "code"}
                direction={orderBy === "code" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("code")}
              >
                {t("code")}
              </TableSortLabel>
            </th>
            <th>
              <TableSortLabel
                active={orderBy === "nom"}
                direction={orderBy === "nom" ? sortOrder : "asc"}
                onClick={() => handleRequestSort("nom")}
              >
                {t("name")}
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
            <th className="w-32 first-letter:capitalize">{t("owner")}</th>
            <th align="center" className="w-32">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((town) => (
                <TownTableRow
                  key={town.id}
                  town={town}
                  onEditClicked={onClickUpdateTown}
                  onDeleteClicked={onClickDeleteTown}
                />
              ))}
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={fetchNextPage}
      />
    </>
  );
};

export default CommuneTable;

import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { NumberEstimateExtended } from "@ou-ca/common/api/entities/number-estimate";
import { type NumberEstimatesOrderBy, getNumberEstimatesExtendedResponse } from "@ou-ca/common/api/number-estimate";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type EstimationNombreTableProps = {
  onClickUpdateNumberEstimate: (numberEstimate: NumberEstimateExtended) => void;
  onClickDeleteNumberEstimate: (numberEstimate: NumberEstimateExtended) => void;
};

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nonCompte",
    locKey: "undefinedNumber",
  },
] as const;

const EstimationNombreTable: FunctionComponent<EstimationNombreTableProps> = ({
  onClickUpdateNumberEstimate,
  onClickDeleteNumberEstimate,
}) => {
  const { t } = useTranslation();

  const user = useUser();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<NumberEstimatesOrderBy>(
    { orderBy: "libelle" },
  );

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/number-estimates",
    queryKeyPrefix: "numberEstimateTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getNumberEstimatesExtendedResponse,
  });

  const handleRequestSort = (sortingColumn: NumberEstimatesOrderBy) => {
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
              {page.data.map((numberEstimate) => {
                const isOwner = user != null && numberEstimate?.ownerId === user.id;
                return (
                  <tr className="hover:bg-base-200" key={numberEstimate?.id}>
                    <td>{numberEstimate.libelle}</td>
                    <td>{numberEstimate.nonCompte ? "Oui" : ""}</td>
                    <td>{numberEstimate.entriesCount}</td>
                    <td align="center" className="w-32">
                      <AvatarWithUniqueNameAvatar input={numberEstimate.ownerId} />
                    </td>
                    <td align="center" className="w-32">
                      <TableCellActionButtons
                        canEdit={isOwner || user?.permissions.numberEstimate.canEdit}
                        disabledDelete={!numberEstimate.editable || numberEstimate.entriesCount > 0}
                        onEditClicked={() => onClickUpdateNumberEstimate(numberEstimate)}
                        onDeleteClicked={() => onClickDeleteNumberEstimate(numberEstimate)}
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

export default EstimationNombreTable;

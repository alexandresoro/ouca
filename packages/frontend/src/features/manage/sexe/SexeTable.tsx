import { type EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { getSexesExtendedResponse } from "@ou-ca/common/api/sex";
import { type SexExtended } from "@ou-ca/common/entities/sex";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InfiniteTable from "../../../components/base/table/InfiniteTable";
import TableSortLabel from "../../../components/base/table/TableSortLabel";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import usePaginationParams from "../../../hooks/usePaginationParams";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type SexeTableProps = {
  onClickUpdateSex: (sex: SexExtended) => void;
  onClickDeleteSex: (sex: SexExtended) => void;
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

const SexeTable: FunctionComponent<SexeTableProps> = ({ onClickUpdateSex, onClickDeleteSex }) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>();

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    path: "/sexes",
    queryKeyPrefix: "sexTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getSexesExtendedResponse,
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
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((sexe) => {
                return (
                  <tr className="hover:bg-base-200" key={sexe?.id}>
                    <td>{sexe?.libelle}</td>
                    <td>{sexe?.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabledEdit={!sexe.editable}
                        disabledDelete={!sexe.editable || sexe.entriesCount > 0}
                        onEditClicked={() => onClickUpdateSex(sexe)}
                        onDeleteClicked={() => onClickDeleteSex(sexe)}
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

export default SexeTable;

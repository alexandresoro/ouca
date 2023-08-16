import { getDepartmentsExtendedResponse, type DepartmentsOrderBy } from "@ou-ca/common/api/department";
import { type DepartmentExtended } from "@ou-ca/common/entities/department";
import { Fragment, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginationParams from "../../../hooks/usePaginationParams";
import useSnackbar from "../../../hooks/useSnackbar";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

type DepartementTableProps = {
  onClickUpdateDepartment: (id: string) => void;
  onClickDeleteDepartment: (department: DepartmentExtended) => void;
};

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nbCommunes",
    locKey: "numberOfCities",
  },
  {
    key: "nbLieuxDits",
    locKey: "numberOfLocalities",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const DepartementTable: FunctionComponent<DepartementTableProps> = ({
  onClickUpdateDepartment,
  onClickDeleteDepartment,
}) => {
  const { t } = useTranslation();

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<DepartmentsOrderBy>();

  const [dialogDepartement, setDialogDepartement] = useState<DepartmentExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery({
    path: "/departments",
    queryKeyPrefix: "departmentTable",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getDepartmentsExtendedResponse,
  });

  const { mutate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await refetch();
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { displayNotification } = useSnackbar();

  const handleDeleteDepartement = (departement: DepartmentExtended | null) => {
    if (departement) {
      setDialogDepartement(departement);
    }
  };

  const handleDeleteDepartementConfirmation = (departement: DepartmentExtended | null) => {
    if (departement) {
      setDialogDepartement(null);
      mutate({ path: `/departments/${departement.id}` });
    }
  };

  const handleRequestSort = (sortingColumn: DepartmentsOrderBy) => {
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
              {page.data.map((departement) => {
                return (
                  <tr className="hover:bg-base-200" key={departement?.id}>
                    <td>{departement.code}</td>
                    <td>{departement.townsCount}</td>
                    <td>{departement.localitiesCount}</td>
                    <td>{departement.entriesCount}</td>
                    <td align="right" className="pr-6">
                      <TableCellActionButtons
                        disabled={!departement.editable}
                        onEditClicked={() => onClickUpdateDepartment(departement?.id)}
                        onDeleteClicked={() => handleDeleteDepartement(departement)}
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
      <DeletionConfirmationDialog
        open={!!dialogDepartement}
        messageContent={t("deleteDepartmentDialogMsg", {
          code: dialogDepartement?.code,
        })}
        impactedItemsMessage={t("deleteDepartmentDialogMsgImpactedData", {
          nbOfObservations: dialogDepartement?.entriesCount ?? 0,
          nbOfCities: dialogDepartement?.townsCount ?? 0,
          nbOfLocalities: dialogDepartement?.localitiesCount ?? 0,
        })}
        onCancelAction={() => setDialogDepartement(null)}
        onConfirmAction={() => handleDeleteDepartementConfirmation(dialogDepartement)}
      />
    </>
  );
};

export default DepartementTable;

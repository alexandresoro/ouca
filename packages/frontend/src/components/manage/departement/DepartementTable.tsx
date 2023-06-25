import { getDepartmentsExtendedResponse } from "@ou-ca/common/api/department";
import { type DepartmentExtended } from "@ou-ca/common/entities/department";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type DepartementsOrderBy } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

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

const DepartementTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<DepartementsOrderBy>();

  const [dialogDepartement, setDialogDepartement] = useState<DepartmentExtended | null>(null);

  const { data, refetch } = useApiQuery(
    {
      path: "/departments",
      queryParams: {
        q: query,
        pageNumber: page,
        pageSize: rowsPerPage,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getDepartmentsExtendedResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

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

  const handleEditDepartement = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: DepartementsOrderBy) => {
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
        count={data?.meta.count}
      />
      <Table
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
        tableRows={data?.data.map((departement) => {
          return (
            <tr className="hover:bg-base-200" key={departement?.id}>
              <td>{departement.code}</td>
              <td>{departement.townsCount}</td>
              <td>{departement.localitiesCount}</td>
              <td>{departement.entriesCount}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!departement.editable}
                  onEditClicked={() => handleEditDepartement(departement?.id)}
                  onDeleteClicked={() => handleDeleteDepartement(departement)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.meta.count ?? 0}
        onPageChange={handleChangePage}
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

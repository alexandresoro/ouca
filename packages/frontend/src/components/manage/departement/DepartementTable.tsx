import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { type Departement, type DepartementsOrderBy } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { PAGINATED_DEPARTEMENTS_QUERY } from "./DepartementManageQueries";

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

  const [dialogDepartement, setDialogDepartement] = useState<Departement | null>(null);

  const [{ data }, reexecuteDepartements] = useQuery({
    query: PAGINATED_DEPARTEMENTS_QUERY,
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
        q: query,
      },
      orderBy,
      sortOrder,
    },
  });

  const { mutate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: () => {
        reexecuteDepartements();
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

  const handleEditDepartement = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteDepartement = (departement: Departement | null) => {
    if (departement) {
      setDialogDepartement(departement);
    }
  };

  const handleDeleteDepartementConfirmation = (departement: Departement | null) => {
    if (departement) {
      setDialogDepartement(null);
      mutate({ path: `/department/${departement.id}` });
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
        count={data?.departements?.count}
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
        tableRows={data?.departements?.data?.map((departement) => {
          return (
            <tr className="hover" key={departement?.id}>
              <td>{departement?.code}</td>
              <td>{departement?.nbCommunes}</td>
              <td>{departement?.nbLieuxDits}</td>
              <td>{departement?.nbDonnees}</td>
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
        count={data?.departements?.count ?? 0}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogDepartement}
        messageContent={t("deleteDepartmentDialogMsg", {
          code: dialogDepartement?.code,
        })}
        impactedItemsMessage={t("deleteDepartmentDialogMsgImpactedData", {
          nbOfObservations: dialogDepartement?.nbDonnees ?? 0,
          nbOfCities: dialogDepartement?.nbCommunes ?? 0,
          nbOfLocalities: dialogDepartement?.nbLieuxDits ?? 0,
        })}
        onCancelAction={() => setDialogDepartement(null)}
        onConfirmAction={() => handleDeleteDepartementConfirmation(dialogDepartement)}
      />
    </>
  );
};

export default DepartementTable;

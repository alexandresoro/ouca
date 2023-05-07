import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { type Commune, type CommunesOrderBy } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { PAGINATED_COMMUNES_QUERY } from "./CommuneManageQueries";

const COLUMNS = [
  {
    key: "departement",
    locKey: "department",
  },
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nom",
    locKey: "name",
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

const CommuneTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<CommunesOrderBy>();

  const [dialogCommune, setDialogCommune] = useState<Commune | null>(null);

  const [{ data }, reexecuteCommunes] = useQuery({
    query: PAGINATED_COMMUNES_QUERY,
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
        reexecuteCommunes();
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

  const handleEditCommune = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteCommune = (commune: Commune | null) => {
    if (commune) {
      setDialogCommune(commune);
    }
  };

  const handleDeleteCommuneConfirmation = (commune: Commune | null) => {
    if (commune) {
      setDialogCommune(null);
      mutate({ path: `/town/${commune.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: CommunesOrderBy) => {
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
        count={data?.communes?.count}
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
        tableRows={data?.communes?.data?.map((commune) => {
          return (
            <tr className="hover" key={commune?.id}>
              <td>{commune?.departement?.code}</td>
              <td>{commune?.code}</td>
              <td>{commune?.nom}</td>
              <td>{commune?.nbLieuxDits}</td>
              <td>{commune?.nbDonnees}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!commune.editable}
                  onEditClicked={() => handleEditCommune(commune?.id)}
                  onDeleteClicked={() => handleDeleteCommune(commune)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.communes?.count ?? 0}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogCommune}
        messageContent={t("deleteCityDialogMsg", {
          name: dialogCommune?.nom,
          department: dialogCommune?.departement?.code,
        })}
        impactedItemsMessage={t("deleteCityDialogMsgImpactedData", {
          nbOfObservations: dialogCommune?.nbDonnees ?? 0,
          nbOfLocalities: dialogCommune?.nbLieuxDits ?? 0,
        })}
        onCancelAction={() => setDialogCommune(null)}
        onConfirmAction={() => handleDeleteCommuneConfirmation(dialogCommune)}
      />
    </>
  );
};

export default CommuneTable;

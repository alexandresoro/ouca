import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { type Espece, type EspecesOrderBy } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { PAGINATED_ESPECES_QUERY } from "./EspeceManageQueries";

const COLUMNS = [
  {
    key: "nomClasse",
    locKey: "speciesClass",
  },
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nomFrancais",
    locKey: "localizedName",
  },
  {
    key: "nomLatin",
    locKey: "scientificName",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const EspeceTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EspecesOrderBy>();

  const [dialogEspece, setDialogEspece] = useState<Espece | null>(null);

  const [{ data }, reexecuteEspeces] = useQuery({
    query: PAGINATED_ESPECES_QUERY,
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
        reexecuteEspeces();
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

  const handleEditEspece = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEspece = (espece: Espece | null) => {
    if (espece) {
      setDialogEspece(espece);
    }
  };

  const handleDeleteEspeceConfirmation = (espece: Espece | null) => {
    if (espece) {
      setDialogEspece(null);
      mutate({ path: `/species/${espece.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EspecesOrderBy) => {
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
        count={data?.especes?.count}
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
        tableRows={data?.especes?.data?.map((espece) => {
          return (
            <tr className="hover:bg-base-200" key={espece?.id}>
              <td>{espece?.classe?.libelle}</td>
              <td>{espece?.code}</td>
              <td>{espece?.nomFrancais}</td>
              <td>{espece?.nomLatin}</td>
              <td>{espece?.nbDonnees ? espece?.nbDonnees : "0"}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!espece.editable}
                  onEditClicked={() => handleEditEspece(espece?.id)}
                  onDeleteClicked={() => handleDeleteEspece(espece)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.especes?.count ?? 0}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogEspece}
        messageContent={t("deleteSpeciesDialogMsg", {
          name: dialogEspece?.nomFrancais,
          code: dialogEspece?.code,
        })}
        impactedItemsMessage={t("deleteSpeciesDialogMsgImpactedData", {
          nbOfObservations: dialogEspece?.nbDonnees ? dialogEspece?.nbDonnees : 0,
        })}
        onCancelAction={() => setDialogEspece(null)}
        onConfirmAction={() => handleDeleteEspeceConfirmation(dialogEspece)}
      />
    </>
  );
};

export default EspeceTable;

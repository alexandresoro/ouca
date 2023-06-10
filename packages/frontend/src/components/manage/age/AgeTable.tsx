import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { type Age, type EntitesAvecLibelleOrderBy } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { PAGINATED_AGES_QUERY } from "./AgeManageQueries";

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

const AgeTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogAge, setDialogAge] = useState<Age | null>(null);

  const [{ data }, reexecuteAges] = useQuery({
    query: PAGINATED_AGES_QUERY,
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
        reexecuteAges();
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

  const handleEditAge = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteAge = (age: Age | null) => {
    if (age) {
      setDialogAge(age);
    }
  };

  const handleDeleteAgeConfirmation = (age: Age | null) => {
    if (age) {
      setDialogAge(null);
      mutate({ path: `/ages/${age.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EntitesAvecLibelleOrderBy) => {
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
        count={data?.ages?.count}
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
        tableRows={data?.ages?.data?.map((age) => {
          return (
            <tr className="hover:bg-base-200" key={age?.id}>
              <td>{age?.libelle}</td>
              <td>{age?.nbDonnees}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!age.editable}
                  onEditClicked={() => handleEditAge(age?.id)}
                  onDeleteClicked={() => handleDeleteAge(age)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.ages?.count}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogAge}
        messageContent={t("deleteAgeDialogMsg", {
          name: dialogAge?.libelle,
        })}
        impactedItemsMessage={t("deleteAgeDialogMsgImpactedData", {
          nbOfObservations: dialogAge?.nbDonnees ?? 0,
        })}
        onCancelAction={() => setDialogAge(null)}
        onConfirmAction={() => handleDeleteAgeConfirmation(dialogAge)}
      />
    </>
  );
};

export default AgeTable;

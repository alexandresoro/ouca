import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { type LieuDit, type LieuxDitsOrderBy } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { PAGINATED_LIEUX_DITS_QUERY } from "./LieuDitManageQueries";

const COLUMNS = [
  {
    key: "departement",
    locKey: "department",
  },
  {
    key: "codeCommune",
    locKey: "townCode",
  },
  {
    key: "nomCommune",
    locKey: "townName",
  },
  {
    key: "nom",
    locKey: "name",
  },
  {
    key: "latitude",
    locKey: "latitude",
  },
  {
    key: "longitude",
    locKey: "longitude",
  },
  {
    key: "altitude",
    locKey: "altitude",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const LieuDitTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<LieuxDitsOrderBy>();

  const [dialogLieuDit, setDialogLieuDit] = useState<Pick<LieuDit, "id" | "nom" | "commune" | "nbDonnees"> | null>(
    null
  );

  const [{ data }, reexecuteLieuxDits] = useQuery({
    query: PAGINATED_LIEUX_DITS_QUERY,
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
        reexecuteLieuxDits();
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

  const handleEditLieuDit = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteLieuDit = (lieuDit: Pick<LieuDit, "id" | "nom" | "commune" | "nbDonnees"> | null) => {
    if (lieuDit) {
      setDialogLieuDit(lieuDit);
    }
  };

  const handleDeleteLieuDitConfirmation = (lieuDit: Pick<LieuDit, "id"> | null) => {
    if (lieuDit) {
      setDialogLieuDit(null);
      mutate({ path: `/localities/${lieuDit.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: LieuxDitsOrderBy) => {
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
        count={data?.lieuxDits?.count}
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
        tableRows={data?.lieuxDits?.data?.map((lieuDit) => {
          return (
            <tr className="hover:bg-base-200" key={lieuDit?.id}>
              <td>{lieuDit?.commune?.departement?.code}</td>
              <td>{lieuDit?.commune?.code}</td>
              <td>{lieuDit?.commune?.nom}</td>
              <td>{lieuDit?.nom}</td>
              <td>{lieuDit?.latitude}</td>
              <td>{lieuDit?.longitude}</td>
              <td>{lieuDit?.altitude}</td>
              <td>{lieuDit?.nbDonnees}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!lieuDit.editable}
                  onEditClicked={() => handleEditLieuDit(lieuDit?.id)}
                  onDeleteClicked={() => handleDeleteLieuDit(lieuDit)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.lieuxDits?.count ?? 0}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogLieuDit}
        messageContent={t("deleteLieuDitDialogMsg", {
          name: dialogLieuDit?.nom,
          city: dialogLieuDit?.commune?.nom,
          department: dialogLieuDit?.commune?.departement?.code,
        })}
        impactedItemsMessage={t("deleteLieuDitDialogMsgImpactedData", {
          nbOfObservations: dialogLieuDit?.nbDonnees ?? 0,
        })}
        onCancelAction={() => setDialogLieuDit(null)}
        onConfirmAction={() => handleDeleteLieuDitConfirmation(dialogLieuDit)}
      />
    </>
  );
};

export default LieuDitTable;

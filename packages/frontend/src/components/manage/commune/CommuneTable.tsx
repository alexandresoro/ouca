import { getTownsExtendedResponse, type TownsOrderBy } from "@ou-ca/common/api/town";
import { type TownExtended } from "@ou-ca/common/entities/town";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
    usePaginatedTableParams<TownsOrderBy>();

  const [dialogCommune, setDialogCommune] = useState<TownExtended | null>(null);

  const { data, refetch } = useApiQuery(
    {
      path: "/towns",
      queryParams: {
        q: query,
        pageNumber: page,
        pageSize: rowsPerPage,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getTownsExtendedResponse,
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

  const handleEditCommune = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteCommune = (commune: TownExtended | null) => {
    if (commune) {
      setDialogCommune(commune);
    }
  };

  const handleDeleteCommuneConfirmation = (commune: TownExtended | null) => {
    if (commune) {
      setDialogCommune(null);
      mutate({ path: `/towns/${commune.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

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
        tableRows={data?.data.map((commune) => {
          return (
            <tr className="hover:bg-base-200" key={commune?.id}>
              <td>{commune.departmentCode}</td>
              <td>{commune.code}</td>
              <td>{commune.nom}</td>
              <td>{commune.localitiesCount}</td>
              <td>{commune.entriesCount}</td>
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
        count={data?.meta.count ?? 0}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogCommune}
        messageContent={t("deleteCityDialogMsg", {
          name: dialogCommune?.nom,
          department: dialogCommune?.departmentCode,
        })}
        impactedItemsMessage={t("deleteCityDialogMsgImpactedData", {
          nbOfObservations: dialogCommune?.entriesCount ?? 0,
          nbOfLocalities: dialogCommune?.localitiesCount ?? 0,
        })}
        onCancelAction={() => setDialogCommune(null)}
        onConfirmAction={() => handleDeleteCommuneConfirmation(dialogCommune)}
      />
    </>
  );
};

export default CommuneTable;

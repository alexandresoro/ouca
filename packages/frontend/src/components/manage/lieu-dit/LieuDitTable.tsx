import { getLocalitiesExtendedResponse, type LocalitiesOrderBy } from "@ou-ca/common/api/locality";
import { type LocalityExtended } from "@ou-ca/common/entities/locality";
import { Fragment, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginationParams from "../../../hooks/usePaginationParams";
import useSnackbar from "../../../hooks/useSnackbar";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
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

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<LocalitiesOrderBy>();

  const [dialogLieuDit, setDialogLieuDit] = useState<LocalityExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery(
    {
      path: "/localities",
      queryParams: {
        q: query,
        pageSize: 10,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getLocalitiesExtendedResponse,
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

  const handleEditLieuDit = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteLieuDit = (lieuDit: LocalityExtended | null) => {
    if (lieuDit) {
      setDialogLieuDit(lieuDit);
    }
  };

  const handleDeleteLieuDitConfirmation = (lieuDit: Pick<LocalityExtended, "id"> | null) => {
    if (lieuDit) {
      setDialogLieuDit(null);
      mutate({ path: `/localities/${lieuDit.id}` });
    }
  };

  const handleRequestSort = (sortingColumn: LocalitiesOrderBy) => {
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
              {page.data.map((lieuDit) => {
                return (
                  <tr className="hover:bg-base-200" key={lieuDit?.id}>
                    <td>{lieuDit.departmentCode}</td>
                    <td>{lieuDit.townCode}</td>
                    <td>{lieuDit.townName}</td>
                    <td>{lieuDit.nom}</td>
                    <td>{lieuDit.coordinates.latitude}</td>
                    <td>{lieuDit.coordinates.longitude}</td>
                    <td>{lieuDit.coordinates.altitude}</td>
                    <td>{lieuDit.entriesCount}</td>
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
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={() => fetchNextPage()}
      />
      <DeletionConfirmationDialog
        open={!!dialogLieuDit}
        messageContent={t("deleteLieuDitDialogMsg", {
          name: dialogLieuDit?.nom,
          city: dialogLieuDit?.townName,
          department: dialogLieuDit?.departmentCode,
        })}
        impactedItemsMessage={t("deleteLieuDitDialogMsgImpactedData", {
          nbOfObservations: dialogLieuDit?.entriesCount ?? 0,
        })}
        onCancelAction={() => setDialogLieuDit(null)}
        onConfirmAction={() => handleDeleteLieuDitConfirmation(dialogLieuDit)}
      />
    </>
  );
};

export default LieuDitTable;

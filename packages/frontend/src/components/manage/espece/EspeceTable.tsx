import { getSpeciesExtendedResponse, type SpeciesOrderBy } from "@ou-ca/common/api/species";
import { type SpeciesExtended } from "@ou-ca/common/entities/species";
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

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<SpeciesOrderBy>();

  const [dialogEspece, setDialogEspece] = useState<SpeciesExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery(
    {
      path: "/species",
      queryParams: {
        q: query,
        pageSize: 10,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getSpeciesExtendedResponse,
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

  const handleEditEspece = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEspece = (espece: SpeciesExtended | null) => {
    if (espece) {
      setDialogEspece(espece);
    }
  };

  const handleDeleteEspeceConfirmation = (espece: SpeciesExtended | null) => {
    if (espece) {
      setDialogEspece(null);
      mutate({ path: `/species/${espece.id}` });
    }
  };

  const handleRequestSort = (sortingColumn: SpeciesOrderBy) => {
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
              {page.data.map((espece) => {
                return (
                  <tr className="hover:bg-base-200" key={espece?.id}>
                    <td>{espece.speciesClassName}</td>
                    <td>{espece.code}</td>
                    <td>{espece.nomFrancais}</td>
                    <td>{espece.nomLatin}</td>
                    <td>{espece.entriesCount}</td>
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
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={() => fetchNextPage()}
      />
      <DeletionConfirmationDialog
        open={!!dialogEspece}
        messageContent={t("deleteSpeciesDialogMsg", {
          name: dialogEspece?.nomFrancais,
          code: dialogEspece?.code,
        })}
        impactedItemsMessage={t("deleteSpeciesDialogMsgImpactedData", {
          nbOfObservations: dialogEspece?.entriesCount ?? 0,
        })}
        onCancelAction={() => setDialogEspece(null)}
        onConfirmAction={() => handleDeleteEspeceConfirmation(dialogEspece)}
      />
    </>
  );
};

export default EspeceTable;

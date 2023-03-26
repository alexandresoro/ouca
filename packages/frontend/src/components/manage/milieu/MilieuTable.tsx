import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type Milieu, type MilieuxOrderBy } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { DELETE_MILIEU, PAGINATED_MILIEUX_QUERY } from "./MilieuManageQueries";

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const MilieuTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<MilieuxOrderBy>();

  const [dialogMilieu, setDialogMilieu] = useState<Milieu | null>(null);

  const [{ data }, reexecuteMilieux] = useQuery({
    query: PAGINATED_MILIEUX_QUERY,
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

  const [_, deleteMilieu] = useMutation(DELETE_MILIEU);

  const { displayNotification } = useSnackbar();

  const handleEditMilieu = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteMilieu = (milieu: Milieu | null) => {
    if (milieu) {
      setDialogMilieu(milieu);
    }
  };

  const handleDeleteMilieuConfirmation = (milieu: Milieu | null) => {
    if (milieu) {
      setDialogMilieu(null);
      deleteMilieu({
        id: milieu.id,
      })
        .then(({ data, error }) => {
          reexecuteMilieux();
          if (!error && data?.deleteMilieu) {
            displayNotification({
              type: "success",
              message: t("deleteConfirmationMessage"),
            });
          } else {
            displayNotification({
              type: "error",
              message: t("deleteErrorMessage"),
            });
          }
        })
        .catch(() => {
          displayNotification({
            type: "error",
            message: t("deleteErrorMessage"),
          });
        });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: MilieuxOrderBy) => {
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
        count={data?.milieux?.count}
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
        tableRows={data?.milieux?.data?.map((milieu) => {
          return (
            <tr className="hover" key={milieu?.id}>
              <td>{milieu?.code}</td>
              <td>{milieu?.libelle}</td>
              <td>{milieu?.nbDonnees}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!milieu.editable}
                  onEditClicked={() => handleEditMilieu(milieu?.id)}
                  onDeleteClicked={() => handleDeleteMilieu(milieu)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.milieux?.count ?? 0}
        onPageChange={handleChangePage}
      ></Table>
      <DeletionConfirmationDialog
        open={!!dialogMilieu}
        messageContent={t("deleteEnvironmentDialogMsg", {
          name: dialogMilieu?.libelle,
        })}
        impactedItemsMessage={t("deleteEnvironmentDialogMsgImpactedData")}
        onCancelAction={() => setDialogMilieu(null)}
        onConfirmAction={() => handleDeleteMilieuConfirmation(dialogMilieu)}
      />
    </>
  );
};

export default MilieuTable;

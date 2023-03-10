import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import { type Comportement, type ComportementsOrderBy } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query ComportementsTable($searchParams: SearchParams, $orderBy: ComportementsOrderBy, $sortOrder: SortOrder) {
    comportements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        libelle
        nicheur
        editable
        nbDonnees
      }
    }
  }
`);

const DELETE = graphql(`
  mutation DeleteComportement($id: Int!) {
    deleteComportement(id: $id)
  }
`);

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
    key: "nicheur",
    locKey: "breeding",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const ComportementTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<ComportementsOrderBy>();

  const [dialogComportement, setDialogComportement] = useState<Comportement | null>(null);

  const [{ data }, reexecuteComportements] = useQuery({
    query: PAGINATED_QUERY,
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

  const [_, deleteComportement] = useMutation(DELETE);

  const { displayNotification } = useSnackbar();

  const handleEditComportement = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteComportement = (comportement: Comportement | null) => {
    if (comportement) {
      setDialogComportement(comportement);
    }
  };

  const handleDeleteComportementConfirmation = (comportement: Comportement | null) => {
    if (comportement) {
      setDialogComportement(null);
      deleteComportement({
        id: comportement.id,
      })
        .then(({ data, error }) => {
          reexecuteComportements();
          if (!error && data?.deleteComportement) {
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

  const handleRequestSort = (sortingColumn: ComportementsOrderBy) => {
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
        count={data?.comportements?.count}
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
            <th align="right">{t("actions")}</th>
          </>
        }
        tableRows={data?.comportements?.data?.map((comportement) => {
          return (
            <tr className="hover" key={comportement?.id}>
              <td>{comportement?.code}</td>
              <td>{comportement?.libelle}</td>
              <td>{comportement?.nicheur ? t(`breedingStatus.${comportement?.nicheur}`) : ""}</td>
              <td>{comportement?.nbDonnees}</td>
              <td align="right">
                <TableCellActionButtons
                  disabled={!comportement.editable}
                  onEditClicked={() => handleEditComportement(comportement?.id)}
                  onDeleteClicked={() => handleDeleteComportement(comportement)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.comportements?.count ?? 0}
        onPageChange={handleChangePage}
      ></Table>
      <DeletionConfirmationDialog
        open={!!dialogComportement}
        messageContent={t("deleteBehaviorDialogMsg", {
          name: dialogComportement?.libelle,
        })}
        impactedItemsMessage={t("deleteBehaviorDialogMsgImpactedData")}
        onCancelAction={() => setDialogComportement(null)}
        onConfirmAction={() => handleDeleteComportementConfirmation(dialogComportement)}
      />
    </>
  );
};

export default ComportementTable;

import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import { type Commune, type CommunesOrderBy } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query CommunesTable($searchParams: SearchParams, $orderBy: CommunesOrderBy, $sortOrder: SortOrder) {
    communes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        departement {
          id
          code
        }
        id
        code
        nom
        editable
        nbLieuxDits
        nbDonnees
      }
    }
  }
`);

const DELETE = graphql(`
  mutation DeleteCommune($id: Int!) {
    deleteCommune(id: $id)
  }
`);

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

  const [_, deleteCommune] = useMutation(DELETE);

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
      deleteCommune({
        id: commune.id,
      })
        .then(({ data, error }) => {
          reexecuteCommunes();
          if (!error && data?.deleteCommune) {
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
            <th align="right">{t("actions")}</th>
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
              <td align="right">
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
      ></Table>
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

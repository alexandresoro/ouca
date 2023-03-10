import { Table, TableBody, TableFooter, TableHead, TablePagination, TableRow } from "@mui/material";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import { type Departement, type DepartementsOrderBy } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query DepartementsTable($searchParams: SearchParams, $orderBy: DepartementsOrderBy, $sortOrder: SortOrder) {
    departements(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        code
        editable
        nbCommunes
        nbLieuxDits
        nbDonnees
      }
    }
  }
`);

const DELETE = graphql(`
  mutation DeleteDepartement($id: Int!) {
    deleteDepartement(id: $id)
  }
`);

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "nbCommunes",
    locKey: "numberOfCities",
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

const DepartementTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<DepartementsOrderBy>();

  const [dialogDepartement, setDialogDepartement] = useState<Departement | null>(null);

  const [{ data }, reexecuteDepartements] = useQuery({
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

  const [_, deleteDepartement] = useMutation(DELETE);

  const { displayNotification } = useSnackbar();

  const handleEditDepartement = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteDepartement = (departement: Departement | null) => {
    if (departement) {
      setDialogDepartement(departement);
    }
  };

  const handleDeleteDepartementConfirmation = (departement: Departement | null) => {
    if (departement) {
      setDialogDepartement(null);
      deleteDepartement({
        id: departement.id,
      })
        .then(({ data, error }) => {
          reexecuteDepartements();
          if (!error && data?.deleteDepartement) {
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

  const handleRequestSort = (sortingColumn: DepartementsOrderBy) => {
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
        count={data?.departements?.count}
      />
      <Table>
        <TableHead>
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
        </TableHead>
        <TableBody>
          {data?.departements?.data?.map((departement) => {
            return (
              <tr className="hover" key={departement?.id}>
                <td>{departement?.code}</td>
                <td>{departement?.nbCommunes}</td>
                <td>{departement?.nbLieuxDits}</td>
                <td>{departement?.nbDonnees}</td>
                <td align="right">
                  <TableCellActionButtons
                    disabled={!departement.editable}
                    onEditClicked={() => handleEditDepartement(departement?.id)}
                    onDeleteClicked={() => handleDeleteDepartement(departement)}
                  />
                </td>
              </tr>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              page={page}
              rowsPerPage={rowsPerPage}
              count={data?.departements?.count ?? 0}
              onPageChange={handleChangePage}
            />
          </TableRow>
        </TableFooter>
      </Table>
      <DeletionConfirmationDialog
        open={!!dialogDepartement}
        messageContent={t("deleteDepartmentDialogMsg", {
          code: dialogDepartement?.code,
        })}
        impactedItemsMessage={t("deleteDepartmentDialogMsgImpactedData", {
          nbOfObservations: dialogDepartement?.nbDonnees ?? 0,
          nbOfCities: dialogDepartement?.nbCommunes ?? 0,
          nbOfLocalities: dialogDepartement?.nbLieuxDits ?? 0,
        })}
        onCancelAction={() => setDialogDepartement(null)}
        onConfirmAction={() => handleDeleteDepartementConfirmation(dialogDepartement)}
      />
    </>
  );
};

export default DepartementTable;

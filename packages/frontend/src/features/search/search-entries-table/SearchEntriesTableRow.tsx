import IconButton from "@components/base/IconButton";
import type { EntryExtended } from "@ou-ca/common/api/entities/entry";
import { Detail, EditAlt, Trash } from "@styled-icons/boxicons-regular";
import { Binoculars } from "@styled-icons/boxicons-solid";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

type SearchEntriesTableRowProps = {
  donnee: EntryExtended;
  onViewAction: () => void;
  onEditAction?: () => void;
  onDeleteAction: () => void;
};

const SearchEntriesTableRow: FunctionComponent<SearchEntriesTableRowProps> = (props) => {
  const { donnee, onViewAction, onEditAction, onDeleteAction } = props;

  const { t } = useTranslation();

  return (
    <>
      <tr className="hover:bg-base-200">
        <td>{donnee.species.nomFrancais}</td>
        <td>{donnee.number}</td>
        <td>
          {donnee.inventory.locality.townName} ({donnee.inventory.locality.departmentCode}),{" "}
          {donnee.inventory.locality.nom}
        </td>
        <td>{new Intl.DateTimeFormat().format(new Date(donnee?.inventory.date))}</td>
        <td align="right" className="flex gap-1 pr-6">
          <div className="tooltip tooltip-bottom" data-tip={t("goToInventory")}>
            <Link
              className="btn btn-circle btn-sm btn-ghost text-primary"
              to={`/inventory/${donnee.inventory.id}`}
              aria-label={t("goToInventory")}
            >
              <Binoculars className="h-5" />
            </Link>
          </div>
          <IconButton
            className="text-primary"
            aria-label={t("observationsTable.header.action.view")}
            onClick={onViewAction}
          >
            <Detail className="h-5" />
          </IconButton>
          <IconButton className="text-primary" aria-label={t("aria-editButton")} onClick={onEditAction}>
            <EditAlt className="h-5" />
          </IconButton>
          <IconButton
            className="text-error"
            aria-label={t("observationsTable.header.action.delete")}
            onClick={onDeleteAction}
          >
            <Trash className="h-5" />
          </IconButton>
        </td>
      </tr>
    </>
  );
};

export default SearchEntriesTableRow;

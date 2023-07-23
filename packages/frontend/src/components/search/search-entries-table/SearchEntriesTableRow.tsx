import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { Detail, Trash } from "@styled-icons/boxicons-regular";
import { intlFormat, parseISO } from "date-fns";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "../../common/styled/IconButton";

type SearchEntriesTableRowProps = {
  donnee: EntryExtended;
  onViewAction: () => void;
  onDeleteAction: () => void;
};

const SearchEntriesTableRow: FunctionComponent<SearchEntriesTableRowProps> = (props) => {
  const { donnee, onViewAction, onDeleteAction } = props;

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
        <td>{intlFormat(parseISO(donnee?.inventory.date))}</td>
        <td>{donnee.inventory.observer.libelle}</td>
        <td align="right" className="pr-6">
          <IconButton
            className="mx-1 text-primary dark:text-white"
            aria-label={t("observationsTable.header.action.view")}
            onClick={onViewAction}
          >
            <Detail className="h-5" />
          </IconButton>
          <IconButton
            className="mx-1 text-accent"
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

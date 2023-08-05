import { type Entry, type EntryExtended } from "@ou-ca/common/entities/entry";
import { CalendarPlus, Detail, EditAlt, MaleSign, Trash } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "../../common/styled/IconButton";

type InventoryPageEntryElementProps = {
  entry: EntryExtended;
  onViewDetailsAction?: (entry: EntryExtended) => void;
  onEditAction?: (entry: Entry) => void;
  onDeleteAction?: (entry: EntryExtended) => void;
};

const InventoryPageEntryElement: FunctionComponent<InventoryPageEntryElementProps> = ({
  entry,
  onViewDetailsAction,
  onEditAction,
  onDeleteAction,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card border-2 border-primary p-4 shadow-md">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex flex-grow items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold">
            <div className="flex flex-grow h-8 w-8 -my-2 px-1 items-center justify-center border border-primary rounded-full">
              <div
                className={`flex flex-grow justify-center ${
                  entry.number != null && entry.number >= 100 ? "text-xs" : "text-base"
                }`}
              >
                {entry.numberEstimate.nonCompte ? "?" : entry.number}
              </div>
            </div>
            <h4 className="text-lg">{entry.species.nomFrancais}</h4>
          </div>
          <div className="flex gap-5">
            <div className="flex items-center text-base gap-1">
              <MaleSign className="h-5 w-5" />
              {entry.sex.libelle}
            </div>
            <div className="flex items-center text-base gap-1">
              <CalendarPlus className="h-5 w-5" />
              {entry.age.libelle}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <IconButton
            className="text-primary"
            aria-label={t("observationsTable.header.action.view")}
            onClick={() => onViewDetailsAction?.(entry)}
          >
            <Detail className="h-5" />
          </IconButton>
          <IconButton className="text-primary" aria-label={t("aria-editButton")} onClick={() => onEditAction?.(entry)}>
            <EditAlt className="h-5" />
          </IconButton>
          <IconButton
            className="text-error"
            aria-label={t("observationsTable.header.action.delete")}
            onClick={() => onDeleteAction?.(entry)}
          >
            <Trash className="h-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default InventoryPageEntryElement;

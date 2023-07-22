import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { Angry, CalendarPlus, Detail, EditAlt, MaleSign, Trash } from "@styled-icons/boxicons-regular";
import { Tree } from "@styled-icons/boxicons-solid";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "../../common/styled/IconButton";

type InventoryPageEntryElementProps = {
  entry: EntryExtended;
  onViewDetailsAction?: (entry: EntryExtended) => void;
  onEditAction?: (entryId: string) => void;
  onDeleteAction?: (entryId: string) => void;
};

const InventoryPageEntryElement: FunctionComponent<InventoryPageEntryElementProps> = ({
  entry,
  onViewDetailsAction,
  onEditAction,
  onDeleteAction,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card border border-primary p-4 bg-base-200 shadow-md">
      <div className="flex gap-10 items-center justify-between">
        <div className="flex flex-grow items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold">
            <div className="w-14 items-start">
              <span className="badge badge-lg badge-primary badge-outline">
                {entry.numberEstimate.nonCompte ? "?" : entry.number}
              </span>
            </div>
            <h4 className="text-xl">{entry.species.nomFrancais}</h4>
          </div>
          <div className="flex gap-5">
            <div className="flex items-center text-lg gap-1">
              <MaleSign className="text-primary h-6 w-6" />
              {entry.sex.libelle}
            </div>
            <div className="flex items-center text-lg gap-1">
              <CalendarPlus className="text-primary h-6 w-6" />
              {entry.age.libelle}
            </div>
            <div className="flex items-center text-lg gap-1">
              <Angry className="text-primary h-6 w-6" />
              {entry.behaviors.length}
            </div>
            <div className="flex items-center text-lg gap-1">
              <Tree className="text-primary h-6 w-6" />
              {entry.environments.length}
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
          <IconButton
            className="text-primary"
            aria-label={t("aria-editButton")}
            onClick={() => onEditAction?.(entry.id)}
          >
            <EditAlt className="h-5" />
          </IconButton>
          <IconButton
            className="text-accent"
            aria-label={t("observationsTable.header.action.delete")}
            onClick={() => onDeleteAction?.(entry.id)}
          >
            <Trash className="h-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default InventoryPageEntryElement;

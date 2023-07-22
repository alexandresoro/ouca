import { Dialog } from "@headlessui/react";
import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { intlFormat, parseISO } from "date-fns";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InventorySummaryPanel from "../../inventory/inventory-summary-panel/InventorySummaryPanel";
import DonneeDetailsView from "../../view/DonneeDetailsView";

type EntryDetailsDialogContainerProps = {
  entry?: EntryExtended;
  open: boolean;
  onClose: (value: boolean) => void;
};

const EntryDetailsDialogContainer: FunctionComponent<EntryDetailsDialogContainerProps> = ({ entry, open, onClose }) => {
  const { t } = useTranslation();

  if (!entry) {
    return null;
  }

  return (
    <Dialog className={`modal ${open ? "modal-open" : ""}`} open={open} onClose={onClose}>
      <Dialog.Panel className="modal-box max-w-7xl">
        <Dialog.Title className="text-2xl font-semibold py-4 first-letter:uppercase">{`${t("observation")} - ${
          entry.species.nomFrancais
        }`}</Dialog.Title>
        <div className="mb-2 text-[13px]">
          {t("observationDetails.mainSubtitle", {
            owner: entry.inventory.observer.libelle,
            creationDate: intlFormat(parseISO(entry.inventory.date)),
            updatedDate: intlFormat(parseISO(entry.inventory.date)),
            inventoryId: entry.inventory.id,
            observationId: entry.id,
          })}
        </div>
        <div className="flex gap-8">
          <div className="basis-2/5">
            <h3 className="text-xl font-normal py-4 first-letter:uppercase">
              {t("observationDetails.inventoryTitle")}
            </h3>
            <InventorySummaryPanel inventory={entry.inventory} />
          </div>
          <div className="basis-3/5">
            <h3 className="text-xl font-normal py-4 first-letter:uppercase">{t("observation")}</h3>
            <DonneeDetailsView donnee={entry} />
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EntryDetailsDialogContainer;

import { Disclosure } from "@headlessui/react";
import type { Entry, EntryExtended } from "@ou-ca/common/api/entities/entry";
import { CalendarPlus, ChevronDown, EditAlt, MaleSign, Trash } from "@styled-icons/boxicons-regular";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "../../../../components/base/IconButton";
import EntrySummaryContent from "../../entry/entry-summary-content/EntrySummaryContent";

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
    <Disclosure as="div" className="card border-2 border-primary shadow-md">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex gap-4 p-4">
            <div className="flex grow gap-16 items-center justify-between">
              <div className="flex flex-grow items-center justify-between">
                <div className="flex items-center gap-2.5 font-semibold">
                  <div className="tooltip tooltip-bottom" data-tip={entry.numberEstimate.libelle}>
                    <div className="flex flex-grow h-8 w-8 -my-2 px-1 items-center justify-center border border-primary rounded-full">
                      <div
                        className={`flex flex-grow justify-center ${
                          entry.number != null && entry.number >= 100 ? "text-xs" : "text-base"
                        }`}
                      >
                        {entry.numberEstimate.nonCompte ? "?" : entry.number}
                      </div>
                    </div>
                  </div>
                  <h4 className="text-lg">{entry.species.nomFrancais}</h4>
                </div>
                <div className="flex gap-5">
                  <div className="tooltip tooltip-bottom" data-tip={t("gender")}>
                    <div className="flex items-center text-base gap-1">
                      <MaleSign className="h-5 w-5" />
                      {entry.sex.libelle}
                    </div>
                  </div>
                  <div className="tooltip tooltip-bottom" data-tip={t("age")}>
                    <div className="flex items-center text-base gap-1">
                      <CalendarPlus className="h-5 w-5" />
                      {entry.age.libelle}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <IconButton
                  className="text-primary"
                  aria-label={t("aria-editButton")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAction?.(entry);
                  }}
                >
                  <EditAlt className="h-5" />
                </IconButton>
                <IconButton
                  className="text-error"
                  aria-label={t("observationsTable.header.action.delete")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAction?.(entry);
                  }}
                >
                  <Trash className="h-5" />
                </IconButton>
              </div>
            </div>
            <ChevronDown
              className={`${open ? "rotate-180 transform" : ""} btn btn-ghost btn-circle btn-sm text-primary`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="text-md pb-4 pt-0">
            <EntrySummaryContent entry={entry} />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default InventoryPageEntryElement;

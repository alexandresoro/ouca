import { Disclosure, Transition } from "@headlessui/react";
import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { ChevronDown, Detail, Trash } from "@styled-icons/boxicons-regular";
import { intlFormat, parseISO } from "date-fns";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "../common/styled/IconButton";
import DonneeDetailsView from "./DonneeDetailsView";
import InventaireDetailsView from "./InventaireDetailsView";

type DonneeRowProps = {
  donnee: EntryExtended;
  onViewAction: () => void;
  onDeleteAction: () => void;
};

const DonneeDetailsRow: FunctionComponent<DonneeRowProps> = (props) => {
  const { donnee, onViewAction, onDeleteAction } = props;

  const { t } = useTranslation();

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <tr className="hover:bg-base-200">
            <td>
              <Disclosure.Button
                className={`btn btn-circle btn-sm btn-ghost transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              >
                <ChevronDown className="h-6" />
              </Disclosure.Button>
            </td>
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

          <Transition
            as="tr"
            enter="transition duration-200 origin-top ease-in-out transform"
            enterFrom="scale-y-0"
            enterTo="scale-y-100"
            leave="transition duration-200 origin-top ease-in-out transform"
            leaveTo="scale-y-0"
          >
            <Disclosure.Panel as="td" className="p-4" colSpan={7}>
              <div className="card border-2 border-primary p-4 bg-base-100 shadow-xl">
                <h2 className="text-2xl font-normal">
                  {t("observationDetails.mainTitle", {
                    speciesName: donnee.species.nomFrancais,
                  })}
                </h2>
                <div className="mt-1 text-[13px]">
                  {t("observationDetails.mainSubtitle", {
                    owner: donnee.inventory.observer.libelle,
                    creationDate: intlFormat(parseISO(donnee.inventory.date)),
                    updatedDate: intlFormat(parseISO(donnee.inventory.date)),
                    inventoryId: donnee.inventory.id,
                    observationId: donnee?.id,
                  })}
                </div>

                <div className="mt-8 flex justify-center items-center flex-col sm:flex-row sm:gap-10 md:gap-16">
                  <div className="flex flex-col flex-auto w-full">
                    <InventaireDetailsView inventaire={donnee.inventory} />
                  </div>

                  <div className="flex flex-col flex-auto w-full">
                    <DonneeDetailsView donnee={donnee} />
                  </div>
                </div>
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};

export default DonneeDetailsRow;

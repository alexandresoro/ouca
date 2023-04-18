import { FilePlus } from "@styled-icons/boxicons-solid";
import { format } from "date-fns";
import { useEffect, useRef, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useClient, useMutation } from "urql";
import useUserSettingsContext from "../../../hooks/useUserSettingsContext";
import InventoryFormDate from "./InventoryFormDate";
import InventoryFormLocation from "./InventoryFormLocation";
import InventoryFormObserver from "./InventoryFormObserver";
import { GET_INVENTAIRE, UPSERT_INVENTAIRE } from "./InventoryFormQueries";
import InventoryFormWeather from "./InventoryFormWeather";
import { type UpsertInventoryInput } from "./inventory-form-types";

type InventoryFormProps = {
  // New inventory (w/ possible existing inventory id as template)
  isNewInventory?: boolean;
  existingInventoryId?: number;
};

const InventoryForm: FunctionComponent<InventoryFormProps> = ({ isNewInventory, existingInventoryId }) => {
  const { t } = useTranslation();

  const observerEl = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Focus on observer on page load if new inventory
    if (isNewInventory) {
      observerEl.current?.focus();
    }
  }, [isNewInventory]);

  const { userSettings } = useUserSettingsContext();

  const defaultFormValues = (
    isNewInventory && existingInventoryId === undefined // Brand new inventory
      ? {
          id: null,
          observer: userSettings.defaultObservateur,
          associateObservers: [],
          date: format(new Date(), "yyyy-MM-dd"),
          time: "",
          duration: "",
          department: userSettings.defaultDepartement,
          town: null,
          customLatitude: "",
          customLongitude: "",
          customAltitude: "",
          temperature: "",
          weathers: [],
        }
      : {}
  ) satisfies Partial<UpsertInventoryInput>;

  const {
    register,
    control,
    formState: { isValid },
    setValue,
    getValues,
    reset,
    handleSubmit,
  } = useForm<UpsertInventoryInput>({
    defaultValues: {
      id: null,
      observer: null,
      associateObservers: [],
      department: null,
      town: null,
      weathers: [],
      ...defaultFormValues,
    },
  });

  const client = useClient();

  const [_, upsertInventory] = useMutation(UPSERT_INVENTAIRE);

  // Initialize with existing inventory
  useEffect(() => {
    if (existingInventoryId != null) {
      client
        .query(GET_INVENTAIRE, { inventoryId: existingInventoryId })
        .toPromise()
        .then(({ data, error }) => {
          if (error || !data?.inventaire) {
            throw new Error(`An error has occurred while retrieving inventory ID=${existingInventoryId}`);
          }

          console.log("RESET WITH EXISTING", {
            inventory: data.inventaire,
          });
          // TODO rework this. Maybe put this outside on form and use values instead?
          reset({
            id: data.inventaire.id,
            observer: data.inventaire.observateur,
            associateObservers: data.inventaire.associes,
            date: data.inventaire.date,
            time: data.inventaire.heure,
            department: data.inventaire.lieuDit.commune.departement,
            town: data.inventaire.lieuDit.commune,
            customLatitude:
              data.inventaire.customizedCoordinates?.latitude != null
                ? `${data.inventaire.customizedCoordinates.latitude}`
                : null,
            customLongitude:
              data.inventaire.customizedCoordinates?.longitude != null
                ? `${data.inventaire.customizedCoordinates.longitude}`
                : null,
            customAltitude:
              data.inventaire.customizedCoordinates?.altitude != null
                ? `${data.inventaire.customizedCoordinates.altitude}`
                : null,
            duration: data.inventaire.duree,
            weathers: data.inventaire.meteos,
          });
        })
        .catch(() => {
          throw new Error(`An error has occurred while retrieving inventory ID=${existingInventoryId}`);
        });
    }
  }, [existingInventoryId, client]);

  const onSubmit: SubmitHandler<UpsertInventoryInput> = (upsertInventoryInput) => {
    console.log(upsertInventoryInput);
  };

  return (
    <>
      <div className="flex justify-between">
        <div
          className="tooltip tooltip-bottom"
          data-tip={existingInventoryId ? `ID ${existingInventoryId}` : undefined}
        >
          <h2 className="text-xl font-semibold mb-3">{t("inventoryForm.title")}</h2>
        </div>
        {!isNewInventory && existingInventoryId && (
          <div className="tooltip tooltip-bottom" data-tip={t("inventoryForm.createNewEntryFromInventory")}>
            <Link
              className="btn btn-sm btn-circle btn-ghost"
              to={`/create/new?${new URLSearchParams({ inventoryId: `${existingInventoryId}` }).toString()}`}
            >
              <FilePlus className="text-primary h-6" />
            </Link>
          </div>
        )}
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
          <InventoryFormObserver
            control={control}
            areAssociesDisplayed={userSettings.areAssociesDisplayed}
            observerInputRef={observerEl}
          />
        </div>
        <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
          <InventoryFormDate register={register} />
        </div>
        <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
          <InventoryFormLocation control={control} register={register} getValues={getValues} setValue={setValue} />
        </div>
        {userSettings.isMeteoDisplayed && (
          <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
            <InventoryFormWeather control={control} register={register} />
          </div>
        )}
        <button type="submit">submit</button>
      </form>
      Valid: {JSON.stringify(isValid)}
    </>
  );
};

export default InventoryForm;

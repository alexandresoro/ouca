import { FilePlus } from "@styled-icons/boxicons-solid";
import { format } from "date-fns";
import { useEffect, useRef, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMutation } from "urql";
import { type GetExistingInventaireQuery } from "../../../gql/graphql";
import useUserSettingsContext from "../../../hooks/useUserSettingsContext";
import InventoryFormDate from "./InventoryFormDate";
import InventoryFormLocation from "./InventoryFormLocation";
import InventoryFormObserver from "./InventoryFormObserver";
import { UPSERT_INVENTAIRE } from "./InventoryFormQueries";
import InventoryFormWeather from "./InventoryFormWeather";
import { type UpsertInventoryInput } from "./inventory-form-types";

type InventoryFormProps = {
  // New inventory (w/ possible existing inventory as template)
  isNewInventory?: boolean;
  existingInventory?: NonNullable<GetExistingInventaireQuery["inventaire"]>;
};

const InventoryForm: FunctionComponent<InventoryFormProps> = ({ isNewInventory, existingInventory }) => {
  const { t } = useTranslation();

  const observerEl = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Focus on observer on page load if new inventory
    if (isNewInventory) {
      // TODO fix case where we click from new and loop
      // observerEl.current?.focus();
    }
  }, [isNewInventory, observerEl]);

  const { userSettings } = useUserSettingsContext();

  const defaultFormValues = (
    existingInventory === undefined
      ? {
          // Brand new inventory
          id: null,
          observer: userSettings.defaultObservateur ?? null,
          associateObservers: [],
          date: format(new Date(), "yyyy-MM-dd"),
          time: "",
          duration: "",
          department: userSettings.defaultDepartement,
          town: null,
          latitude: "",
          longitude: "",
          altitude: "",
          temperature: "",
          weathers: [],
        }
      : {
          // Existing inventory
          id: existingInventory.id,
          observer: existingInventory.observateur,
          associateObservers: existingInventory.associes,
          date: existingInventory.date,
          time: existingInventory.heure ?? "",
          duration: existingInventory.duree ?? "",
          department: existingInventory.lieuDit.commune.departement,
          town: existingInventory.lieuDit.commune,
          latitude:
            existingInventory.customizedCoordinates?.latitude != null
              ? `${existingInventory.customizedCoordinates.latitude}`
              : `${existingInventory.lieuDit.latitude}`,
          longitude:
            existingInventory.customizedCoordinates?.longitude != null
              ? `${existingInventory.customizedCoordinates.longitude}`
              : `${existingInventory.lieuDit.longitude}`,
          altitude:
            existingInventory.customizedCoordinates?.altitude != null
              ? `${existingInventory.customizedCoordinates.altitude}`
              : `${existingInventory.lieuDit.altitude}`,
          temperature: `${existingInventory.temperature ?? ""}`,
          weathers: existingInventory.meteos,
        }
  ) satisfies UpsertInventoryInput;

  const {
    register,
    control,
    formState: { isValid },
    setValue,
    getValues,
    handleSubmit,
  } = useForm<UpsertInventoryInput>({
    defaultValues: defaultFormValues,
  });

  const [_, upsertInventory] = useMutation(UPSERT_INVENTAIRE);

  const onSubmit: SubmitHandler<UpsertInventoryInput> = (upsertInventoryInput) => {
    console.log(upsertInventoryInput);
  };

  console.log("RENDER INVENTORY FORM", existingInventory?.id ?? "new");

  return (
    <>
      <div className="flex justify-between">
        <div className="tooltip tooltip-bottom" data-tip={existingInventory ? `ID ${existingInventory.id}` : undefined}>
          <h2 className="text-xl font-semibold mb-3">{t("inventoryForm.title")}</h2>
        </div>
        {!isNewInventory && existingInventory && (
          <div className="tooltip tooltip-bottom" data-tip={t("inventoryForm.createNewEntryFromInventory")}>
            <Link
              className="btn btn-sm btn-circle btn-ghost"
              to={`/create/new?${new URLSearchParams({ inventoryId: `${existingInventory.id}` }).toString()}`}
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
      <br />
      Valid: {JSON.stringify(isValid)}
    </>
  );
};

export default InventoryForm;

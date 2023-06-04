import { zodResolver } from "@hookform/resolvers/zod";
import {
  upsertInventoryInput,
  type GetInventoryResponse,
  type UpsertInventoryInput,
} from "@ou-ca/common/api/inventory";
import { FilePlus } from "@styled-icons/boxicons-solid";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { type FunctionComponent } from "react";
import { useForm, type DefaultValues, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  inventoryAltitudeAtom,
  inventoryLatitudeAtom,
  inventoryLocalityAtom,
  inventoryLongitudeAtom,
} from "../../../atoms/inventoryFormAtoms";
import useUserSettingsContext from "../../../hooks/useUserSettingsContext";
import InventoryFormDate from "./InventoryFormDate";
import InventoryFormLocation from "./InventoryFormLocation";
import InventoryFormObserver from "./InventoryFormObserver";
import InventoryFormWeather from "./InventoryFormWeather";

type InventoryFormProps = {
  // New inventory (w/ possible existing inventory as template)
  isNewInventory?: boolean;
  existingInventory?: GetInventoryResponse;
};

const InventoryForm: FunctionComponent<InventoryFormProps> = ({ isNewInventory, existingInventory }) => {
  const { t } = useTranslation();

  const { userSettings } = useUserSettingsContext();

  const defaultFormValues = (
    existingInventory === undefined
      ? {
          // Brand new inventory
          observerId: userSettings.defaultObserver?.id,
          associateIds: [],
          date: format(new Date(), "yyyy-MM-dd"),
          time: "",
          duration: "",
          localityId: "",
          coordinates: null,
          temperature: null,
          weatherIds: [],
        }
      : {
          // Existing inventory
          observerId: existingInventory.observer.id,
          associateIds: existingInventory.associates.map((associate) => associate.id),
          date: existingInventory.date,
          time: existingInventory.heure ?? null,
          duration: existingInventory.duree ?? null,
          localityId: existingInventory.locality.id,
          coordinates: existingInventory.customizedCoordinates ?? existingInventory.locality.coordinates,
          temperature: existingInventory.temperature,
          weatherIds: existingInventory.weathers.map((weather) => weather.id),
        }
  ) satisfies DefaultValues<UpsertInventoryInput>;

  const locality = useAtomValue(inventoryLocalityAtom);
  const latitude = useAtomValue(inventoryLatitudeAtom);
  const altitude = useAtomValue(inventoryAltitudeAtom);
  const longitude = useAtomValue(inventoryLongitudeAtom);

  const {
    register,
    control,
    formState: { isValid, isDirty, dirtyFields },
    getFieldState,
    setValue,
    handleSubmit,
  } = useForm<UpsertInventoryInput>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(upsertInventoryInput),
  });

  const onSubmit: SubmitHandler<UpsertInventoryInput> = (upsertInventoryInput) => {
    console.log(upsertInventoryInput);
  };

  return (
    <div
      className={`${isValid ? "" : "bg-red-500 bg-opacity-70"} ${
        isDirty && isValid ? "bg-yellow-500 bg-opacity-70" : ""
      }`}
    >
      DIRTY FIELDS: {JSON.stringify(dirtyFields)}
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
            defaultObserver={existingInventory?.observer ?? userSettings.defaultObserver ?? undefined}
            areAssociesDisplayed={userSettings.areAssociesDisplayed}
            autofocusOnObserver={isNewInventory}
          />
        </div>
        <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
          <InventoryFormDate register={register} />
        </div>
        <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
          <InventoryFormLocation
            control={control}
            register={register}
            setValue={setValue}
            getFieldState={getFieldState}
          />
        </div>
        {userSettings.isMeteoDisplayed && (
          <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
            <InventoryFormWeather control={control} register={register} />
          </div>
        )}
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default InventoryForm;

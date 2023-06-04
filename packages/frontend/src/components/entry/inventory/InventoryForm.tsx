import { zodResolver } from "@hookform/resolvers/zod";
import { upsertInventoryInput, type GetInventoryResponse } from "@ou-ca/common/api/inventory";
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
import { type UpsertInventoryInput } from "./inventory-form-types";

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
          id: null,
          observer: userSettings.defaultObserver
            ? {
                id: parseInt(userSettings.defaultObserver.id),
                libelle: userSettings.defaultObserver.libelle,
                __typename: "Observateur",
              }
            : null,
          associateObservers: [],
          date: format(new Date(), "yyyy-MM-dd"),
          time: "",
          duration: "",
          department: userSettings.defaultDepartment
            ? {
                id: parseInt(userSettings.defaultDepartment.id),
                code: userSettings.defaultDepartment.code,
                __typename: "Departement",
              }
            : null,
          town: null,
          locality: null,
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
          town: {
            // Hacky way to make sure that the objects from defaults and autocomplete are "equal"
            // so that dirty flag is properly computed
            __typename: existingInventory.lieuDit.commune.__typename,
            id: existingInventory.lieuDit.commune.id,
            code: existingInventory.lieuDit.commune.code,
            nom: existingInventory.lieuDit.commune.nom,
          },
          locality: {
            __typename: existingInventory.lieuDit.__typename,
            id: existingInventory.lieuDit.id,
            nom: existingInventory.lieuDit.nom,
            latitude: existingInventory.lieuDit.latitude,
            longitude: existingInventory.lieuDit.longitude,
            altitude: existingInventory.lieuDit.altitude,
            coordinatesSystem: existingInventory.lieuDit.coordinatesSystem,
          },
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

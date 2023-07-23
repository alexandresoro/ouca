import { zodResolver } from "@hookform/resolvers/zod";
import { upsertInventoryInput, type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type Inventory } from "@ou-ca/common/entities/inventory";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { useEffect, useState, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { type InventoryFormState } from "./InventoryFormState";
import InventoryFormWeather from "./InventoryFormWeather";

type InventoryFormProps = {
  initialData?: Inventory | Omit<Inventory, "id">;
  onSubmitForm?: (inventoryFormData: UpsertInventoryInput) => void;
  submitFormText?: string;
  disableIfNoChanges?: boolean;
};

const InventoryForm: FunctionComponent<InventoryFormProps> = ({
  initialData,
  onSubmitForm,
  submitFormText,
  disableIfNoChanges,
}) => {
  const { t } = useTranslation();

  const { userSettings } = useUserSettingsContext();

  const defaultFormValues = (
    initialData === undefined
      ? {
          // Brand new inventory
          observerId: userSettings.defaultObserver?.id ?? null,
          associateIds: [],
          date: format(new Date(), "yyyy-MM-dd"),
          time: null,
          duration: null,
          localityId: null,
          coordinates: {
            latitude: null,
            longitude: null,
            altitude: null,
          },
          temperature: null,
          weatherIds: [],
        }
      : {
          // Existing inventory
          observerId: initialData.observer.id,
          associateIds: initialData.associates.map((associate) => associate.id),
          date: initialData.date,
          time: initialData.heure,
          duration: initialData.duree,
          localityId: initialData.locality.id,
          coordinates: initialData.customizedCoordinates ?? initialData.locality.coordinates,
          temperature: initialData.temperature,
          weatherIds: initialData.weathers.map((weather) => weather.id),
        }
  ) satisfies InventoryFormState;

  const locality = useAtomValue(inventoryLocalityAtom);
  const latitude = useAtomValue(inventoryLatitudeAtom);
  const altitude = useAtomValue(inventoryAltitudeAtom);
  const longitude = useAtomValue(inventoryLongitudeAtom);

  const [formValues, setFormValues] = useState<InventoryFormState>(defaultFormValues);
  useEffect(() => {
    setFormValues({
      ...getValues(),
      localityId: locality?.id ?? null,
      coordinates: {
        ...getValues().coordinates,
        latitude,
        longitude,
        altitude,
      },
    });
  }, [locality, latitude, longitude, altitude]);

  const {
    register,
    control,
    getValues,
    formState: { isValid, isDirty, dirtyFields, defaultValues },
    handleSubmit,
    watch,
  } = useForm<InventoryFormState>({
    resetOptions: { keepDefaultValues: true },
    defaultValues: defaultFormValues,
    values: formValues,
    resolver: zodResolver(upsertInventoryInput),
  });

  const localityId = watch();

  const onSubmit: SubmitHandler<InventoryFormState> = (inventoryFormData) => {
    // FIXME assertion is done thanks to zod resolver, however types are not inferred
    onSubmitForm?.(inventoryFormData as unknown as UpsertInventoryInput);
  };

  return (
    <div>
      <div className="flex gap-2">
        <span className={`text-xl ${isDirty ? "bg-yellow-500" : ""}`}>DIRTY</span>
        <span className={`text-xl ${isValid ? "bg-green-500" : "bg-red-500"}`}>VALID</span>
      </div>
      DIRTY FIELDS: {JSON.stringify(dirtyFields)}
      <br />
      DEFAULT: {JSON.stringify(defaultValues)}
      <br />
      LOCALITY: {JSON.stringify(localityId)}
      <h2 className="text-xl font-semibold mb-3">{t("inventoryForm.title")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-4">
            <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
              <InventoryFormObserver
                control={control}
                defaultObserver={initialData?.observer ?? userSettings.defaultObserver ?? undefined}
                areAssociesDisplayed={userSettings.areAssociesDisplayed}
                autofocusOnObserver={true}
              />
            </div>
            <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
              <InventoryFormDate register={register} />
            </div>
            <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
              <InventoryFormLocation
                register={register}
                control={control}
                defaultDepartment={initialData != null ? undefined : userSettings.defaultDepartment ?? undefined}
              />
            </div>
            {userSettings.isMeteoDisplayed && (
              <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
                <InventoryFormWeather control={control} register={register} />
              </div>
            )}
          </fieldset>
          <button
            type="submit"
            className="btn btn-primary btn-block mb-8"
            disabled={(disableIfNoChanges && !isDirty) || !isValid}
          >
            {submitFormText ?? t("save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;

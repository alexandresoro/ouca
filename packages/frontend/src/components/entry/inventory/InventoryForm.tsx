import { useEffect, useRef, useState, type FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "urql";
import { type Observateur, type UpsertInventaireMutationVariables } from "../../../gql/graphql";
import TempPage from "../../TempPage";
import FormAutocomplete from "../../common/form/FormAutocomplete";
import {
  AUTOCOMPLETE_OBSERVATEURS_QUERY,
  GET_INVENTAIRE_BY_ENTRY_ID,
  GET_INVENTORY_DEFAULTS_SETTINGS,
  UPSERT_INVENTAIRE,
} from "./InventoryFormQueries";

type InventoryFormProps =
  | {
      isNewInventory?: boolean;
      existingEntryId?: never;
    }
  | {
      isNewInventory?: never;
      existingEntryId: number;
    };

type UpsertInventoryInput = Pick<UpsertInventaireMutationVariables, "upsertInventaireId"> &
  UpsertInventaireMutationVariables["data"] & {
    observer: Observateur;
  };

const InventoryForm: FunctionComponent<InventoryFormProps> = ({ isNewInventory, existingEntryId }) => {
  const { t } = useTranslation();

  const [observateurInput, setObservateurInput] = useState("");

  const {
    register,
    setValue,
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertInventoryInput>({
    defaultValues: {
      observer: undefined,
    },
  });

  const [{ data: defaultSettingsData, error, fetching }] = useQuery({
    query: GET_INVENTORY_DEFAULTS_SETTINGS,
  });

  const [{ data: existingEntryData, error: errorExistingInventory, fetching: fetchingExistingInventory }] = useQuery({
    query: GET_INVENTAIRE_BY_ENTRY_ID,
    variables: {
      entryId: existingEntryId!,
    },
    pause: !existingEntryId,
  });

  const [{ data: dataObservers }] = useQuery({
    query: AUTOCOMPLETE_OBSERVATEURS_QUERY,
    variables: {
      searchParams: {
        q: observateurInput,
        pageSize: 5,
      },
    },
  });

  const [_, upsertInventory] = useMutation(UPSERT_INVENTAIRE);

  const observerEl = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Focus on observer on page load if new inventory
    if (isNewInventory) {
      observerEl.current?.focus();
    }
  }, [isNewInventory]);

  useEffect(() => {
    if (isNewInventory && defaultSettingsData?.settings) {
      // FIXME caution with pause on existingEntryData
      // TODO use proper reset
      console.log("RESET WITH DEFAULTS", { settings: defaultSettingsData.settings });
      if (defaultSettingsData.settings.defaultObservateur) {
        setValue("observer", defaultSettingsData.settings.defaultObservateur);
      }
    }
  }, [defaultSettingsData, isNewInventory]);

  useEffect(() => {
    if (existingEntryData?.donnee?.donnee?.inventaire && defaultSettingsData?.settings) {
      console.log("RESET WITH EXISTING", {
        inventaire: existingEntryData.donnee.donnee.inventaire,
        settings: defaultSettingsData.settings,
      });
      // TODO use proper reset
      setValue("observer", existingEntryData.donnee.donnee.inventaire.observateur);
    }
  }, [defaultSettingsData, existingEntryData]);

  const hasError = error || errorExistingInventory;
  const isFetching = fetching || fetchingExistingInventory;

  if (hasError || !(defaultSettingsData || isFetching)) {
    return <>{t("displayData.genericError")}</>;
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">{t("inventoryForm")}</h2>
      <div className="card border-primary rounded-lg p-3 bg-base-100 shadow-lg">
        <FormAutocomplete
          inputRef={observerEl}
          data={dataObservers?.observateurs?.data ?? []}
          name="observer"
          label={t("observer")}
          control={control}
          rules={{
            required: true,
          }}
          onInputChange={setObservateurInput}
          renderValue={({ libelle }) => libelle}
          labelClassName="capitalize"
        />
        {JSON.stringify(defaultSettingsData?.settings?.areAssociesDisplayed)}
        {/* <FormSelect
          name="defaultObservateur"
          label={t("defaultObserver")}
          control={control}
          defaultValue=""
          rules={{
            required: true,
          }}
          data={data?.observateurs?.data}
          renderValue={({ libelle }) => libelle}
        /> */}
      </div>
      <TempPage />
    </>
  );
};

export default InventoryForm;

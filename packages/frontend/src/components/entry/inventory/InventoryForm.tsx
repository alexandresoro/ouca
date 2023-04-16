import { FilePlus } from "@styled-icons/boxicons-solid";
import { format } from "date-fns";
import { useEffect, useRef, useState, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useClient, useMutation, useQuery } from "urql";
import { type Observateur } from "../../../gql/graphql";
import useUserSettingsContext from "../../../hooks/useUserSettingsContext";
import TempPage from "../../TempPage";
import FormAutocomplete from "../../common/form/FormAutocomplete";
import TextInput from "../../common/styled/TextInput";
import { AUTOCOMPLETE_OBSERVATEURS_QUERY, GET_INVENTAIRE, UPSERT_INVENTAIRE } from "./InventoryFormQueries";

type InventoryFormProps = {
  // New inventory (w/ possible existing inventory id as template)
  isNewInventory?: boolean;
  existingInventoryId?: number;
};

type UpsertInventoryInput = {
  id: number | null;
  observer: Observateur | null;
  associateObservers: Observateur[];
  date: string | null;
  time?: string | null;
  duration?: string | null;
  temperature?: string | null;
};

const InventoryForm: FunctionComponent<InventoryFormProps> = ({ isNewInventory, existingInventoryId }) => {
  const { t } = useTranslation();

  const { userSettings } = useUserSettingsContext();

  const [observateurInput, setObservateurInput] = useState("");
  const [associatesInput, setAssociatesInput] = useState("");

  const {
    register,
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertInventoryInput>({
    defaultValues: {
      id: null,
      observer: null,
      associateObservers: [],
    },
  });

  const client = useClient();

  const [{ data: dataObservers }] = useQuery({
    query: AUTOCOMPLETE_OBSERVATEURS_QUERY,
    variables: {
      searchParams: {
        q: observateurInput,
        pageSize: 5,
      },
    },
  });

  const [{ data: dataAssociateObservers }] = useQuery({
    query: AUTOCOMPLETE_OBSERVATEURS_QUERY,
    variables: {
      searchParams: {
        q: associatesInput,
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

  // Initialize with new entry if no existing inventory provided
  useEffect(() => {
    if (isNewInventory && existingInventoryId === undefined) {
      console.log("RESET WITH DEFAULTS", { settings: userSettings });
      if (userSettings.defaultObservateur) {
        reset({
          id: null,
          observer: userSettings.defaultObservateur,
          associateObservers: [],
          date: format(new Date(), "yyyy-MM-dd"),
        });
      }
    }
  }, [userSettings, isNewInventory, existingInventoryId]);

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
          reset({
            id: data.inventaire.id,
            observer: data.inventaire.observateur,
            associateObservers: data.inventaire.associes,
            date: data.inventaire.date,
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
        <h2 className="text-xl font-semibold mb-3">{t("inventoryForm.title")}</h2>
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
            labelClassName="first-letter:capitalize"
          />
          {userSettings.areAssociesDisplayed && (
            <FormAutocomplete
              multiple
              data={dataAssociateObservers?.observateurs?.data ?? []}
              name="associateObservers"
              label={t("associateObservers")}
              control={control}
              onInputChange={setAssociatesInput}
              renderValue={({ libelle }) => libelle}
              labelClassName="first-letter:capitalize"
            />
          )}
        </div>
        <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
          <div className="flex gap-2">
            <TextInput
              {...register("date", {
                required: true,
                min: "1990-01-01",
                max: "9999-12-31",
              })}
              textInputClassName="flex-grow py-1"
              label={t("inventoryForm.date")}
              type="date"
              required
            />
            <TextInput
              {...register("time", {
                validate: {
                  time: (v) => !v || /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/.test(v),
                },
              })}
              textInputClassName="py-1"
              label={t("inventoryForm.time")}
              type="time"
            />
            <TextInput
              {...register("duration", {
                pattern: /^[0-9]{1,2}:[0-5][0-9]/,
              })}
              textInputClassName="w-24 py-1"
              label={t("inventoryForm.duration")}
              type="text"
            />
          </div>
        </div>
        {userSettings.isMeteoDisplayed && (
          <div className="card border border-primary rounded-lg px-3 pb-2 bg-base-200 shadow-lg">
            <div className="flex gap-2">
              <TextInput
                {...register("temperature", {
                  min: -50,
                  max: 100,
                })}
                textInputClassName="w-24 py-1"
                label={t("inventoryForm.temperature")}
                type="number"
              />
            </div>
          </div>
        )}
        <button type="submit">submit</button>
      </form>
      Valid: {JSON.stringify(isValid)}
      <TempPage />
    </>
  );
};

export default InventoryForm;

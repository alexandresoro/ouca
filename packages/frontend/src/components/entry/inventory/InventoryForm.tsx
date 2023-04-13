import { useEffect, useRef, useState, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useClient, useMutation, useQuery } from "urql";
import { type Observateur } from "../../../gql/graphql";
import useUserSettingsContext from "../../../hooks/useUserSettingsContext";
import TempPage from "../../TempPage";
import FormAutocomplete from "../../common/form/FormAutocomplete";
import { AUTOCOMPLETE_OBSERVATEURS_QUERY, GET_INVENTAIRE_BY_ENTRY_ID, UPSERT_INVENTAIRE } from "./InventoryFormQueries";

type InventoryFormProps =
  | {
      isNewInventory?: boolean;
      existingEntryId?: never;
    }
  | {
      isNewInventory?: never;
      existingEntryId: number;
    };

type UpsertInventoryInput = {
  id: number | null;
  observer: Observateur | null;
  associateObservers: Observateur[];
};

const InventoryForm: FunctionComponent<InventoryFormProps> = ({ isNewInventory, existingEntryId }) => {
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

  // Initialize with new entry
  useEffect(() => {
    if (isNewInventory) {
      console.log("RESET WITH DEFAULTS", { settings: userSettings });
      if (userSettings.defaultObservateur) {
        reset({
          id: null,
          observer: userSettings.defaultObservateur,
          associateObservers: [],
        });
      }
    }
  }, [userSettings, isNewInventory]);

  // Initialize with existing entry
  useEffect(() => {
    if (existingEntryId != null) {
      client
        .query(GET_INVENTAIRE_BY_ENTRY_ID, { entryId: existingEntryId })
        .toPromise()
        .then(({ data, error }) => {
          if (error || !data?.donnee?.donnee) {
            throw new Error(`An error has occurred while retrieving entry ID=${existingEntryId}`);
          }
          const inventory = data.donnee.donnee.inventaire;

          console.log("RESET WITH EXISTING", {
            inventory,
          });
          reset({
            id: inventory.id,
            observer: inventory.observateur,
            associateObservers: inventory.associes,
          });
        })
        .catch(() => {
          throw new Error(`An error has occurred while retrieving entry ID=${existingEntryId}`);
        });
    }
  }, [existingEntryId, client]);

  const onSubmit: SubmitHandler<UpsertInventoryInput> = (upsertInventoryInput) => {
    console.log(upsertInventoryInput);
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">{t("inventoryForm")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
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
      </form>
      Valid: {JSON.stringify(isValid)}
      <TempPage />
    </>
  );
};

export default InventoryForm;

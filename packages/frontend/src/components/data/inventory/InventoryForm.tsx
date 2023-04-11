import { useEffect, type FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import TempPage from "../../TempPage";
import { GET_INVENTORY_DEFAULTS_SETTINGS } from "./InventoryFormQueries";

type InventoryFormProps =
  | {
      isNewInventory?: boolean;
      existingInventoryId?: never;
    }
  | {
      isNewInventory: never;
      existingInventoryId: number;
    };

const InventoryForm: FunctionComponent<InventoryFormProps> = ({ isNewInventory, existingInventoryId }) => {
  const { t } = useTranslation();

  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm({});

  const [{ data: defaultSettingsData, error, fetching }, reexecuteDefaultSettingsQuery] = useQuery({
    query: GET_INVENTORY_DEFAULTS_SETTINGS,
    pause: true,
  });

  useEffect(() => {
    reexecuteDefaultSettingsQuery();
  }, []);

  if (error || !(defaultSettingsData || fetching)) {
    return <>{t("displayData.genericError")}</>;
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">{t("inventoryForm")}</h2>
      <div className="card border-2 border-primary rounded-lg p-4 bg-base-100 shadow-lg">
        {/* {JSON.stringify(defaultSettingsData?.settings)} */}
        {/* <FormAutocomplete
          data={dataObs?.observateurs?.data}
          name="observateur"
          label="Observateurs"
          control={control}
          onInputChange={setObsFilter}
          renderValue={({ libelle }) => libelle}
          autocompleteClassName="w-[40ch] ml-4"
        /> */}
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

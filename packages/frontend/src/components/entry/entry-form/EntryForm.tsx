import { zodResolver } from "@hookform/resolvers/zod";
import { upsertEntryInput, type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type Entry } from "@ou-ca/common/entities/entry";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntryFormComment from "./EntryFormComment";
import EntryFormSpecies from "./EntryFormSpecies";
import { type EntryFormState } from "./EntryFormState";

type EntryFormProps = {
  submitFormText?: string;
  disableIfNoChanges?: boolean;
} & (
  | {
      mode: "update";
      initialData: Entry;
      onSubmitForm?: (entryFormData: UpsertEntryInput, entryId: string) => void;
    }
  | {
      mode: "create";
      initialData: Omit<Entry, "id"> | { inventoryId: string };
      onSubmitForm?: (entryFormData: UpsertEntryInput) => void;
    }
);

const EntryForm: FunctionComponent<EntryFormProps> = (props) => {
  const { submitFormText, disableIfNoChanges } = props;
  const { t } = useTranslation();

  const defaultFormValues = (
    props.mode === "create"
      ? {
          // New entry
          inventoryId: props.initialData.inventoryId,
          speciesId: null,
          sexId: null,
          ageId: null,
          numberEstimateId: null,
          number: null,
          distanceEstimateId: null,
          distance: null,
          regroupment: null,
          behaviorIds: [],
          environmentIds: [],
          comment: null,
        }
      : {
          // Existing entry
          inventoryId: props.initialData.inventoryId,
          speciesId: props.initialData.species.id,
          sexId: props.initialData.sex.id,
          ageId: props.initialData.age.id,
          numberEstimateId: props.initialData.numberEstimate.id,
          number: props.initialData.number,
          distanceEstimateId: props.initialData.distanceEstimate?.id ?? null,
          distance: props.initialData.distance,
          regroupment: props.initialData.regroupment,
          behaviorIds: props.initialData.behaviors.map((behavior) => behavior.id),
          environmentIds: props.initialData.environments.map((environment) => environment.id),
          comment: props.initialData.comment,
        }
  ) satisfies EntryFormState;

  const {
    register,
    control,
    formState: { isValid, isDirty, dirtyFields, defaultValues },
    handleSubmit,
    watch,
  } = useForm<EntryFormState>({
    resetOptions: { keepDefaultValues: true },
    defaultValues: defaultFormValues,
    values: defaultFormValues,
    resolver: zodResolver(upsertEntryInput),
  });

  const values = watch();

  const onSubmit: SubmitHandler<EntryFormState> = (entryFormData) => {
    // FIXME assertion is done thanks to zod resolver, however types are not inferred
    switch (props.mode) {
      case "create":
        props.onSubmitForm?.(entryFormData as unknown as UpsertEntryInput);
        break;
      case "update":
        props.onSubmitForm?.(entryFormData as unknown as UpsertEntryInput, props.initialData.id);
        break;
      default:
        break;
    }
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
      VALUES: {JSON.stringify(values)}
      <h2 className="text-xl font-semibold mb-3">{t("entryDetailsForm.title")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-4">
            <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
              <EntryFormSpecies
                control={control}
                initialSpecies={props.mode === "update" ? props.initialData.species : undefined}
                autofocusOnSpecies
              />
            </div>
            <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
              <EntryFormComment register={register} />
            </div>
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

export default EntryForm;

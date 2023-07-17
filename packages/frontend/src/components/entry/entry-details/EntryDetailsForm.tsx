import { zodResolver } from "@hookform/resolvers/zod";
import { upsertEntryInput, type GetEntryResponse } from "@ou-ca/common/api/entry";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntryDetailsCommentForm from "./EntryDetailsCommentForm";
import { type EntryDetailsFormState } from "./EntryDetailsFormState";
import EntryDetailsSpeciesForm from "./EntryDetailsSpeciesForm";

type EntryDetailsFormProps =
  | {
      // New entry
      isNewEntry: true;
      existingInventoryId: string;
      existingEntry?: never;
    }
  | {
      // Existing entry
      isNewEntry?: never;
      existingInventoryId?: never;
      existingEntry: GetEntryResponse;
    };

const EntryDetailsForm: FunctionComponent<EntryDetailsFormProps> = ({
  isNewEntry,
  existingInventoryId,
  existingEntry,
}) => {
  const { t } = useTranslation();

  const inventoryId = existingEntry === undefined ? existingInventoryId : existingEntry.inventoryId;

  const defaultFormValues = (
    existingEntry === undefined
      ? {
          // New entry
          inventoryId,
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
          inventoryId,
          speciesId: existingEntry.species.id,
          sexId: existingEntry.sex.id,
          ageId: existingEntry.age.id,
          numberEstimateId: existingEntry.numberEstimate.id,
          number: existingEntry.number,
          distanceEstimateId: existingEntry.distanceEstimate?.id ?? null,
          distance: existingEntry.distance,
          regroupment: existingEntry.regroupment,
          behaviorIds: existingEntry.behaviors.map((behavior) => behavior.id),
          environmentIds: existingEntry.environments.map((environment) => environment.id),
          comment: existingEntry.comment,
        }
  ) satisfies EntryDetailsFormState;

  const {
    register,
    control,
    formState: { isValid, isDirty, dirtyFields, defaultValues },
    handleSubmit,
    watch,
  } = useForm<EntryDetailsFormState>({
    resetOptions: { keepDefaultValues: true },
    defaultValues: defaultFormValues,
    values: defaultFormValues,
    resolver: zodResolver(upsertEntryInput),
  });

  const onSubmit: SubmitHandler<EntryDetailsFormState> = (entryDetailsFormData) => {
    console.log("ENTRY SUBMITTED", entryDetailsFormData);
  };

  return (
    <div
      className={`${isValid ? "" : "bg-red-500 bg-opacity-70"} ${
        isDirty && isValid ? "bg-yellow-500 bg-opacity-70" : ""
      }`}
    >
      DIRTY FIELDS: {JSON.stringify(dirtyFields)}
      <br />
      DEFAULT: {JSON.stringify(defaultValues)}
      <h2 className="text-xl font-semibold mb-3">{t("entryDetailsForm.title")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex flex-col gap-4">
          <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
            <EntryDetailsSpeciesForm />
          </div>
          <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
            <EntryDetailsCommentForm />
          </div>
        </fieldset>
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default EntryDetailsForm;

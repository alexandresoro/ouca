import { zodResolver } from "@hookform/resolvers/zod";
import { upsertEntryInput, type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type Entry } from "@ou-ca/common/entities/entry";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useUserSettingsContext from "../../../hooks/useUserSettingsContext";
import EntryFormBehaviors from "./EntryFormBehaviors";
import EntryFormCharacteristics from "./EntryFormCharacteristics";
import EntryFormComment from "./EntryFormComment";
import EntryFormDistanceRegroupment from "./EntryFormDistanceRegroupment";
import EntryFormEnvironments from "./EntryFormEnvironments";
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

  const { userSettings } = useUserSettingsContext();

  const defaultFormValues = (
    props.mode === "create"
      ? {
          // New entry
          inventoryId: props.initialData.inventoryId,
          speciesId: null,
          sexId: userSettings.defaultSex?.id ?? null,
          ageId: userSettings.defaultAge?.id ?? null,
          numberEstimateId: userSettings.defaultNumberEstimate?.id ?? null,
          number: userSettings.defaultNombre != null ? userSettings.defaultNombre : null,
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
    setValue,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<EntryFormState>({
    resetOptions: { keepDefaultValues: true },
    defaultValues: defaultFormValues,
    values: defaultFormValues,
    // FIX: case where number is not provided but estimate is not "nonCompte" is considered valid and should not
    resolver: zodResolver(upsertEntryInput),
  });

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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2.5">
            <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
              <EntryFormSpecies
                control={control}
                initialSpecies={props.mode === "update" ? props.initialData.species : undefined}
                autofocusOnSpecies
              />
            </div>
            <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
              <div className="flex flex-col">
                <EntryFormCharacteristics
                  control={control}
                  register={register}
                  setValue={setValue}
                  defaultNumber={userSettings?.defaultNombre ?? undefined}
                  defaultNumberEstimate={
                    (props.mode === "update" ? props.initialData.numberEstimate : undefined) ??
                    userSettings.defaultNumberEstimate ??
                    undefined
                  }
                  defaultSex={
                    (props.mode === "update" ? props.initialData.sex : undefined) ??
                    userSettings.defaultSex ??
                    undefined
                  }
                  defaultAge={
                    (props.mode === "update" ? props.initialData.age : undefined) ??
                    userSettings.defaultAge ??
                    undefined
                  }
                />
                {(userSettings.isDistanceDisplayed || userSettings.isRegroupementDisplayed) && (
                  <EntryFormDistanceRegroupment
                    control={control}
                    register={register}
                    setValue={setValue}
                    isDistanceDisplayed={userSettings.isDistanceDisplayed}
                    isRegroupmentDisplayed={userSettings.isRegroupementDisplayed}
                    defaultDistanceEstimate={
                      (props.mode === "update" ? props.initialData.distanceEstimate : undefined) ?? undefined
                    }
                  />
                )}
              </div>
            </div>
            <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
              <EntryFormBehaviors
                control={control}
                initialBehaviors={(props.mode === "update" ? props.initialData.behaviors : []) ?? []}
              />
            </div>
            <div className="card border border-primary rounded-lg px-3 pb-3 bg-base-200 shadow-lg">
              <EntryFormEnvironments
                control={control}
                initialEnvironments={(props.mode === "update" ? props.initialData.environments : []) ?? []}
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
    </>
  );
};

export default EntryForm;

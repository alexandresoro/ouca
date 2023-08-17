import { zodResolver } from "@hookform/resolvers/zod";
import { upsertBehaviorInput, type UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { CERTAIN, POSSIBLE, PROBABLE, type NicheurCode } from "@ou-ca/common/types/nicheur.model";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type ComportementEditProps = {
  defaultValues?: UpsertBehaviorInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertBehaviorInput>;
};

const ComportementEdit: FunctionComponent<ComportementEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    control,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertBehaviorInput>({
    defaultValues: defaultValues ?? {
      code: "",
      libelle: "",
      nicheur: null,
    },
    resolver: zodResolver(upsertBehaviorInput),
  });

  const breedingStatuses = [
    {
      label: "---",
      value: null,
    },
    {
      label: t("breedingStatus.possible"),
      value: POSSIBLE,
    },
    {
      label: t("breedingStatus.probable"),
      value: PROBABLE,
    },
    {
      label: t("breedingStatus.certain"),
      value: CERTAIN,
    },
  ] satisfies { label: string; value: NicheurCode | null }[];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label={t("code")} type="text" required {...register("code")} />

      <TextInput label={t("label")} type="text" required {...register("libelle")} />

      <FormSelect
        name="nicheur"
        label={t("breeding")}
        required
        control={control}
        data={breedingStatuses}
        by="value"
        renderValue={({ label }) => label}
      />

      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default ComportementEdit;

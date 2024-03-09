import { zodResolver } from "@hookform/resolvers/zod";
import { type UpsertEnvironmentInput, upsertEnvironmentInput } from "@ou-ca/common/api/environment";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../../components/base/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type MilieuEditProps = {
  defaultValues?: UpsertEnvironmentInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertEnvironmentInput>;
};

const MilieuEdit: FunctionComponent<MilieuEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertEnvironmentInput>({
    defaultValues: defaultValues ?? {
      code: "",
      libelle: "",
    },
    resolver: zodResolver(upsertEnvironmentInput),
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label={t("code")} type="text" required {...register("code")} hasError={!!errors.code} />

      <TextInput label={t("label")} type="text" required {...register("libelle")} hasError={!!errors.libelle} />

      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default MilieuEdit;

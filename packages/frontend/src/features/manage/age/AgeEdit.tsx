import { zodResolver } from "@hookform/resolvers/zod";
import { type UpsertAgeInput, upsertAgeInput } from "@ou-ca/common/api/age";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../../components/base/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type AgeEditProps = {
  defaultValues?: UpsertAgeInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertAgeInput>;
};

const AgeEdit: FunctionComponent<AgeEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertAgeInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(upsertAgeInput),
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label={t("label")} type="text" required {...register("libelle")} hasError={!!errors.libelle} />
      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default AgeEdit;

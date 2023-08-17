import { zodResolver } from "@hookform/resolvers/zod";
import { upsertSexInput, type UpsertSexInput } from "@ou-ca/common/api/sex";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../common/styled/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type SexeEditProps = {
  defaultValues?: UpsertSexInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertSexInput>;
};

const SexeEdit: FunctionComponent<SexeEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertSexInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(upsertSexInput),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        label={t("label")}
        type="text"
        required
        {...register("libelle", {
          required: t("requiredFieldError"),
        })}
      />
      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default SexeEdit;

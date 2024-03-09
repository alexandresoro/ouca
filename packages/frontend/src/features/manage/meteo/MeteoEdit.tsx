import { zodResolver } from "@hookform/resolvers/zod";
import { type UpsertWeatherInput, upsertWeatherInput } from "@ou-ca/common/api/weather";
import { type FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../../components/base/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type MeteoEditProps = {
  defaultValues?: UpsertWeatherInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertWeatherInput>;
};

const MeteoEdit: FunctionComponent<MeteoEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertWeatherInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(upsertWeatherInput),
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label={t("label")} type="text" required {...register("libelle")} hasError={!!errors.libelle} />

      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default MeteoEdit;

import { zodResolver } from "@hookform/resolvers/zod";
import { upsertObserverInput, type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../common/styled/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type ObservateurEditProps = {
  defaultValues?: UpsertObserverInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertObserverInput>;
};

const ObservateurEdit: FunctionComponent<ObservateurEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertObserverInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(upsertObserverInput),
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label={t("label")} type="text" required {...register("libelle")} />

      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default ObservateurEdit;

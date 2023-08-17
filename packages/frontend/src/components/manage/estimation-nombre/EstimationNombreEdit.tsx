import { zodResolver } from "@hookform/resolvers/zod";
import { upsertNumberEstimateInput, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Checkbox from "../../common/styled/Checkbox";
import TextInput from "../../common/styled/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type EstimationNombreEditProps = {
  defaultValues?: UpsertNumberEstimateInput | null;
  onCancel?: () => void;
  onSubmit: SubmitHandler<UpsertNumberEstimateInput>;
};

const EstimationNombreEdit: FunctionComponent<EstimationNombreEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertNumberEstimateInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
      nonCompte: false,
    },
    resolver: zodResolver(upsertNumberEstimateInput),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label={t("label")} type="text" required {...register("libelle")} />
      <Checkbox label={t("undefinedNumber")} {...register("nonCompte")} />
      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default EstimationNombreEdit;

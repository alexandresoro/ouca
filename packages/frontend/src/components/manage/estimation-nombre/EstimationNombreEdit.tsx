import { zodResolver } from "@hookform/resolvers/zod";
import { upsertNumberEstimateInput, type UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Checkbox from "../../common/styled/Checkbox";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";

type EstimationNombreEditProps = {
  title: string;
  defaultValues?: UpsertNumberEstimateInput | null;
  onSubmit: SubmitHandler<UpsertNumberEstimateInput>;
};

const EstimationNombreEdit: FunctionComponent<EstimationNombreEditProps> = (props) => {
  const { title, defaultValues, onSubmit } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

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
    <>
      <ManageTopBar title={t("numberPrecisions")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput label={t("label")} type="text" required {...register("libelle")} />
              <Checkbox label={t("undefinedNumber")} {...register("nonCompte")} />
              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={!isValid || !isDirty}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default EstimationNombreEdit;

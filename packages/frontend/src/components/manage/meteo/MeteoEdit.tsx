import { zodResolver } from "@hookform/resolvers/zod";
import { upsertWeatherInput, type UpsertWeatherInput } from "@ou-ca/common/api/weather";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";

type MeteoEditProps = {
  title: string;
  defaultValues?: UpsertWeatherInput | null;
  onSubmit: SubmitHandler<UpsertWeatherInput>;
};

const MeteoEdit: FunctionComponent<MeteoEditProps> = (props) => {
  const { title, defaultValues, onSubmit } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertWeatherInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(upsertWeatherInput),
  });

  return (
    <>
      <ManageTopBar title={t("weathers")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput label={t("label")} type="text" required {...register("libelle")} />

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

export default MeteoEdit;

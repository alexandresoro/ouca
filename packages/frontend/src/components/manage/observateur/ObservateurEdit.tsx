import { zodResolver } from "@hookform/resolvers/zod";
import { upsertObserverInput, type UpsertObserverInput } from "@ou-ca/common/api/observer";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";

type ObservateurEditProps = {
  title: string;
  defaultValues?: UpsertObserverInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertObserverInput>;
};

const ObservateurEdit: FunctionComponent<ObservateurEditProps> = (props) => {
  const { title, defaultValues, onCancel, onSubmit } = props;

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
  });

  return (
    <>
      <ManageTopBar title={t("observers")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput label={t("label")} type="text" required {...register("libelle")} />

              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={onCancel}
                disabled={!isValid || !isDirty}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default ObservateurEdit;

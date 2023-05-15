import { zodResolver } from "@hookform/resolvers/zod";
import { upsertBehaviorInput, type UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { CERTAIN, POSSIBLE, PROBABLE } from "@ou-ca/common/types/nicheur.model";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type Nicheur } from "../../../gql/graphql";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";

type ComportementEditProps = {
  title: string;
  defaultValues?: UpsertBehaviorInput | null;
  onSubmit: SubmitHandler<UpsertBehaviorInput>;
};

const ComportementEdit: FunctionComponent<ComportementEditProps> = (props) => {
  const { title, defaultValues, onSubmit } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

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
  ] satisfies { label: string; value: Nicheur | null }[];

  return (
    <>
      <ManageTopBar title={t("behaviors")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput label={t("code")} type="text" required {...register("code")} />

              <TextInput label={t("label")} type="text" required {...register("libelle")} />

              <FormSelect
                name="nicheur"
                label={t("breeding")}
                control={control}
                data={breedingStatuses}
                by="value"
                renderValue={({ label }) => label}
              />

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

export default ComportementEdit;

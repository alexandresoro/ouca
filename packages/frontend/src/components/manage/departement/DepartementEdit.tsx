import { zodResolver } from "@hookform/resolvers/zod";
import { upsertDepartmentInput, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";

type DepartementEditProps = {
  title: string;
  defaultValues?: UpsertDepartmentInput | null;
  onSubmit: SubmitHandler<UpsertDepartmentInput>;
};

const DepartementEdit: FunctionComponent<DepartementEditProps> = (props) => {
  const { title, defaultValues, onSubmit } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertDepartmentInput>({
    defaultValues: defaultValues ?? {
      code: "",
    },
    resolver: zodResolver(upsertDepartmentInput),
  });

  return (
    <>
      <ManageTopBar title={t("departments")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput label={t("code")} type="text" required {...register("code")} />

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

export default DepartementEdit;

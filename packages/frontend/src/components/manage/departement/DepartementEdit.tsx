import { zodResolver } from "@hookform/resolvers/zod";
import { upsertDepartmentInput, type UpsertDepartmentInput } from "@ou-ca/common/api/department";
import { type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextInput from "../../common/styled/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type DepartementEditProps = {
  defaultValues?: UpsertDepartmentInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertDepartmentInput>;
};

const DepartementEdit: FunctionComponent<DepartementEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label={t("code")} type="text" required {...register("code")} />

      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default DepartementEdit;

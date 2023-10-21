import { zodResolver } from "@hookform/resolvers/zod";
import { getDepartmentsResponse } from "@ou-ca/common/api/department";
import { upsertTownInput, type UpsertTownInput } from "@ou-ca/common/api/town";
import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type CommuneEditProps = {
  defaultValues?: UpsertTownInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertTownInput>;
};

const CommuneEdit: FunctionComponent<CommuneEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertTownInput>({
    defaultValues: defaultValues ?? {
      code: undefined,
      nom: "",
      departmentId: undefined,
    },
    resolver: zodResolver(upsertTownInput),
    mode: "onTouched",
  });

  const {
    data: departments,
    isError: errorDepartements,
    isFetching: fetchingDepartements,
  } = useApiQuery(
    {
      path: "/departments",
      queryParams: {
        orderBy: "code",
        sortOrder: "asc",
      },
      schema: getDepartmentsResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (errorDepartements) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [errorDepartements, displayNotification, t]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormSelect
        name="departmentId"
        label={t("department")}
        required
        control={control}
        data={departments?.data}
        renderValue={({ code }) => code}
      />

      <TextInput label={t("townCode")} type="text" required {...register("code")} hasError={!!errors.code} />
      <TextInput label={t("townName")} type="text" required {...register("nom")} hasError={!!errors.nom} />

      <EntityUpsertFormActionButtons
        className="mt-6"
        onCancelClick={onCancel}
        disabled={fetchingDepartements || !isValid || !isDirty}
      />
    </form>
  );
};

export default CommuneEdit;

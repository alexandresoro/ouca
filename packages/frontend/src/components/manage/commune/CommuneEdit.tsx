import { zodResolver } from "@hookform/resolvers/zod";
import { getDepartmentsResponse } from "@ou-ca/common/api/department";
import { upsertTownInput, type UpsertTownInput } from "@ou-ca/common/api/town";
import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";

type CommuneEditProps = {
  title: string;
  defaultValues?: UpsertTownInput | null;
  onSubmit: SubmitHandler<UpsertTownInput>;
};

const CommuneEdit: FunctionComponent<CommuneEditProps> = (props) => {
  const { title, defaultValues, onSubmit } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    control,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertTownInput>({
    defaultValues: defaultValues ?? {
      code: undefined,
      nom: "",
      departmentId: undefined,
    },
    resolver: zodResolver(upsertTownInput),
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
    <>
      <ManageTopBar title={t("towns")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <FormSelect
                name="departmentId"
                label={t("department")}
                required
                control={control}
                data={departments?.data}
                renderValue={({ code }) => code}
              />

              <TextInput label={t("townCode")} type="text" required {...register("code")} />
              <TextInput label={t("townName")} type="text" required {...register("nom")} />

              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={fetchingDepartements || !isValid || !isDirty}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default CommuneEdit;

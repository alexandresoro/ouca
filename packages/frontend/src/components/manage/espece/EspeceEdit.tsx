import { zodResolver } from "@hookform/resolvers/zod";
import { upsertSpeciesInput, type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { getClassesResponse } from "@ou-ca/common/api/species-class";
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

type EspeceEditProps = {
  title: string;
  defaultValues?: (Omit<UpsertSpeciesInput, "classId"> & { classId?: string }) | null;
  onCancel?: () => void;
  onSubmit: SubmitHandler<UpsertSpeciesInput>;
};

const EspeceEdit: FunctionComponent<EspeceEditProps> = (props) => {
  const { title, defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    control,
    formState: { isValid, isDirty },
    handleSubmit,
  } = useForm<UpsertSpeciesInput>({
    defaultValues: defaultValues ?? {
      code: "",
      nomFrancais: "",
      nomLatin: "",
      classId: undefined,
    },
    resolver: zodResolver(upsertSpeciesInput),
  });

  const {
    data: classes,
    isError: errorClasses,
    isFetching: fetchingClasses,
  } = useApiQuery(
    {
      path: "/classes",
      queryParams: {
        orderBy: "libelle",
        sortOrder: "asc",
      },
      schema: getClassesResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (errorClasses) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [errorClasses, displayNotification, t]);

  return (
    <>
      <ManageTopBar title={t("species")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <FormSelect
                name="classId"
                label={t("speciesClass")}
                required
                control={control}
                data={classes?.data}
                renderValue={({ libelle }) => libelle}
              />

              <TextInput label={t("speciesCode")} type="text" required {...register("code")} />
              <TextInput label={t("localizedName")} type="text" required {...register("nomFrancais")} />
              <TextInput label={t("scientificName")} type="text" required {...register("nomLatin")} />

              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={fetchingClasses || !isValid || !isDirty}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default EspeceEdit;

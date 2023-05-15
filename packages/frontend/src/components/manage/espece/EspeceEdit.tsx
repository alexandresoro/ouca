import { zodResolver } from "@hookform/resolvers/zod";
import { upsertSpeciesInput, type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import useSnackbar from "../../../hooks/useSnackbar";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { ALL_CLASSES_QUERY } from "./EspeceManageQueries";

type EspeceEditProps = {
  title: string;
  defaultValues?: UpsertSpeciesInput | null;
  onSubmit: SubmitHandler<UpsertSpeciesInput>;
};

const EspeceEdit: FunctionComponent<EspeceEditProps> = (props) => {
  const { title, defaultValues, onSubmit } = props;

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

  const [{ data: dataClasses, error: errorClasses, fetching: fetchingClasses }] = useQuery({
    query: ALL_CLASSES_QUERY,
    variables: {
      orderBy: "libelle",
      sortOrder: "asc",
    },
  });

  // Workaround as GQL return ids as number and rest returns strings
  const reshapedClasses = dataClasses?.classes?.data?.map((speciesClass) => {
    const { id, ...rest } = speciesClass;
    return {
      ...rest,
      id: `${id}`,
    };
  });

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
                control={control}
                data={reshapedClasses}
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

import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertEspeceMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { ALL_CLASSES_QUERY, ESPECE_QUERY, UPSERT_ESPECE } from "./EspeceManageQueries";

type EspeceEditProps = {
  title: string;
};

type UpsertEspeceInput = Pick<UpsertEspeceMutationVariables, "id"> & UpsertEspeceMutationVariables["data"];

const EspeceEdit: FunctionComponent<EspeceEditProps> = (props) => {
  const { title } = props;
  const { id: especeId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertEspeceInput>({
    defaultValues: {
      id: null,
      code: "",
      nomFrancais: "",
      nomLatin: "",
      classeId: undefined,
    },
  });

  // Retrieve the existing species info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: ESPECE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(especeId!),
    },
    pause: !especeId,
  });

  const [{ data: dataClasses, error: errorClasses, fetching: fetchingClasses }] = useQuery({
    query: ALL_CLASSES_QUERY,
    variables: {
      orderBy: "libelle",
      sortOrder: "asc",
    },
  });

  const [_, upsertEspece] = useMutation(UPSERT_ESPECE);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.espece) {
      reset({
        id: data.espece.id,
        code: data.espece.code,
        nomFrancais: data.espece.nomFrancais,
        nomLatin: data.espece.nomLatin,
        classeId: data.espece.classe.id,
      });
    }
  }, [data?.espece, reset]);

  useEffect(() => {
    if (error || errorClasses) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, errorClasses, displayNotification, t]);

  const onSubmit: SubmitHandler<UpsertEspeceInput> = (data) => {
    const { id, ...restData } = data;
    upsertEspece({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertEspece) {
          displayNotification({
            type: "success",
            message: t("retrieveGenericSaveSuccess"),
          });
          navigate("..");
        }
        if (error) {
          if (getOucaError(error) === "OUCA0004") {
            displayNotification({
              type: "error",
              message: t("speciesAlreadyExistingError"),
            });
          } else {
            displayNotification({
              type: "error",
              message: t("retrieveGenericSaveError"),
            });
          }
        }
      })
      .catch(() => {
        displayNotification({
          type: "error",
          message: t("retrieveGenericSaveError"),
        });
      });
  };

  return (
    <>
      <ManageTopBar title={t("species")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <FormSelect
                name="classeId"
                label={t("speciesClass")}
                control={control}
                rules={{
                  required: true,
                }}
                data={dataClasses?.classes?.data}
                renderValue={({ libelle }) => libelle}
              />

              <TextInput
                label={t("speciesCode")}
                type="text"
                required
                {...register("code", {
                  required: t("requiredFieldError"),
                })}
              />
              <TextInput
                label={t("localizedName")}
                type="text"
                required
                {...register("nomFrancais", {
                  required: t("requiredFieldError"),
                })}
              />
              <TextInput
                label={t("scientificName")}
                type="text"
                required
                {...register("nomLatin", {
                  required: t("requiredFieldError"),
                })}
              />

              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={fetching || fetchingClasses || !isValid}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default EspeceEdit;

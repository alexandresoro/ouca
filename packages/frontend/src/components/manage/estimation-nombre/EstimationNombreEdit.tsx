import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertEstimationNombreMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import Checkbox from "../../common/styled/Checkbox";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { ESTIMATION_NOMBRE_QUERY, UPSERT_ESTIMATION_NOMBRE } from "./EstimationNombreManageQueries";

type EstimationNombreEditProps = {
  isEditionMode: boolean;
};

type UpsertEstimationNombreInput = Pick<UpsertEstimationNombreMutationVariables, "id"> &
  UpsertEstimationNombreMutationVariables["data"];

const EstimationNombreEdit: FunctionComponent<EstimationNombreEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: estimationNombreId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    setValue,
    reset,
    handleSubmit,
  } = useForm<UpsertEstimationNombreInput>();

  // Retrieve the existing estimate of numbers info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: ESTIMATION_NOMBRE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(estimationNombreId!),
    },
    pause: !estimationNombreId,
  });

  const [_, upsertEstimationNombre] = useMutation(UPSERT_ESTIMATION_NOMBRE);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.estimationNombre) {
      setValue("id", data.estimationNombre?.id);
      setValue("libelle", data.estimationNombre?.libelle);
      setValue("nonCompte", data.estimationNombre.nonCompte);
    }
  }, [data?.estimationNombre, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const title = isEditionMode ? t("numberPrecisionEditionTitle") : t("numberPrecisionCreationTitle");

  const onSubmit: SubmitHandler<UpsertEstimationNombreInput> = (data) => {
    const { id, ...restData } = data;
    upsertEstimationNombre({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertEstimationNombre) {
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
              message: t("numberPrecisionAlreadyExistingError"),
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
      <ManageTopBar title={t("numberPrecisions")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput
                label={t("label")}
                type="text"
                required
                defaultValue=""
                hasError={!!errors?.libelle}
                helperMessage={errors?.libelle?.message ?? ""}
                {...register("libelle", {
                  required: t("requiredFieldError"),
                })}
              />
              <Checkbox label={t("undefinedNumber")} defaultValue="" {...register("nonCompte")} />
              <EntityUpsertFormActionButtons onCancelClick={() => navigate("..")} disabled={fetching} />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default EstimationNombreEdit;

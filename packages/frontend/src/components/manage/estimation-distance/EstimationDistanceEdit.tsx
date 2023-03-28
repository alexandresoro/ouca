import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertEstimationDistanceMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { ESTIMATION_DISTANCE_QUERY, UPSERT_ESTIMATION_DISTANCE } from "./EstimationDistanceManageQueries";

type EstimationDistanceEditProps = {
  isEditionMode: boolean;
};

type UpsertEstimationDistanceInput = Pick<UpsertEstimationDistanceMutationVariables, "id"> & UpsertEstimationDistanceMutationVariables["data"];

const EstimationDistanceEdit: FunctionComponent<EstimationDistanceEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: estimationDistanceId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertEstimationDistanceInput>({
    defaultValues: {
      id: null,
      libelle: ""
    }
  });

  // Retrieve the existing distance precision info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: ESTIMATION_DISTANCE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(estimationDistanceId!),
    },
    pause: !estimationDistanceId,
  });

  const [_, upsertEstimationDistance] = useMutation(UPSERT_ESTIMATION_DISTANCE);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.estimationDistance) {
      reset({
        id: data.estimationDistance.id,
        libelle: data.estimationDistance.libelle
      })
    }
  }, [data?.estimationDistance, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const title = isEditionMode ? t("distancePrecisionEditionTitle") : t("distancePrecisionCreationTitle");

  const onSubmit: SubmitHandler<UpsertEstimationDistanceInput> = (data) => {
    const { id, ...restData } = data;
    upsertEstimationDistance({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertEstimationDistance) {
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
              message: t("distancePrecisionAlreadyExistingError"),
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
      <ManageTopBar title={t("distancePrecisions")} showButtons={false} />
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
                {...register("libelle", {
                  required: true,
                })}
              />
              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={fetching || !isValid}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default EstimationDistanceEdit;

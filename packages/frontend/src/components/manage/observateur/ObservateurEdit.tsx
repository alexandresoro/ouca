import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertObservateurMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { OBSERVATEUR_QUERY, UPSERT_OBSERVATEUR } from "./ObservateurManageQueries";

type ObservateurEditProps = {
  isEditionMode: boolean;
};

type ObservateurUpsertInputs = Pick<UpsertObservateurMutationVariables, "id"> &
  UpsertObservateurMutationVariables["data"];

const ObservateurEdit: FunctionComponent<ObservateurEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: observateurId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<ObservateurUpsertInputs>({
    defaultValues: {
      id: null,
      libelle: "",
    },
  });

  // Retrieve the existing observer info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: OBSERVATEUR_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(observateurId!),
    },
    pause: !observateurId,
  });

  const [_, upsertObservateur] = useMutation(UPSERT_OBSERVATEUR);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.observateur) {
      reset({
        id: data.observateur.id,
        libelle: data.observateur.libelle,
      });
    }
  }, [data?.observateur, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const title = isEditionMode ? t("observerEditionTitle") : t("observerCreationTitle");

  const onSubmit: SubmitHandler<ObservateurUpsertInputs> = (data) => {
    const { id, ...restData } = data;
    upsertObservateur({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertObservateur) {
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
              message: t("observerAlreadyExistingError"),
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
      <ManageTopBar title={t("observers")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput
                label={t("label")}
                type="text"
                required
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

export default ObservateurEdit;

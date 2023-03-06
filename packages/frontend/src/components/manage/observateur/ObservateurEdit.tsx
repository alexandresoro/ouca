import { Save, X } from "@styled-icons/boxicons-regular";
import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import TextInput from "../../../components/common/TextInput";
import { graphql } from "../../../gql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import { type EntityWithLibelleInputs } from "../common/entity-types";
import ManageTopBar from "../common/ManageTopBar";

const OBSERVATEUR_QUERY = graphql(`
  query GetObservateurIdInfo($id: Int!) {
    observateur(id: $id) {
      id
      libelle
    }
  }
`);

const OBSERVATEUR_UPSERT = graphql(`
  mutation ObservateurUpsert($id: Int, $data: InputObservateur!) {
    upsertObservateur(id: $id, data: $data) {
      id
      libelle
    }
  }
`);

type ObservateurEditProps = {
  isEditionMode: boolean;
};

type ObservateurUpsertInputs = EntityWithLibelleInputs & { id?: number };

const ObservateurEdit: FunctionComponent<ObservateurEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: observateurId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm<ObservateurUpsertInputs>();

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

  const [_, upsertObservateur] = useMutation(OBSERVATEUR_UPSERT);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.observateur) {
      setValue("id", data?.observateur?.id);
      setValue("libelle", data?.observateur?.libelle);
    }
  }, [data?.observateur, setValue]);

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
                defaultValue=""
                helperMessage={errors?.libelle?.message ?? ""}
                className={`input input-bordered ${errors?.libelle ? "input-error" : "input-primary"}`}
                {...register("libelle", {
                  required: t("requiredFieldError"),
                })}
              />

              <div className="card-actions justify-end">
                <button className="btn btn-secondary" onClick={() => navigate("..")}>
                  <X className="h-6 mr-1" />
                  {t("cancel")}
                </button>
                <button className="btn btn-primary" disabled={fetching} type="submit">
                  <Save className="h-6 mr-1" />
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default ObservateurEdit;

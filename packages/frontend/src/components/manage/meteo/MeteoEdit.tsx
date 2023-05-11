import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertMeteoMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { METEO_QUERY, UPSERT_METEO } from "./MeteoManageQueries";

type MeteoEditProps = {
  title: string;
};

type UpsertMeteoInput = Pick<UpsertMeteoMutationVariables, "id"> & UpsertMeteoMutationVariables["data"];

const MeteoEdit: FunctionComponent<MeteoEditProps> = (props) => {
  const { title } = props;
  const { id: meteoId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertMeteoInput>({
    defaultValues: {
      id: null,
      libelle: "",
    },
  });

  // Retrieve the existing weather info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: METEO_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(meteoId!),
    },
    pause: !meteoId,
  });

  const [_, upsertMeteo] = useMutation(UPSERT_METEO);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.meteo) {
      reset({
        id: data.meteo.id,
        libelle: data.meteo.libelle,
      });
    }
  }, [data?.meteo, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const onSubmit: SubmitHandler<UpsertMeteoInput> = (data) => {
    const { id, ...restData } = data;
    upsertMeteo({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertMeteo) {
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
              message: t("weatherAlreadyExistingError"),
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
      <ManageTopBar title={t("weathers")} showButtons={false} />
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

export default MeteoEdit;

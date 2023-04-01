import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertMilieuMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { MILIEU_QUERY, UPSERT_MILIEU } from "./MilieuManageQueries";

type MilieuEditProps = {
  isEditionMode: boolean;
};

type UpsertMilieuInput = Pick<UpsertMilieuMutationVariables, "id"> & UpsertMilieuMutationVariables["data"];

const MilieuEdit: FunctionComponent<MilieuEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: milieuId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertMilieuInput>({
    defaultValues: {
      id: null,
      code: "",
      libelle: "",
    },
  });

  // Retrieve the existing age info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: MILIEU_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(milieuId!),
    },
    pause: !milieuId,
  });

  const [_, upsertMilieu] = useMutation(UPSERT_MILIEU);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.milieu) {
      reset({
        id: data.milieu.id,
        code: data.milieu.code,
        libelle: data.milieu.libelle,
      });
    }
  }, [data?.milieu, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const title = isEditionMode ? t("environmentEditionTitle") : t("environmentCreationTitle");

  const onSubmit: SubmitHandler<UpsertMilieuInput> = (data) => {
    const { id, ...restData } = data;
    upsertMilieu({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertMilieu) {
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
              message: t("environmentAlreadyExistingError"),
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
      <ManageTopBar title={t("environments")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput
                label={t("code")}
                type="text"
                required
                {...register("code", {
                  required: true,
                })}
              />

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

export default MilieuEdit;

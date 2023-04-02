import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertAgeMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { AGE_QUERY, UPSERT_AGE } from "./AgeManageQueries";

type AgeEditProps = {
  isEditionMode: boolean;
};

type UpsertAgeInput = Pick<UpsertAgeMutationVariables, "id"> & UpsertAgeMutationVariables["data"];

const AgeEdit: FunctionComponent<AgeEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: ageId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertAgeInput>({
    defaultValues: {
      id: null,
      libelle: "",
    },
  });

  // Retrieve the existing age info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: AGE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(ageId!),
    },
    pause: !ageId,
  });

  const [_, upsertAge] = useMutation(UPSERT_AGE);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.age) {
      reset({
        id: data.age.id,
        libelle: data.age.libelle,
      });
    }
  }, [data?.age, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const title = isEditionMode ? t("ageEditionTitle") : t("ageCreationTitle");

  const onSubmit: SubmitHandler<UpsertAgeInput> = (data) => {
    const { id, ...restData } = data;
    upsertAge({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertAge) {
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
              message: t("ageAlreadyExistingError"),
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
      <ManageTopBar title={t("ages")} showButtons={false} />
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

export default AgeEdit;

import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertClasseMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { CLASSE_QUERY, UPSERT_CLASSE } from "./ClasseManageQueries";

type ClasseEditProps = {
  title: string;
};

type UpsertClasseInput = Pick<UpsertClasseMutationVariables, "id"> & UpsertClasseMutationVariables["data"];

const ClasseEdit: FunctionComponent<ClasseEditProps> = (props) => {
  const { title } = props;
  const { id: classeId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertClasseInput>({
    defaultValues: {
      id: null,
      libelle: "",
    },
  });

  // Retrieve the existing class info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: CLASSE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(classeId!),
    },
    pause: !classeId,
  });

  const [_, upsertClasse] = useMutation(UPSERT_CLASSE);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.classe) {
      reset({
        id: data.classe.id,
        libelle: data.classe.libelle,
      });
    }
  }, [data?.classe, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const onSubmit: SubmitHandler<UpsertClasseInput> = (data) => {
    const { id, ...restData } = data;
    upsertClasse({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertClasse) {
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
              message: t("speciesClassAlreadyExistingError"),
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
      <ManageTopBar title={t("speciesClasses")} showButtons={false} />
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

export default ClasseEdit;

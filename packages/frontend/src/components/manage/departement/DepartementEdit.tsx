import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertDepartementMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { DEPARTEMENT_QUERY, UPSERT_DEPARTEMENT } from "./DepartementManageQueries";

type DepartementEditProps = {
  isEditionMode: boolean;
};

type UpsertDepartementInput = Pick<UpsertDepartementMutationVariables, "id"> &
  UpsertDepartementMutationVariables["data"];

const DepartementEdit: FunctionComponent<DepartementEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: departementId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    formState: { isValid },
    setValue,
    handleSubmit,
  } = useForm<UpsertDepartementInput>({
    defaultValues: {
      id: null,
      code: "",
    },
  });

  // Retrieve the existing department info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: DEPARTEMENT_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(departementId!),
    },
    pause: !departementId,
  });

  const [_, upsertDepartement] = useMutation(UPSERT_DEPARTEMENT);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.departement) {
      setValue("id", data.departement?.id);
      setValue("code", data.departement?.code);
    }
  }, [data?.departement, setValue]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const title = isEditionMode ? t("departmentEditionTitle") : t("departmentCreationTitle");

  const onSubmit: SubmitHandler<UpsertDepartementInput> = (data) => {
    const { id, ...restData } = data;
    upsertDepartement({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertDepartement) {
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
              message: t("departmentAlreadyExistingError"),
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
      <ManageTopBar title={t("departments")} showButtons={false} />
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
                  required: t("requiredFieldError"),
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

export default DepartementEdit;

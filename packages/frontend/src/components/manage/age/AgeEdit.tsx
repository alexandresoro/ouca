import { zodResolver } from "@hookform/resolvers/zod";
import { getAgeResponse, upsertAgeInput, upsertAgeResponse, type UpsertAgeInput } from "@ou-ca/common/api/age";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";

type AgeEditProps = {
  isEditionMode: boolean;
};

const AgeEdit: FunctionComponent<AgeEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: ageId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const {
    register,
    formState: { isValid, isDirty },
    reset,
    handleSubmit,
  } = useForm<UpsertAgeInput>({
    defaultValues: {
      libelle: "",
    },
    resolver: zodResolver(upsertAgeInput),
  });

  // Retrieve the existing age info in edit mode
  const [enabledQuery, setEnabledQuery] = useState(ageId != null);
  const { isFetching } = useApiQuery(
    { path: `/age/${ageId!}`, schema: getAgeResponse },
    {
      onSuccess: (age) => {
        setEnabledQuery(false);
        reset({
          libelle: age.libelle,
        });
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("retrieveGenericError"),
        });
      },
      enabled: enabledQuery,
    }
  );

  const { mutate } = useApiMutation(
    {
      schema: upsertAgeResponse,
    },
    {
      onSuccess: (updatedAge) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/age/${updatedAge.id}`], updatedAge);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
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
      },
    }
  );

  const title = isEditionMode ? t("ageEditionTitle") : t("ageCreationTitle");

  const onSubmit: SubmitHandler<UpsertAgeInput> = (input) => {
    if (ageId) {
      mutate({ path: `/age/${ageId}`, method: "PUT", body: input });
    } else {
      mutate({ path: "/age", method: "POST", body: input });
    }
  };

  return (
    <>
      <ManageTopBar title={t("ages")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextInput label={t("label")} type="text" required {...register("libelle")} />

              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={isFetching || !isValid || !isDirty}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default AgeEdit;

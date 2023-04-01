import { CERTAIN, POSSIBLE, PROBABLE } from "@ou-ca/common/types/nicheur.model";
import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type Nicheur, type UpsertComportementMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { COMPORTEMENT_QUERY, UPSERT_COMPORTEMENT } from "./ComportementManageQueries";

type ComportementEditProps = {
  isEditionMode: boolean;
};

type UpsertComportementInput = Pick<UpsertComportementMutationVariables, "id"> &
  UpsertComportementMutationVariables["data"];

const ComportementEdit: FunctionComponent<ComportementEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: comportementId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertComportementInput>({
    defaultValues: {
      id: null,
      code: "",
      libelle: "",
      nicheur: null,
    },
  });

  // Retrieve the existing age info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: COMPORTEMENT_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(comportementId!),
    },
    pause: !comportementId,
  });

  const [_, upsertComportement] = useMutation(UPSERT_COMPORTEMENT);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.comportement) {
      reset({
        id: data.comportement.id,
        code: data.comportement.code,
        libelle: data.comportement.libelle,
        nicheur: data.comportement.nicheur,
      });
    }
  }, [data?.comportement, reset]);

  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, displayNotification, t]);

  const title = isEditionMode ? t("behaviorEditionTitle") : t("behaviorCreationTitle");

  const breedingStatuses = [
    {
      label: "---",
      value: null,
    },
    {
      label: t("breedingStatus.possible"),
      value: POSSIBLE,
    },
    {
      label: t("breedingStatus.probable"),
      value: PROBABLE,
    },
    {
      label: t("breedingStatus.certain"),
      value: CERTAIN,
    },
  ] satisfies { label: string; value: Nicheur | null }[];

  const onSubmit: SubmitHandler<UpsertComportementInput> = (data) => {
    const { id, ...restData } = data;
    upsertComportement({
      id: id ?? undefined,
      data: restData,
    })
      .then(({ data, error }) => {
        if (data?.upsertComportement) {
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
              message: t("behaviorAlreadyExistingError"),
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
      <ManageTopBar title={t("behaviors")} showButtons={false} />
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

              <FormSelect
                name="nicheur"
                label={t("breeding")}
                control={control}
                data={breedingStatuses}
                by="value"
                renderValue={({ label }) => label}
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

export default ComportementEdit;

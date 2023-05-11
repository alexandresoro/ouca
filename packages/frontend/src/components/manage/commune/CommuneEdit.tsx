import { useEffect, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertCommuneMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { ALL_DEPARTMENTS, COMMUNE_QUERY, UPSERT_COMMUNE } from "./CommuneManageQueries";

type CommuneEditProps = {
  title: string;
};

type UpsertCommuneInput = Pick<UpsertCommuneMutationVariables, "id"> &
  Omit<UpsertCommuneMutationVariables["data"], "code"> & { code: string };

const CommuneEdit: FunctionComponent<CommuneEditProps> = (props) => {
  const { title } = props;
  const { id: communeId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertCommuneInput>({
    defaultValues: {
      id: null,
      code: "",
      nom: "",
      departementId: undefined,
    },
  });

  // Retrieve the existing towns info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: COMMUNE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(communeId!),
    },
    pause: !communeId,
  });

  const [{ data: dataDepartements, error: errorDepartements, fetching: fetchingDepartements }] = useQuery({
    query: ALL_DEPARTMENTS,
    variables: {
      orderBy: "code",
      sortOrder: "asc",
    },
  });

  const [_, upsertCommune] = useMutation(UPSERT_COMMUNE);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.commune) {
      reset({
        id: data.commune.id,
        code: `${data.commune.code}`,
        nom: data.commune.nom,
        departementId: data.commune.departement.id,
      });
    }
  }, [data?.commune, reset]);

  useEffect(() => {
    if (error || errorDepartements) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, errorDepartements, displayNotification, t]);

  const onSubmit: SubmitHandler<UpsertCommuneInput> = (data) => {
    const { id, code, ...restData } = data;
    upsertCommune({
      id: id ?? undefined,
      data: {
        ...restData,
        code: parseInt(code),
      },
    })
      .then(({ data, error }) => {
        if (data?.upsertCommune) {
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
              message: t("townAlreadyExistingError"),
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
      <ManageTopBar title={t("towns")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <FormSelect
                name="departementId"
                label={t("department")}
                control={control}
                rules={{
                  required: true,
                }}
                data={dataDepartements?.departements?.data}
                renderValue={({ code }) => code}
              />

              <TextInput
                label={t("townCode")}
                type="text"
                required
                {...register("code", {
                  required: t("requiredFieldError"),
                  validate: {
                    isNumber: (v) => /^\d+$/.test(v),
                    isPositive: (v) => parseInt(v) > 0,
                  },
                })}
              />
              <TextInput
                label={t("townName")}
                type="text"
                required
                {...register("nom", {
                  required: t("requiredFieldError"),
                })}
              />

              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={fetching || fetchingDepartements || !isValid}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default CommuneEdit;

import { useEffect, type FunctionComponent } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type UpsertLieuDitMutationVariables } from "../../../gql/graphql";
import useSnackbar from "../../../hooks/useSnackbar";
import { getOucaError } from "../../../utils/ouca-error-extractor";
import FormSelect from "../../common/form/FormSelect";
import TextInput from "../../common/styled/TextInput";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";
import ManageTopBar from "../common/ManageTopBar";
import { ALL_DEPARTMENTS } from "../commune/CommuneManageQueries";
import { ALL_COMMUNES_OF_DEPARTEMENT, LIEU_DIT_QUERY, UPSERT_LIEU_DIT } from "./LieuDitManageQueries";

type LieuDitEditProps = {
  isEditionMode: boolean;
};

type UpsertLieuDitInput = Pick<UpsertLieuDitMutationVariables, "id"> &
  Omit<
    UpsertLieuDitMutationVariables["data"],
    "communeId" | "latitude" | "longitude" | "altitude" | "coordinatesSystem"
  > & {
    communeId: number | undefined;
    latitude: string | undefined;
    longitude: string | undefined;
    altitude: string | undefined;
    departmentId: number | undefined;
  };

const LieuDitEdit: FunctionComponent<LieuDitEditProps> = (props) => {
  const { isEditionMode } = props;
  const { id: lieuDitId } = useParams();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    setValue,
    getValues,
    control,
    formState: { isValid },
    reset,
    handleSubmit,
  } = useForm<UpsertLieuDitInput>({
    defaultValues: {
      id: null,
      nom: "",
      altitude: undefined,
      latitude: undefined,
      longitude: undefined,
      communeId: undefined,
      departmentId: undefined,
    },
  });
  const selectedDepartementId = useWatch({ control, name: "departmentId" });

  // Retrieve the existing localities info in edit mode
  const [{ data, error, fetching }] = useQuery({
    query: LIEU_DIT_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(lieuDitId!),
    },
    pause: !lieuDitId,
  });

  const [{ data: dataDepartements, error: errorDepartements, fetching: fetchingDepartements }] = useQuery({
    query: ALL_DEPARTMENTS,
    variables: {
      orderBy: "code",
      sortOrder: "asc",
    },
  });

  const [{ data: dataTowns, error: errorTowns, fetching: fetchingTowns }] = useQuery({
    query: ALL_COMMUNES_OF_DEPARTEMENT,
    variables: {
      departmentId: selectedDepartementId,
      orderBy: "code",
      sortOrder: "asc",
    },
    pause: !selectedDepartementId,
  });

  // When the list of towns change, reset the selection if no longer in the new list
  useEffect(() => {
    const selectedCommuneId = getValues("communeId");
    if (selectedCommuneId && !dataTowns?.communes?.data?.map(({ id }) => id).includes(selectedCommuneId)) {
      setValue("communeId", undefined, { shouldValidate: true });
    }
  }, [dataTowns, getValues]);

  const [_, upsertLieuDit] = useMutation(UPSERT_LIEU_DIT);

  const { displayNotification } = useSnackbar();

  useEffect(() => {
    if (data?.lieuDit) {
      reset({
        id: data.lieuDit.id,
        nom: data.lieuDit.nom,
        altitude: `${data.lieuDit.altitude}`,
        latitude: `${data.lieuDit.latitude}`,
        longitude: `${data.lieuDit.longitude}`,
        communeId: data.lieuDit.commune.id,
        departmentId: data.lieuDit.commune.departement.id,
      });
    }
  }, [data?.lieuDit, reset]);

  useEffect(() => {
    if (error || errorTowns || errorDepartements) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [error, errorTowns, errorDepartements, displayNotification, t]);

  const title = isEditionMode ? t("localityEditionTitle") : t("localityCreationTitle");

  const onSubmit: SubmitHandler<UpsertLieuDitInput> = (data) => {
    const { id, communeId, latitude, longitude, altitude, departmentId, ...restData } = data;
    upsertLieuDit({
      id: id ?? undefined,
      data: {
        ...restData,
        communeId: communeId!,
        latitude: parseFloat(latitude!),
        longitude: parseFloat(longitude!),
        altitude: parseInt(altitude!),
        coordinatesSystem: "gps",
      },
    })
      .then(({ data, error }) => {
        if (data?.upsertLieuDit) {
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
              message: t("localityAlreadyExistingError"),
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
      <ManageTopBar title={t("localities")} showButtons={false} />
      <ContentContainerLayout>
        <div className="card border-2 border-primary bg-base-100 text-base-content shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <h2 className="card-title my-4">{title}</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex gap-4">
                <FormSelect
                  selectClassName="basis-1/4"
                  name="departmentId"
                  label={t("department")}
                  control={control}
                  rules={{
                    required: true,
                  }}
                  data={dataDepartements?.departements?.data}
                  renderValue={({ code }) => code}
                />

                <FormSelect
                  selectClassName="basis-3/4"
                  name="communeId"
                  label={t("town")}
                  control={control}
                  rules={{
                    required: true,
                  }}
                  data={dataTowns?.communes?.data}
                  renderValue={({ code, nom }) => `${code} - ${nom}`}
                />
              </div>

              <TextInput
                label={t("localityName")}
                type="text"
                required
                {...register("nom", {
                  required: t("requiredFieldError"),
                })}
              />

              <h3 className="font-semibold mt-6">{t("localityCoordinates")}</h3>

              <div className="flex gap-4">
                <TextInput
                  textInputClassName="basis-1/3"
                  label={t("latitudeWithUnit")}
                  type="text"
                  required
                  {...register("latitude", {
                    required: t("requiredFieldError"),
                    validate: {
                      isNumber: (v) => v && /^-?\d+(\.\d+)?$/.test(v),
                    },
                  })}
                />

                <TextInput
                  textInputClassName="basis-1/3"
                  label={t("longitudeWithUnit")}
                  type="text"
                  required
                  {...register("longitude", {
                    required: t("requiredFieldError"),
                    validate: {
                      isNumber: (v) => v && /^-?\d+(\.\d+)?$/.test(v),
                    },
                  })}
                />

                <TextInput
                  textInputClassName="basis-1/3"
                  label={t("altitudeWithUnit")}
                  type="text"
                  required
                  {...register("altitude", {
                    required: t("requiredFieldError"),
                    validate: {
                      isNumber: (v) => v && /^-?\d+$/.test(v),
                    },
                  })}
                />
              </div>

              <EntityUpsertFormActionButtons
                className="mt-6"
                onCancelClick={() => navigate("..")}
                disabled={fetching || fetchingTowns || fetchingDepartements || !isValid}
              />
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default LieuDitEdit;

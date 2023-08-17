import { getLocalityResponse, upsertLocalityResponse, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { getTownResponse } from "@ou-ca/common/api/town";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import LieuDitEdit from "./LieuDitEdit";

type LieuDitUpdateProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const LieuDitUpdate: FunctionComponent<LieuDitUpdateProps> = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/localities/${id!}`, schema: getLocalityResponse },
    {
      enabled: enabledQuery,
    }
  );

  useEffect(() => {
    setEnabledQuery(false);
  }, [data]);

  const [enabledQueryTown, setEnabledQueryTown] = useState(true);
  const {
    data: dataTown,
    isLoading: isLoadingTown,
    isError: isErrorTown,
  } = useApiQuery(
    { path: `/towns/${data?.townId ?? ""}`, schema: getTownResponse },
    {
      enabled: enabledQueryTown && data?.townId != null,
    }
  );

  useEffect(() => {
    if (dataTown) {
      setEnabledQueryTown(false);
    }
  }, [dataTown]);

  useEffect(() => {
    if (isError || isErrorTown) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [isError, isErrorTown, displayNotification, t]);

  const { mutate } = useApiMutation(
    {
      path: `/localities/${id!}`,
      method: "PUT",
      schema: upsertLocalityResponse,
    },
    {
      onSuccess: (updatedLocality) => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        queryClient.setQueryData(["API", `/locality/${updatedLocality.id}`], updatedLocality);
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
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
      },
    }
  );

  const departmentId = dataTown?.departmentId;

  const onSubmit: SubmitHandler<UpsertLocalityInput> = (input) => {
    mutate({ body: input });
  };

  const defaultValues =
    data != null
      ? ({
          nom: data.nom,
          townId: data.townId,
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude,
          altitude: data.coordinates.altitude,
        } satisfies UpsertLocalityInput)
      : undefined;

  if (!id) {
    return null;
  }

  return (
    <>
      {!isLoading && !isLoadingTown && !isError && data && departmentId != null && (
        <LieuDitEdit
          title={t("localityEditionTitle")}
          defaultValues={defaultValues}
          defaultDepartmentId={departmentId}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default LieuDitUpdate;

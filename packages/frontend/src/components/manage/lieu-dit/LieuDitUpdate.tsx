import { getLocalityResponse, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { getTownResponse } from "@ou-ca/common/api/town";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import LieuDitEdit from "./LieuDitEdit";

type LieuDitUpdateProps = {
  id: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertLocalityInput) => void;
};

const LieuDitUpdate: FunctionComponent<LieuDitUpdateProps> = ({ id, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data, isLoading, isError } = useApiQuery(
    { path: `/localities/${id}`, schema: getLocalityResponse },
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

  const departmentId = dataTown?.departmentId;

  const handleSubmit: SubmitHandler<UpsertLocalityInput> = (input) => {
    onSubmit(id, input);
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

  return (
    <>
      {!isLoading && !isLoadingTown && !isError && data && departmentId != null && (
        <LieuDitEdit
          defaultValues={defaultValues}
          defaultDepartmentId={departmentId}
          onCancel={onCancel}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default LieuDitUpdate;

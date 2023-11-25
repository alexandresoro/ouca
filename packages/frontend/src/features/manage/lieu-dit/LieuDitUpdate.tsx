import { type Locality } from "@ou-ca/common/api/entities/locality";
import { type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { getTownResponse } from "@ou-ca/common/api/town";
import { useEffect, useState, type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import LieuDitEdit from "./LieuDitEdit";

type LieuDitUpdateProps = {
  locality: Locality;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertLocalityInput) => void;
};

const LieuDitUpdate: FunctionComponent<LieuDitUpdateProps> = ({ locality, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const [enabledQueryTown, setEnabledQueryTown] = useState(true);
  const {
    data: dataTown,
    isLoading: isLoadingTown,
    isError: isErrorTown,
  } = useApiQuery(
    { path: `/towns/${locality.townId}`, schema: getTownResponse },
    {
      enabled: enabledQueryTown,
    }
  );

  useEffect(() => {
    if (dataTown) {
      setEnabledQueryTown(false);
    }
  }, [dataTown]);

  useEffect(() => {
    if (isErrorTown) {
      displayNotification({
        type: "error",
        message: t("retrieveGenericError"),
      });
    }
  }, [isErrorTown, displayNotification, t]);

  const departmentId = dataTown?.departmentId;

  const handleSubmit: SubmitHandler<UpsertLocalityInput> = (input) => {
    onSubmit(locality.id, input);
  };

  const defaultValues =
    locality != null
      ? ({
          nom: locality.nom,
          townId: locality.townId,
          latitude: locality.coordinates.latitude,
          longitude: locality.coordinates.longitude,
          altitude: locality.coordinates.altitude,
        } satisfies UpsertLocalityInput)
      : undefined;

  return (
    <>
      {!isLoadingTown && departmentId != null && (
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

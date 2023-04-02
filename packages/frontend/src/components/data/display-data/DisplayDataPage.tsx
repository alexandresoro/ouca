import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "urql";
import DataForm from "../DataForm";
import { DONNEE_QUERY } from "./DisplayDataPageQueries";

const DisplayDataPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [{ data, error, fetching }] = useQuery({
    query: DONNEE_QUERY,
    requestPolicy: "network-only",
    variables: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: parseInt(id!),
    },
    pause: id == null,
  });

  if (fetching && !data) {
    return (
      <div className="flex justify-center items-center h-56">
        <progress className="progress progress-primary w-56"></progress>
      </div>
    );
  }

  if (error) {
    return <>{t("displayData.genericError")}</>;
  }

  if (data && !data.donnee?.donnee) {
    return <>{t("displayData.dataNotFound")}</>;
  }

  return (
    <>
      {JSON.stringify(data)}
      {data?.donnee?.donnee && <DataForm />}
    </>
  );
};

export default DisplayDataPage;

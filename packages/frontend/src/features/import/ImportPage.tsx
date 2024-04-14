import Select from "@components/base/select/Select";
import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import { IMPORT_TYPE, type ImportType } from "@ou-ca/common/import/import-types";
import { useApiImportStatusQuery } from "@services/api/import/api-import-queries";
import { useApiFetch } from "@services/api/useApiFetch";
import { capitalizeFirstLetter } from "@utils/capitalize-first-letter";
import { type ChangeEvent, type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import ImportStatusPanel from "./ImportStatusPanel";
import ImportEntriesPanel from "./entities/ImportEntriesPanel";

const getImportComponent = (importType: ImportType) => () => {
  switch (importType) {
    case "entry":
      return <ImportEntriesPanel />;
    default:
      return <></>;
  }
};

const ImportPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const canUseImport = user?.permissions.canImport;

  const [importType, setImportType] = useState<ImportType>(IMPORT_TYPE[0]);

  const [file, setFile] = useState<File>();
  const [importId, setImportId] = useState<string | null>(null);

  const [isImportOngoing, setIsImportOngoing] = useState(false);

  const { data: importStatus } = useApiImportStatusQuery(
    importId,
    {
      refreshInterval: (data) => {
        if (data?.status === "completed" || data?.status === "failed") {
          return 0;
        }

        return 1000;
      },
      onError: () => {
        setIsImportOngoing(false);
      },
      onSuccess: (data) => {
        if (data.status === "completed" || data.status === "failed") {
          setIsImportOngoing(false);
        }
      },
    },
    {
      paused: !importId,
    },
  );

  const submitImport = useApiFetch({
    path: `/uploads/${importType}`,
    method: "POST",
    schema: z.object({
      uploadId: z.string(),
    }),
    useApiPath: false,
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setImportId(null);
    }
  };

  const submitFile = async () => {
    if (!file) {
      return;
    }

    const data = new FormData();
    data.append("file", file);

    const response = await submitImport({
      body: data,
    });

    setImportId(response.uploadId);
    setIsImportOngoing(true);
  };

  if (!canUseImport) {
    return <Navigate to="/" replace={true} />;
  }

  // biome-ignore lint/style/useNamingConvention: <explanation>
  const ImportComponent = getImportComponent(importType);

  return (
    <ContentContainerLayout>
      <div className="card border-2 border-primary p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-3">{t("importPage.title")}</h2>
        <div className="flex gap-24 items-end">
          <div className="flex flex-grow max-w-3xl gap-6">
            <Select
              selectClassName="w-full max-w-xs !py-0"
              label={t("importPage.typeLabel")}
              data={[...IMPORT_TYPE]}
              value={importType}
              onChange={setImportType}
              renderValue={(value) => capitalizeFirstLetter(t(`importPage.type.${value}`))}
              disabled={isImportOngoing}
            />
            <label className="form-control w-full max-w-lg">
              <div className="label">
                <span className="label-text">{t("importPage.pickFileLabel")}</span>
              </div>
              <input
                disabled={isImportOngoing}
                type="file"
                className="file-input file-input-bordered"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <button
            className="btn btn-primary uppercase"
            type="button"
            onClick={() => submitFile()}
            disabled={!file || isImportOngoing}
          >
            {t("importPage.submit")}
          </button>
        </div>

        <ImportStatusPanel importType={importType} status={importStatus} isImportOngoing={isImportOngoing} />
      </div>

      <ImportComponent />
    </ContentContainerLayout>
  );
};

export default ImportPage;

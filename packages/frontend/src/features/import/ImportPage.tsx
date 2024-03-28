import type { ImportType } from "@ou-ca/common/import/import-types";
import { useFetchWithAuth } from "@services/api/useFetchWithAuth";
import { type ChangeEvent, type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const Test: FunctionComponent = () => {
  const { t } = useTranslation();

  const [importType, setImportType] = useState<ImportType>();

  const [file, setFile] = useState<File>();
  const [importId, setImportId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const submitImport = useFetchWithAuth({
    path: `/uploads/${importType}`,
    method: "POST",
    schema: z.object({
      uploadId: z.string(),
    }),
  });

  const getImportStatus = useFetchWithAuth({
    path: `/import-status/${importId}`,
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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
  };

  const refreshStatus = async () => {
    if (!importId) {
      return;
    }

    const status = await getImportStatus();

    setStatus(JSON.stringify(status));
  };

  return (
    <>
      <input type="file" onChange={handleFileChange} />
      <button className="btn" type="button" onClick={() => submitFile()}>
        {t("importPage.submit")}
      </button>
      <button className="btn" type="button" onClick={() => refreshStatus()}>
        Refresh status
      </button>
      {status}
    </>
  );
};

export default Test;

import { XCircle } from "@styled-icons/boxicons-regular";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const ErrorBoundary: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto mt-6">
      <div className="alert bg-error-content border-none">
        <XCircle className="h-6" />
        {t("genericError")}
      </div>
    </div>
  );
};

export default ErrorBoundary;

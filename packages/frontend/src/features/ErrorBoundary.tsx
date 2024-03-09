import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const ErrorBoundary: FunctionComponent = () => {
  const { t } = useTranslation();

  return <>{t("genericError")}</>;
};

export default ErrorBoundary;

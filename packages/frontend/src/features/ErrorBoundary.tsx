import { isSentryEnabledAtom } from "@services/sentry/sentry-atom";
import { useAtomValue } from "jotai";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const ErrorBoundary: FunctionComponent = () => {
  const { t } = useTranslation();

  const isSentryEnabled = useAtomValue(isSentryEnabledAtom);

  if (isSentryEnabled) {
    void import("../services/sentry/sentry").then(({ getErrorBoundary }) => {
      const SentryErrorBoundary = getErrorBoundary();
      // biome-ignore lint/complexity/noUselessFragments: <explanation>
      return <SentryErrorBoundary fallback={<>{t("genericError")}</>} showDialog />;
    });
  }

  return <>{t("genericError")}</>;
};

export default ErrorBoundary;

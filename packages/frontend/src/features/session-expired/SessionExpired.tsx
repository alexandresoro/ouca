import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oidc-context";

const SessionExpired: FunctionComponent = () => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { removeUser } = useAuth();

  const handleReconnect = async () => {
    await removeUser();
    window.location.replace("/");
  };

  return (
    <div className="flex h-[100dvh] justify-center items-center">
      <div className="flex flex-col gap-8 items-center">
        <span className="text-xl text-primary">{t("sessionExpired.description")}</span>
        <button type="button" className="btn btn-primary uppercase" onClick={handleReconnect}>
          {t("sessionExpired.reconnectButton")}
        </button>
      </div>
    </div>
  );
};

export default SessionExpired;

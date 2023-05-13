import { getSettingsResponse } from "@ou-ca/common/api/settings";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../hooks/api/useApiMutation";
import useApiQuery from "../../hooks/api/useApiQuery";

const NewAccount: FunctionComponent = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [enabledQuery, setEnabledQuery] = useState(true);
  const { data: userSettings, isLoading } = useApiQuery(
    {
      path: "/settings",
      schema: getSettingsResponse,
    },
    {
      retry: 0,
      refetchOnWindowFocus: false,
      enabled: enabledQuery,
    }
  );
  useEffect(() => {
    setEnabledQuery(false);
  }, [userSettings]);

  const { mutate } = useApiMutation(
    {
      method: "POST",
      path: "/user/create",
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["API", "/settings"]);

        // Redirect to settings page when account has been created
        navigate("/settings", { replace: true });
      },
    }
  );

  useEffect(() => {
    if (userSettings) {
      // User has tried to reach the creation page, but already has an account
      navigate("/", { replace: true });
    }
  }, [userSettings, navigate]);

  const onCreateAccountRequested = () => mutate({});

  if (isLoading) {
    return <progress className="progress progress-primary w-56" />;
  }

  return (
    <div className="hero h-[100dvh]">
      <div className="hero-content flex-col">
        <div>{t("newAccount.description")}</div>
        <div>{t("newAccount.descriptionAction")}</div>
        <button className="btn btn-primary" onClick={onCreateAccountRequested}>
          {t("newAccount.createAccountButton")}
        </button>
      </div>
    </div>
  );
};

export default NewAccount;

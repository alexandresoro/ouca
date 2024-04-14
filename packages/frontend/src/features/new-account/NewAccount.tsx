import { useApiMe } from "@services/api/me/api-me-queries";
import { useApiCreateAccount } from "@services/api/user/api-user-queries";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const NewAccount: FunctionComponent = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [isNewAccountRequested, setIsNewAccountRequested] = useState(false);

  const { isLoading } = useApiMe({
    revalidateIfStale: true,
    shouldRetryOnError: (err) => {
      // If we receive a 404, we don't want to retry as we assume the user doesn't exist
      return !(err instanceof FetchError && err.status === 404);
    },
    onSuccess: () => {
      // Retrieval of user data was successful, user exists
      // Redirect to settings page if it was thanks to the user trying to create an account
      // Otherwise, redirect to the home page
      navigate(isNewAccountRequested ? "/settings" : "/", { replace: true });
    },
  });

  const { trigger } = useApiCreateAccount();

  const onCreateAccountRequested = async () => {
    setIsNewAccountRequested(true);
    await trigger();
  };

  if (isLoading) {
    return <progress className="progress progress-primary w-56" />;
  }

  return (
    <div className="hero h-[100dvh]">
      <div className="hero-content flex-col">
        <div>{t("newAccount.description")}</div>
        <div>{t("newAccount.descriptionAction")}</div>
        <button type="button" className="btn btn-primary uppercase" onClick={onCreateAccountRequested}>
          {t("newAccount.createAccountButton")}
        </button>
      </div>
    </div>
  );
};

export default NewAccount;

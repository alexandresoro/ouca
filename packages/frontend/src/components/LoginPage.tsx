import { TextField } from "@mui/material";
import { useContext, type FunctionComponent } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import GreenBird from "../assets/img/green-bird.svg";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { type UserLoginInput } from "../gql/graphql";

const USER_LOGIN_MUTATION = graphql(`
  mutation UserLogin($loginData: UserLoginInput!) {
    userLogin(loginData: $loginData) {
      id
      username
      firstName
      lastName
      role
    }
  }
`);

type LocationState = {
  from: Location;
};

const LoginPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { setUserInfo } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  const from = (location.state as LocationState)?.from?.pathname || "/";

  const {
    control,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm<UserLoginInput>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "all",
  });

  const [{ fetching }, sendUserLogin] = useMutation(USER_LOGIN_MUTATION);

  const onSubmit: SubmitHandler<UserLoginInput> = (loginData) => {
    sendUserLogin({
      loginData,
    })
      .then(({ data, error }) => {
        if (data?.userLogin && !error) {
          // Successful login
          setUserInfo(data.userLogin);

          // Navigate to home page
          navigate(from, { replace: true });
        } else {
          setError("username", {
            type: "manual",
            message: t("loginFailedMessage"),
          });
        }
      })
      .catch(() => {
        setError("username", {
          type: "manual",
          message: t("loginFailedMessage"),
        });
      });
  };

  return (
    <div className="container xl:max-w-screen-xl mx-auto min-h-screen flex flex-col lg:pt-10 px-6 py-4 lg:gap-4 gap-2">
      <img src={GreenBird} alt="" className="block mx-auto w-24 h-24 md:w-44 md:h-44 lg:w-56 lg:h-56" loading="lazy" />
      <h1 className="font-normal text-center lg:text-3xl md:text-2xl sm:text-xl text-lg">{t("welcomeText")}</h1>
      <form
        className="card items-center container mx-auto bg-base-200 dark:bg-neutral max-w-screen-md p-4 justify-center mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          name="username"
          control={control}
          rules={{
            required: t("loginRequiredLabel"),
          }}
          render={({ field }) => (
            <TextField
              className="grow basis-auto max-w-[32ch]"
              label={t("loginLabel")}
              variant="standard"
              required
              fullWidth
              error={!!errors?.username}
              helperText={errors?.username?.message ?? " "}
              {...field}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          rules={{
            required: t("passwordRequiredLabel"),
          }}
          render={({ field }) => (
            <TextField
              className="grow basis-auto max-w-[32ch]"
              label={t("passwordLabel")}
              type="password"
              variant="standard"
              required
              fullWidth
              error={!!errors?.password}
              helperText={errors?.password?.message ?? " "}
              {...field}
            />
          )}
        />
        <button className={`btn btn-primary sm:btn-wide mt-8 mb-4 ${fetching ? "loading" : ""}`} type="submit">
          {t("loginButton")}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

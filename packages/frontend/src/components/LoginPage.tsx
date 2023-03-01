import { useContext, type FunctionComponent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import GreenBird from "../assets/img/green-bird.svg";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { type UserLoginInput } from "../gql/graphql";
import TextInput from "./common/TextInput";

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
    register,
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
    <div className="hero min-h-[100dvh] bg-base-200">
      <div className="hero-content flex-col md:flex-row w-full gap-0 md:gap-12 max-w-3xl">
        <div className="text-center">
          <img src={GreenBird} alt="" className="block mx-auto w-24 h-24 md:w-40 md:h-40" loading="lazy" />
          <h1 className="text-2xl sm:text-3xl md:text-5xl md:mt-4 text-base-content font-bold">
            {t("loginPanel.welcomeTitle")}
          </h1>
          <p className="text-base-content md:pt-6">{t("loginPanel.welcomeDescription")}</p>
        </div>
        <form className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100" onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body">
            <TextInput
              textInputClassName="w-full max-w-[32ch]"
              label={t("loginLabel")}
              type="text"
              required
              defaultValue=""
              className={`input input-bordered ${errors?.username ? "input-error" : "input-primary"}`}
              helperMessage={errors?.username?.message ?? ""}
              {...register("username", { required: t("loginRequiredLabel") })}
            />
            <TextInput
              textInputClassName="w-full max-w-[32ch]"
              label={t("passwordLabel")}
              type="password"
              required
              defaultValue=""
              className={`input input-bordered ${errors?.password ? "input-error" : "input-primary"}`}
              helperMessage={errors?.password?.message ?? ""}
              {...register("password", { required: t("passwordRequiredLabel") })}
            />
            <button className={`btn btn-primary mt-6 ${fetching ? "loading" : ""}`} type="submit">
              {t("loginButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

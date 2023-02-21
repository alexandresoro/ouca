import { LoadingButton } from "@mui/lab";
import { Card, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
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

  const theme = useTheme();
  const isDesktopSize = useMediaQuery(theme.breakpoints.up("lg"));
  const isTabletSize = useMediaQuery(theme.breakpoints.between("sm", "lg"));

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

  const logoSize = isDesktopSize ? 220 : isTabletSize ? 180 : 100;

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
    <div className="min-h-screen max-w-screen-xl mx-auto flex flex-col lg:pt-10 px-6 py-4 lg:gap-4 gap-2">
      <div className="centeredflex">
        <img src={GreenBird} alt="" width={logoSize} height={logoSize} loading="lazy" />
      </div>
      <div className="centeredflex">
        <Typography
          className="text-center lg:text-3xl md:text-2xl sm:text-xl text-lg"
          color="textPrimary"
          component="h1"
        >
          {t("welcomeText")}
        </Typography>
      </div>
      <div className="centeredflex lg:mt-8 mt-4">
        <Card className="grow p-2 max-w-screen-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="username"
              control={control}
              rules={{
                required: t("loginRequiredLabel"),
              }}
              render={({ field }) => (
                <div className="centeredflex">
                  <TextField
                    className="w-[32ch]"
                    label={t("loginLabel")}
                    variant="standard"
                    required
                    fullWidth
                    error={!!errors?.username}
                    helperText={errors?.username?.message ?? " "}
                    {...field}
                  />
                </div>
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{
                required: t("passwordRequiredLabel"),
              }}
              render={({ field }) => (
                <div className="centeredflex">
                  <TextField
                    className="w-[32ch]"
                    label={t("passwordLabel")}
                    type="password"
                    variant="standard"
                    required
                    fullWidth
                    error={!!errors?.password}
                    helperText={errors?.password?.message ?? " "}
                    {...field}
                  />
                </div>
              )}
            />
            <div className="centeredflex">
              <LoadingButton className="m-4" type="submit" loading={fetching} variant="contained">
                {t("loginButton")}
              </LoadingButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

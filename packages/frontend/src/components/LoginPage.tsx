import { LoadingButton } from "@mui/lab";
import { Card, Container, styled, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useContext, type FunctionComponent } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import GreenBird from "../assets/img/green-bird.svg";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { type UserLoginInput } from "../gql/graphql";
import CenteredFlexBox from "./utils/CenteredFlexBox";

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

const LoginTextField = styled(TextField)(() => ({
  width: "32ch",
}));

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

  const logoSize = isDesktopSize ? "220px" : isTabletSize ? "180px" : "100px";

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
    <Container
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: isDesktopSize ? 2 : 1,
        paddingTop: isDesktopSize ? 5 : 2,
        paddingBottom: 2,
      }}
    >
      <CenteredFlexBox>
        <img src={GreenBird} alt="" width={logoSize} height={logoSize} loading="lazy" />
      </CenteredFlexBox>
      <CenteredFlexBox>
        <Typography color="textPrimary" component="h1" variant="h4" sx={{ textAlign: "center" }}>
          {t("welcomeText")}
        </Typography>
      </CenteredFlexBox>
      <CenteredFlexBox
        sx={{
          marginTop: isDesktopSize ? 4 : 2,
        }}
      >
        <Card
          sx={{
            flexGrow: 1,
            maxWidth: "800px",
            padding: 1,
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="username"
              control={control}
              rules={{
                required: t("loginRequiredLabel"),
              }}
              render={({ field }) => (
                <CenteredFlexBox>
                  <LoginTextField
                    label={t("loginLabel")}
                    variant="standard"
                    required
                    fullWidth
                    error={!!errors?.username}
                    helperText={errors?.username?.message ?? " "}
                    {...field}
                  />
                </CenteredFlexBox>
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{
                required: t("passwordRequiredLabel"),
              }}
              render={({ field }) => (
                <CenteredFlexBox>
                  <LoginTextField
                    label={t("passwordLabel")}
                    type="password"
                    variant="standard"
                    required
                    fullWidth
                    error={!!errors?.password}
                    helperText={errors?.password?.message ?? " "}
                    {...field}
                  />
                </CenteredFlexBox>
              )}
            />
            <CenteredFlexBox>
              <LoadingButton
                type="submit"
                loading={fetching}
                variant="contained"
                sx={{
                  margin: 2,
                }}
              >
                {t("loginButton")}
              </LoadingButton>
            </CenteredFlexBox>
          </form>
        </Card>
      </CenteredFlexBox>
    </Container>
  );
};

export default LoginPage;

import { gql, useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Box, Card, Container, styled, TextField, Typography } from "@mui/material";
import { FunctionComponent, lazy, Suspense, useContext } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { MutationUserLoginArgs, UserInfo } from "../model/graphql";
import CenteredFlexBox from "./utils/CenteredFlexBox";

const LOGO_SIZE = "250px";

const LoginLogo = lazy(() =>
  import("../assets/img/green-bird.svg").then(({ ReactComponent }) => ({ default: ReactComponent }))
);

type UserLoginResult = {
  userLogin: UserInfo | null;
};

const USER_LOGIN_MUTATION = gql`
  mutation UserLogin($loginData: UserLoginInput!) {
    userLogin(loginData: $loginData) {
      id
      username
      firstName
      lastName
      role
    }
  }
`;

const LoginTextField = styled(TextField)(() => ({
  width: "32ch"
}));

type LocationState = {
  from: Location;
};

type LoginInputs = {
  username: string;
  password: string;
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
    handleSubmit
  } = useForm<LoginInputs>({
    defaultValues: {
      username: "",
      password: ""
    },
    mode: "all"
  });

  const [sendUserLogin, { loading }] = useMutation<UserLoginResult, MutationUserLoginArgs>(USER_LOGIN_MUTATION);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      const loginResult = await sendUserLogin({
        variables: {
          loginData: data
        }
      });
      // Successful login
      setUserInfo(loginResult?.data?.userLogin ?? null);

      // Navigate to home page
      navigate(from, { replace: true });
    } catch (error) {
      setError("username", {
        type: "manual",
        message: t("loginFailedMessage")
      });
    }
  };

  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        paddingTop: 5
      }}
    >
      <CenteredFlexBox>
        <Suspense fallback={<Box width={LOGO_SIZE} height={LOGO_SIZE} />}>
          <LoginLogo width={LOGO_SIZE} height={LOGO_SIZE} />
        </Suspense>
      </CenteredFlexBox>
      <CenteredFlexBox>
        <Typography color="textPrimary" fontSize={"32px"}>
          {t("welcomeText")}
        </Typography>
      </CenteredFlexBox>
      <Card
        sx={{
          marginTop: 3,
          padding: 2
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="username"
            control={control}
            rules={{
              required: t("loginRequiredLabel")
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
              required: t("passwordRequiredLabel")
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
              loading={loading}
              variant="contained"
              sx={{
                margin: 2
              }}
            >
              {t("loginButton")}
            </LoadingButton>
          </CenteredFlexBox>
        </form>
      </Card>
    </Container>
  );
};

export default LoginPage;

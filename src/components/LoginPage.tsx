import { gql, useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Container, Paper, styled, TextField, Typography, useTheme } from "@mui/material";
import { ReactElement, useContext } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ReactComponent as LoginLogo } from '../assets/img/green-bird.svg';
import { UserContext } from "../contexts/UserContext";
import { MutationUserLoginArgs, UserInfo } from "../model/graphql";
import CenteredFlexBox from "./utils/CenteredFlexBox";

type UserLoginResult = {
  userLogin: UserInfo | null;
}

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

const LoginTextField = styled(TextField)(({ theme }) => ({
  width: "32ch"
}));

type LoginInputs = {
  username: string
  password: string
}

export default function LoginPage(): ReactElement {

  const { t } = useTranslation();
  const theme = useTheme();
  const { setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const { control, setError, formState: { errors }, handleSubmit } = useForm<LoginInputs>({
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
      navigate("/");

    } catch (error) {
      setError("username", {
        type: "manual",
        message: t("loginFailedMessage")
      })
    }
  };

  return (
    <Container sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      paddingTop: 5
    }}>
      <CenteredFlexBox>
        <LoginLogo width={"300px"} height={"300px"} />
      </CenteredFlexBox>
      <CenteredFlexBox>
        <Typography color="textPrimary" fontSize={"32px"}>{t("welcomeText")}</Typography>
      </CenteredFlexBox>
      <Paper sx={{
        marginTop: 3,
        padding: 2
      }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="username"
            control={control}
            rules={{
              required: t("loginRequiredLabel") as unknown as string
            }}
            render={({ field }) => (
              <CenteredFlexBox>
                <LoginTextField
                  label={t("loginLabel")}
                  variant="standard"
                  required
                  fullWidth
                  error={!!errors?.username}
                  helperText={errors?.username?.message ?? ' '}
                  {...field}
                />
              </CenteredFlexBox>
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{
              required: t("passwordRequiredLabel") as unknown as string
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
                  helperText={errors?.password?.message ?? ' '}
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
      </Paper>
    </Container>
  )
}
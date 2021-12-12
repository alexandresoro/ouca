import { LoadingButton } from "@mui/lab";
import { Container, Paper, styled, TextField, Typography, useTheme } from "@mui/material";
import { ReactElement } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReactComponent as LoginLogo } from '../assets/img/green-bird.svg';
import CenteredFlexBox from "./utils/CenteredFlexBox";

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

  const { control, formState: { errors, isValid }, handleSubmit } = useForm<LoginInputs>({
    defaultValues: {
      username: "",
      password: ""
    },
    mode: "all"
  });

  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    console.log(data)
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
      <Paper elevation={0} sx={{
        marginTop: 3,
        padding: 2,
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: theme.palette?.primary?.main
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
              disabled={!isValid}
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
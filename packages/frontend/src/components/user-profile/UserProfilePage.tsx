import { type TFuncKey } from "i18next";
import { useCallback, useContext, type FunctionComponent } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation } from "urql";
import { UserContext } from "../../contexts/UserContext";
import { type MutationUserEditArgs } from "../../gql/graphql";
import useSnackbar from "../../hooks/useSnackbar";
import stringToColor from "../../utils/stringToColor";
import { getFullName, getInitials } from "../../utils/usernameUtils";
import TextInput from "../common/styled/TextInput";
import ContentContainerLayout from "../layout/ContentContainerLayout";
import StyledPanelHeader from "../layout/StyledPanelHeader";
import { EDIT_USER } from "./UserProfileQueries";

const UserProfilePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { userInfo, setUserInfo } = useContext(UserContext);

  const { displayNotification } = useSnackbar();

  const [{ fetching }, editUser] = useMutation(EDIT_USER);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<MutationUserEditArgs["editUserData"]>({
    defaultValues: {
      firstName: userInfo?.firstName,
      lastName: userInfo?.lastName,
    },
  });

  const [inputFirstName, inputLastName] = useWatch({ control, name: ["firstName", "lastName"] });

  const displaySuccessNotification = useCallback(() => {
    displayNotification({
      type: "success",
      message: t("saveProfileSuccess"),
    });
  }, [t, displayNotification]);

  const displayErrorNotification = useCallback(() => {
    displayNotification({
      type: "error",
      message: t("saveProfileError"),
    });
  }, [t, displayNotification]);

  if (!userInfo) {
    return null;
  }

  const onSubmit: SubmitHandler<MutationUserEditArgs["editUserData"]> = (editUserData) => {
    console.log({ editUserData });
    editUser({ userEditId: userInfo.id, editUserData })
      .then(({ data, error }) => {
        if (data?.userEdit && !error) {
          displaySuccessNotification();
          setUserInfo(data.userEdit);
        } else {
          displayErrorNotification();
        }
      })
      .catch(() => {
        displayErrorNotification();
      });
  };

  const fullName = getFullName(userInfo);
  const initials = getInitials(userInfo);

  const isButtonDisabled = inputFirstName === userInfo.firstName && inputLastName === (userInfo.lastName ?? "");

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("profile")}</h1>
      </StyledPanelHeader>
      <ContentContainerLayout>
        <div className="hero border-2 border-primary rounded-2xl p-6 bg-base-200 dark:bg-base-300 shadow-xl">
          <div className="hero-content flex-col md:flex-row w-full gap-8 md:gap-24 max-w-5xl">
            <div className="flex flex-col gap-4 items-center">
              <div
                style={
                  fullName
                    ? {
                        backgroundColor: stringToColor(fullName),
                      }
                    : {}
                }
                className="flex items-center justify-center uppercase font-bold text-white bg-secondary rounded-full h-16 md:h-40 w-16 md:w-40"
              >
                <span className="text-2xl md:text-6xl">{initials}</span>
              </div>
              <span className="text-base-content text-lg uppercase">{fullName}</span>
              <span className="badge badge-outline badge-accent">
                {t(`userRoles.${userInfo.role}` as TFuncKey) as string}
              </span>
              <span className="text-base-content text-center text-xs uppercase opacity-20 hover:opacity-60">
                {userInfo.id}
              </span>
            </div>
            <form
              className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="card-body">
                <TextInput
                  textInputClassName="w-full max-w-[32ch]"
                  label={t("firstNameLabel")}
                  type="text"
                  required
                  hasError={!!errors?.firstName}
                  helperMessage={errors?.firstName?.message ?? ""}
                  {...register("firstName", { required: t("firstNameRequiredLabel") })}
                />
                <TextInput
                  textInputClassName="w-full max-w-[32ch]"
                  label={t("lastNameLabel")}
                  type="text"
                  hasError={!!errors?.lastName}
                  helperMessage={errors?.lastName?.message ?? ""}
                  {...register("lastName")}
                />
                <button
                  className={`btn btn-primary mt-6 ${fetching ? "loading" : ""}`}
                  disabled={isButtonDisabled}
                  type="submit"
                >
                  {t("updateProfileButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default UserProfilePage;

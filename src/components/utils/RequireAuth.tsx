import { gql, useMutation } from "@apollo/client";
import { CircularProgress } from "@mui/material";
import { ReactElement, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { UserInfo } from "../../model/graphql";
import CenteredFlexBox from "./CenteredFlexBox";

type RefreshTokenResult = {
  userRefresh: UserInfo | null;
};

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreskToken {
    userRefresh {
      id
      username
      firstName
      lastName
      role
    }
  }
`;

export default function RequireAuth(props: { children: ReactElement }) {
  const { children } = props;

  const { userInfo, setUserInfo } = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [refreshToken] = useMutation<RefreshTokenResult>(REFRESH_TOKEN_MUTATION);

  useEffect(() => {
    // If the user context is not defined, try to retrieve a valid token
    if (!userInfo) {
      refreshToken()
        .then(({ data, errors }) => {
          if (data?.userRefresh && !errors) {
            setUserInfo(data.userRefresh);
          } else {
            navigate("/login", { replace: true, state: { from: location } });
          }
        })
        .catch(() => {
          navigate("/login", { replace: true, state: { from: location } });
        });
    }
  }, [location, userInfo, setUserInfo, refreshToken, navigate]);

  if (userInfo) {
    // If the user is properly logged in, simply return the content
    return children;
  }

  return (
    <CenteredFlexBox
      sx={{
        height: "100vh"
      }}
    >
      <CircularProgress />
    </CenteredFlexBox>
  );
}

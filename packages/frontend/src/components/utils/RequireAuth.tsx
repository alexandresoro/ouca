import { CircularProgress } from "@mui/material";
import { useContext, useEffect, type FunctionComponent, type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import { UserContext } from "../../contexts/UserContext";
import { graphql } from "../../gql";

const REFRESH_TOKEN_MUTATION = graphql(`
  mutation RefreshToken {
    userRefresh {
      id
      username
      firstName
      lastName
      role
    }
  }
`);
const RequireAuth: FunctionComponent<{ children: ReactElement }> = (props) => {
  const { children } = props;

  const { userInfo, setUserInfo } = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [_, refreshToken] = useMutation(REFRESH_TOKEN_MUTATION);

  useEffect(() => {
    // If the user context is not defined, try to retrieve a valid token
    if (!userInfo) {
      refreshToken({})
        .then(({ data, error }) => {
          if (data?.userRefresh && !error) {
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
    <div className="flex justify-center items-center h-screen">
      <CircularProgress />
    </div>
  );
};

export default RequireAuth;

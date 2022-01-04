import { ReactElement, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";

export default function RequireAuth(props: { children: ReactElement }) {
  const { children } = props;

  const { userInfo } = useContext(UserContext);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

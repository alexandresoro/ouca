import { useContext, type FunctionComponent } from "react";
import { UserContext } from "../contexts/UserContext";

const TempPage: FunctionComponent = () => {
  const { userInfo } = useContext(UserContext);

  return (
    <>
      {userInfo && (
        <code className="text-sm">
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </code>
      )}
    </>
  );
};

export default TempPage;

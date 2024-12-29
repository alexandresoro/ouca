import { oidcConfigAtom } from "@services/auth/oidc-config";
import { useAtomValue } from "jotai";
import { addProtocol, removeProtocol } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { type FunctionComponent, useEffect } from "react";
import { AuthProvider } from "react-oidc-context";
import { RouterProvider, type createBrowserRouter } from "react-router-dom";

type AppProps = {
  router: ReturnType<typeof createBrowserRouter>;
};

const App: FunctionComponent<AppProps> = ({ router }) => {
  const oidcConfig = useAtomValue(oidcConfigAtom);

  useEffect(() => {
    const protocol = new Protocol();
    addProtocol("pmtiles", protocol.tile);
    return () => {
      removeProtocol("pmtiles");
    };
  }, []);

  return (
    <div className="bg-base-100">
      <AuthProvider
        {...oidcConfig}
        onSigninCallback={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      >
        <RouterProvider
          future={{
            // biome-ignore lint/style/useNamingConvention: <explanation>
            v7_startTransition: true,
          }}
          router={router}
        />
      </AuthProvider>
    </div>
  );
};

export default App;

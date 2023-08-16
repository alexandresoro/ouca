import "@fontsource-variable/nunito";
import "@fontsource/carter-one";
import "maplibre-gl/dist/maplibre-gl.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import "./i18n";
import "./index.css";
import { routes } from "./router/routes";
import { initApp } from "./utils/init-app";

// rome-ignore lint/style/noNonNullAssertion: <explanation>
const Root = createRoot(document.getElementById("root")!);

initApp()
  .then(({ config, sentryRouter }) => {
    const router = (sentryRouter ?? createBrowserRouter)(routes);

    Root.render(
      <StrictMode>
        <App config={config} router={router} />
      </StrictMode>
    );
  })
  .catch(() => {
    throw new Error("Unable to load application");
  });

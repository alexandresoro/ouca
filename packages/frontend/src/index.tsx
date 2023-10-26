import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import "./i18n";
import "./index.css";
import { routes } from "./router/routes";
import { initApp } from "./utils/init-app";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
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

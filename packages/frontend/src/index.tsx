import { initApp } from "@services/init-app/init-app";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import "./i18n";
import "./index.css";
import { routes } from "./router/routes";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const Root = createRoot(document.getElementById("root")!);

initApp()
  .then(({ sentryRouter, ErrorBoundary }) => {
    const router = (sentryRouter ?? createBrowserRouter)(routes(ErrorBoundary));

    Root.render(
      <StrictMode>
        <App router={router} />
      </StrictMode>,
    );
  })
  .catch(() => {
    throw new Error("Unable to load application");
  });

import "@fontsource/carter-one";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/variable.css";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<></>}>
      <App />
    </Suspense>
  </StrictMode>
);

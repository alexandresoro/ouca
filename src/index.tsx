import { ApolloClient, InMemoryCache } from "@apollo/client";
import "@fontsource/lato";
import "@fontsource/yuji-hentaigana-akebono";
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache()
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<></>}>
      <App apolloClient={apolloClient} />
    </Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import { type RouteObject } from "react-router-dom";
import RoutesComponent from "./RoutesComponent";
import { lazyRoute } from "./utils/lazy-route";

export const routes: RouteObject[] = [
  { path: "*", Component: RoutesComponent },
  {
    path: "new-account",
    lazy: lazyRoute(() => import("./components/new-account/NewAccount")),
  },
];

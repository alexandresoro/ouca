import { type RouteObject } from "react-router-dom";
import { lazyComponent } from "../utils/lazy-route";

export const routesManage: RouteObject[] = [
  {
    path: "age",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "AgePage"),
  },
  {
    path: "classe",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "ClassePage"),
  },
  {
    path: "commune",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "CommunePage"),
  },
  {
    path: "comportement",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "ComportementPage"),
  },
  {
    path: "departement",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "DepartementPage"),
  },
  {
    path: "espece",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "EspecePage"),
  },
  {
    path: "estimation-distance",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "EstimationDistancePage"),
  },
  {
    path: "estimation-nombre",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "EstimationNombrePage"),
  },
  {
    path: "lieudit",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "LieuDitPage"),
  },
  {
    path: "meteo",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "MeteoPage"),
  },
  {
    path: "milieu",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "MilieuPage"),
  },
  {
    path: "observateur",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "ObservateurPage"),
  },
  {
    path: "sexe",
    lazy: lazyComponent(() => import("../components/manage/manage-pages"), "SexePage"),
  },
];

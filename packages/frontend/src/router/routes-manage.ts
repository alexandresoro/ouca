import type { RouteObject } from "react-router";
import { lazyComponent } from "./lazy-route";

export const routesManage: RouteObject[] = [
  {
    path: "age",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "AgePage"),
  },
  {
    path: "classe",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "ClassePage"),
  },
  {
    path: "commune",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "CommunePage"),
  },
  {
    path: "comportement",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "ComportementPage"),
  },
  {
    path: "departement",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "DepartementPage"),
  },
  {
    path: "espece",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "EspecePage"),
  },
  {
    path: "estimation-distance",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "EstimationDistancePage"),
  },
  {
    path: "estimation-nombre",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "EstimationNombrePage"),
  },
  {
    path: "lieudit",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "LieuDitPage"),
  },
  {
    path: "meteo",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "MeteoPage"),
  },
  {
    path: "milieu",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "MilieuPage"),
  },
  {
    path: "observateur",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "ObservateurPage"),
  },
  {
    path: "sexe",
    lazy: lazyComponent(() => import("../features/manage/manage-pages"), "SexePage"),
  },
];

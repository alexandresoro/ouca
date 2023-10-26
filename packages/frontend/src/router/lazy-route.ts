import { type FunctionComponent } from "react";

export const lazyRoute = (
  factory: () => Promise<{ default: FunctionComponent }>
): (() => Promise<{ Component: FunctionComponent }>) => {
  return () =>
    factory().then(({ default: defaultExport }) => {
      return { Component: defaultExport };
    });
};

export const lazyComponent = <K extends string>(
  factory: () => Promise<{ [k in K]: FunctionComponent }>,
  name: K
): (() => Promise<{ Component: FunctionComponent }>) => {
  return () =>
    factory().then((imported) => {
      return { Component: imported[name] };
    });
};

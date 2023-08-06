import { type FunctionComponent } from "react";

export const lazyRoute = (
  factory: () => Promise<{ default: FunctionComponent }>
): (() => Promise<{ Component: FunctionComponent }>) => {
  return () =>
    factory().then(({ default: defaultExport }) => {
      return { Component: defaultExport };
    });
};

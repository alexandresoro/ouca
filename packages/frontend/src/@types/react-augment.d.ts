/* eslint-disable @typescript-eslint/ban-types */
import "react";

declare module "react" {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  function forwardRef<T, P = {}>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}

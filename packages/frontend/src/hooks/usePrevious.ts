import { useEffect, useRef } from "react";

const usePrevious = <T = unknown>(value: T) => {
  const ref = useRef<T | undefined>();
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default usePrevious;

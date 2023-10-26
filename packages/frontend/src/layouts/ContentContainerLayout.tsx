import { type FunctionComponent, type PropsWithChildren } from "react";

const ContentContainerLayout: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return <div className="container mx-auto xl:max-w-screen-xl mt-10">{children}</div>;
};

export default ContentContainerLayout;

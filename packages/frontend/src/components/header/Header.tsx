import { type FunctionComponent } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/img/logo.svg";
import HeaderActions from "./HeaderActions";
import HeaderSettings from "./HeaderSettings";

const Header: FunctionComponent = () => {
  return (
    <div className="navbar z-10 sticky bg-base-100 dark:bg-neutral-800 min-h-12 px-6 py-0 place-content-between dark:shadow  dark:shadow-neutral-800/50 border-b-[1px] border-base-300">
      <Link className="flex-shrink-0 gap-2.5 outline-none" to="/">
        <img className="-mb-3" src={Logo} height="60px" width="70px"></img>
        <h1 className="hidden text-[28px] md:block text-neutral font-['Carter_One'] font-bold ">
          <span className="text-primary">OÙ</span>ÇA?
        </h1>
      </Link>
      <div className="flex items-center gap-4">
        <HeaderActions />
        <HeaderSettings />
      </div>
    </div>
  );
};

export default Header;

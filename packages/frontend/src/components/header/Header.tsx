import { type FunctionComponent } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/img/logo.svg";
import { useIsSizeLarge } from "../../hooks/useMediaQuery";
import HeaderActions from "./HeaderActions";
import HeaderSettings from "./HeaderSettings";

const Header: FunctionComponent = () => {
  const isSizeLarge = useIsSizeLarge();

  return (
    <div className="navbar z-10 sticky bg-primary dark:bg-neutral-800 min-h-12 px-6 py-0 place-content-between shadow-md shadow-gray-700/75">
      <Link className="flex-shrink-0 gap-2.5 outline-none" to="/">
        <img className="-mb-3" src={Logo} height="60px" width="70px"></img>
        <h1 className="hidden text-2xl md:block text-neutral-50 font-['Yuji_Hentaigana_Akebono'] font-bold drop-shadow-[2px_2px_rgba(0,0,0,0.4)]">
          oùça?
        </h1>
      </Link>
      {isSizeLarge && <HeaderActions />}
      <div className="flex items-center gap-4">
        <div className="block lg:hidden">
          <HeaderActions />
        </div>
        <HeaderSettings />
      </div>
    </div>
  );
};

export default Header;

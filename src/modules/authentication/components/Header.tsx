import { ReactComponent as SlateLogo } from "src/assets/images/slate-logo.svg";
import "./Header.scss";

type EntryHeader = {
  heading: string;
  description: string;
};

const Header = ({ heading, description }: EntryHeader) => (
  <div className="ftLoginHContainer">
    {/* <SlateLogo className="ftLoginHContainer_logo" /> */}
    <h2 className="ftLoginHContainer_heading">{heading}</h2>
    <p className="ftLoginHContainer_description">{description}</p>
  </div>
);

export default Header;

import { FC, MouseEvent } from "react";
import "./CustomButton.scss";

type CustomButtonProps = {
  onClick: (e: MouseEvent) => void;
};

const CustomButton: FC<CustomButtonProps> = ({ onClick, children }) => (
  <button className="showButtonLinkTask" onClick={onClick}>
    {children}
  </button>
);

export default CustomButton;

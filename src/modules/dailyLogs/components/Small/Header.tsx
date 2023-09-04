import { CSSProperties } from "react";
import IconButton from "@material-ui/core/IconButton";
import BackArrowIcon from "@material-ui/icons/ArrowBackIos";
import Box from "@material-ui/core/Box";
import BoldText from "../Micro/BoldText";

interface HeaderProps {
  style?: CSSProperties;
  handleBackClick: () => void;
  headerValue: string;
}


  export default function Header (props:any){
    const isNavigation = props.hasOwnProperty('handleBackClick')
    return  (
  <Box display="flex" alignItems="center" style={props?.style}>
   {isNavigation && (<IconButton onClick={props?.handleBackClick}>
      <BackArrowIcon />
    </IconButton>)}
    <BoldText size="2.5rem" collapseMargin={true}>
      {props?.headerValue}
    </BoldText>
  </Box>
)}


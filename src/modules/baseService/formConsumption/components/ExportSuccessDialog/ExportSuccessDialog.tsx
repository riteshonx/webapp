import { FC } from "react";
import Dialog from "@material-ui/core/Dialog";
import ThumbsUpIcon from "src/assets/images/thumbs-up-left.svg";
import Button from "@material-ui/core/Button";
import "./ExportSuccessDialog.scss";
import { styled } from "@material-ui/core/styles";

type ExportSuccessDialogProps = {
  isOpen: boolean;
  heading: string;
  footer: string;
  listOfData: Array<string>;
  handleOnOkClick: () => void;
};
const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    borderRadius: "2rem",
  },
}));

const ExportSuccessDialog: FC<ExportSuccessDialogProps> = ({
  isOpen,
  heading,
  footer,
  listOfData,
  handleOnOkClick,
}): JSX.Element => {
  const outerClass = "exportDialog_container";
  return (
    <StyledDialog open={isOpen}>
      <div className={outerClass}>
        <h2 className={`${outerClass}_heading`}>{heading}</h2>
        <ul className={`${outerClass}_listOfItems`}>
          {listOfData.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div>
          <img className={`${outerClass}_thumbsupIcon`} src={ThumbsUpIcon} />
        </div>
        <p>{footer}</p>
        <div className={`${outerClass}_actions`}>
          <Button
            data-testid={"create-form-template"}
            variant="outlined"
            className="btn-primary"
            onClick={handleOnOkClick}
          >
            Sounds Good
          </Button>
        </div>
      </div>
    </StyledDialog>
  );
};

export default ExportSuccessDialog;

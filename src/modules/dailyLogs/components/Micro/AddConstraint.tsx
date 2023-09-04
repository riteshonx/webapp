import { useState } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import Add from "@material-ui/icons/Add";
import AddConstraintModal from "../Large/AddConstraintModal";

const useStyles = makeStyles({
  root: {
    color: "var(--onx-btn-primary)",
    textTransform: "none",
  },
});

export interface AddConstraintProps {
  show?: boolean;
}

const AddConstraint = (props:any):any => {
  const [openModal, setOpenModal] = useState(false);
  const classes = useStyles();
  if (!props && props.constraintButtonProps && props.constraintButtonProps.show){
    if(!props.constraintButtonProps.show){
      return null;
    }
  } 
  return (
    <>
      <Button
        classes={{ root: classes.root }}
        startIcon={<Add />}
        onClick={() => setOpenModal(true)}
      >
        Add Constraint
      </Button>
      <AddConstraintModal
        isOpen={openModal}
        handleCloseClick={() => setOpenModal(false)}
        taskId = {props.taskId}
      />
    </>
  );
};

export default AddConstraint;

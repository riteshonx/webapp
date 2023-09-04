import { FC, useContext, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import {
  styled,
  Theme,
  makeStyles,
  createStyles,
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import { MenuItem, TextField } from "@material-ui/core";
import { DailyLogContext } from "../../DailyLogRouting";
import { CustomPopOver } from "src/modules/shared/utils/CustomPopOver";
import { addConstraintName } from "../../common/requests";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { setRefreshUpcomingActivities } from "../../actions";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { AddDailyLogContext } from "../../pages/AddDailyLog/AddDailyLog";

type AddConstraintModalProps = {
  isOpen: boolean;
  handleCloseClick: () => void;
  taskId: string;
};
const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    borderRadius: "1rem",
  },
  "& .MuiFormControl-root": {
    width: "100%",
  },
  "& .MuiInputLabel-outlined ": {
    fontSize: "1.5rem",
    fontWeight: "200",
  },
  "& .MuiOutlinedInput-input":{
    padding:"18.5px 14px"
  }
}));

const AddConstraintModal: FC<AddConstraintModalProps> = ({
  isOpen,
  handleCloseClick,
  taskId,
}): JSX.Element => {
  const [constraint, setConstraint] = useState<string>("");
  const [addConstraintComment, setAddConstraintComment] = useState<any>("");
  const { state: dailylogState, dispatch: dailylogDispatch } =
    useContext(DailyLogContext);
  const { state, dispatch }: any = useContext(stateContext);
  const { addDailyLogState, dispatchAddDailyLog } =
    useContext(AddDailyLogContext);
  const [error, setError] = useState<boolean>(false);
  const popOverclasses = CustomPopOver();

  const handleChange = (event: any) => {
    setConstraint(event.target.value);
  };

  const handleCommentChange = (event: any) => {
    setAddConstraintComment(event.target.value);
  };

  const saveConstraintData = async () => {
    if (!(constraint) || !(addConstraintComment.trim())) {
      setError(true);
      return false;
    } else {
      setError(false);
    }
    dispatch(setIsLoading(true));
    try {
      const response = await addConstraintName(
        constraint,
        addConstraintComment.trim(),
        taskId
      );
      Notification.sendNotification(
        "Constraint added successfully",
        AlertTypes.success
      );
      dispatchAddDailyLog(setRefreshUpcomingActivities(true));
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
    handleCloseClick();
    setConstraint("");
    setAddConstraintComment("");
  };

  return (
    <StyledDialog open={isOpen}>
      <Box padding="2rem" width="400px" overflow="hidden">
        <Box>
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            Add Constraint
          </Typography>
        </Box>
        {error && (
          <Box>
            <Typography variant="h2" style={{ fontSize: "1rem", color: "red" }}>
              Please add a constraint with a category
            </Typography>
          </Box>
        )}
        <Box marginTop="2rem" display="flex" justifyContent="space-between">
          <TextField
            id="outlined-helperText"
            onChange={handleCommentChange}
            value={addConstraintComment}
            label="Constraint Name"
            placeholder="Enter Name"
            variant="outlined"
            helperText=""
          />
        </Box>
        <Box marginTop="2rem" display="flex" justifyContent="space-between">
          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-constraint">
              Select a category
            </InputLabel>
            <Select
              value={constraint}
              onChange={handleChange}
              label="Select a category"
              MenuProps={{
                classes: { paper: popOverclasses.root },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              {dailylogState?.constraintList &&
                dailylogState?.constraintList.length &&
                dailylogState?.constraintList.map((type: any) => (
                  <MenuItem
                    className="mat-menu-item-sm"
                    key={type.id}
                    value={type.nodeName}
                  >
                    {type.nodeName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          display="flex"
          style={{ marginTop: "2rem", flexDirection: "row-reverse" }}
        >
          <Button className="btn-primary" onClick={saveConstraintData}>
            Add
          </Button>
          <Button
            style={{ marginRight: "1rem" }}
            variant="outlined"
            onClick={() => {
              handleCloseClick(), setError(false), setConstraint(""),setAddConstraintComment("");
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </StyledDialog>
  );
};

export default AddConstraintModal;

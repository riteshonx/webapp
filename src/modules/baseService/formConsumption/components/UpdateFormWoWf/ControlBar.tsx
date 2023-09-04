import { FC, ChangeEvent, useContext, useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import StatusChange from "src/modules/baseService/formConsumption/components/StatusChange/StatusChange";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import GlobalKeyboardDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker";
import { projectContext } from "../../Context/projectContext";
import AssigneeSelect from "src/modules/shared/components/UserSelect/UserSelect";
import { match, useRouteMatch } from "react-router-dom";
import { EditViewFormParams } from "../../models/form";
import ProjectUserDetails from "src/modules/shared/components/ProjectUserDetails/ProjectUserDetails";
import { IStatusListOptions } from "../../pages/EditRfi/EditRfiTypes";
import { Controller } from "react-hook-form";
import { FIXED_FIELDS } from "src/utils/constants";

const DARK_GREEN = "#171d25";
const LIGHT_GREEN = "#e7eef0";

const today = moment().format("YYYY-MM-DD");

const useStyles = makeStyles(() => ({
  itemLabel: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "grey",
  },
  itemValue: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "grey",
  },

  dueDate: {
    width: "135px",
    "& .MuiOutlinedInput-input": {
      padding: "0.7rem",
      "&:hover": {
        cursor: "pointer",
      },
    },
    "& .MuiIconButton-root": {
      padding: "0",
      "& .MuiSvgIcon-root": {
        fontSize: "1.6rem",
        fill: `${DARK_GREEN}`,
      },
      "&.Mui-disabled": {
        "& .MuiSvgIcon-root": {
          fontSize: "1.6rem",
          fill: "#00000042",
        },
      },
    },

    "& .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${DARK_GREEN}`,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${DARK_GREEN}`,
    },
  },
  disabledDueDate: {
    "& .MuiOutlinedInput-input": {
      padding: "0.7rem",
      "&:hover": {
        cursor: "initial",
      },
    },
  },
}));

// we have the status, assignees and due date fields added here as types to support the ViewRfi page
export interface ControlBarPropsType {
  status: string;
  statusListOptions: Array<IStatusListOptions>;
  dueDate: string | null;
  assignees: Array<any>;
  disabled?: boolean;
  control?: any;
  handleUpdateAssignee?: (users: Array<any>) => void;
  handleStatusChange?: (e: ChangeEvent<any>) => void;
  handleDueDateChange?: (d: string) => void;
}

interface ControlBarItemPropsType {
  label: string;
  component: React.ReactElement;
}

const ControlBarItem: FC<ControlBarItemPropsType> = ({ label, component }) => {
  const classes = useStyles();
  if(label==='Assignee'){
	return null
  }
  return (
   
   <Box display="flex" alignItems="center" marginLeft="3rem">
      <Typography variant="h3" classes={{ h3: classes.itemLabel }}>
        {label}:
      </Typography>
      <Box marginLeft="0.8rem">{component}</Box>
    </Box>
  );
};

const ControlBar: FC<ControlBarPropsType> = ({
  status,
  assignees,
  dueDate,
  statusListOptions,
  disabled = false,
  control,
  handleStatusChange,
}) => {
  const classes = useStyles();
  const { projectState }: any = useContext(projectContext);
  const pathMatch: match<EditViewFormParams> = useRouteMatch();
  const [dateOpen, setDateOpen] = useState(false);
  const [isSelectedStatusClosedType, setSelectedStatusClosedType] =
    useState(false);

  useEffect(() => {
    const selectedStatus = statusListOptions.find((o) => o.status === status);
    if (!selectedStatus?.openStatus) setSelectedStatusClosedType(true);
    else setSelectedStatusClosedType(false);
  }, [status]);

  return (
		<Box
			padding="2rem"
			paddingRight="16rem"
			display="flex"
			justifyContent="center"
			alignItems="center"
			bgcolor={LIGHT_GREEN}
		>
			{!disabled ? (
				<>
					<Controller
						render={({ field }: { field: any }) => (
							<ControlBarItem
								label="Status"
								key={field.value}
								component={
									<StatusChange
										status={field.value}
										statusOptions={statusListOptions}
										handleStatusChange={(e: ChangeEvent<any>) => {
											handleStatusChange?.(e);
										}}
									/>
								}
							/>
						)}
						name={`${FIXED_FIELDS.STATUS}-wfdisabled`}
						control={control}
					/>
					{!(
						projectState?.featurePermissions?.canDeleteForm &&
						isSelectedStatusClosedType === true
					) && (
						<Controller
							render={({ field }: { field: any }) => (
								<ControlBarItem
									label="Assignee"
									key={field.value?.toString()}
									component={
										projectState?.featurePermissions?.canDeleteForm &&
										isSelectedStatusClosedType === true ? (
											<AssigneeSelect
												save={(assignees) => field.onChange(assignees)}
												featureId={Number(pathMatch.params.featureId)}
												users={field.value}
											/>
										) : (
											<ProjectUserDetails users={field.value} />
										)
									}
								/>
							)}
							name={`${FIXED_FIELDS.ASSIGNEE}-wfdisabled`}
							control={control}
						/>
					)}
					<Controller
						render={({ field }: { field: any }) => (
							<ControlBarItem
								label="Due Date"
								component={
									<MuiPickersUtilsProvider utils={DateFnsUtils}>
										<GlobalKeyboardDatePicker
											className={classes.dueDate}
											data-testid="status-delayed-date"
											inputVariant="outlined"
											value={field.value}
											InputProps={{
												onClick: () => setDateOpen(true),
												placeholder: 'Select date',
												readOnly: true,
											}}
											onChange={(e: any) => {
												field.onChange?.(moment(e).format('YYYY-MM-DD'));
											}}
											format="dd MMM, yyyy"
											name="date"
											minDate={today}
											maxDate={'2099-01-01'}
											open={dateOpen}
											onClose={() => setDateOpen(false)}
											error={false}
											helperText={null}
										/>
									</MuiPickersUtilsProvider>
								}
							/>
						)}
						name={`${FIXED_FIELDS.DUE_DATE}-wfdisabled`}
						control={control}
					/>
				</>
			) : (
				<>
					<ControlBarItem
						label="Status"
						key={status}
						component={
							<StatusChange
								status={status}
								statusOptions={statusListOptions}
								disabled={true}
								handleStatusChange={(e: ChangeEvent<any>) => {
									handleStatusChange?.(e);
								}}
							/>
						}
					/>
					<ControlBarItem
						label="Assignee"
						key={assignees.toString()}
						component={<ProjectUserDetails users={assignees} />}
					/>
					<ControlBarItem
						label="Due Date"
						component={
							<MuiPickersUtilsProvider utils={DateFnsUtils}>
								<GlobalKeyboardDatePicker
									disabled={true}
									className={`${classes.dueDate} ${classes.disabledDueDate}`}
									data-testid="status-delayed-date"
									inputVariant="outlined"
									value={dueDate}
									InputProps={{
										onClick: () => {
											if (!disabled) setDateOpen(true);
										},
										placeholder: 'Select date',
										readOnly: true,
									}}
									format="dd MMM, yyyy"
									name="date"
									minDate={today}
									maxDate={'2099-01-01'}
									open={dateOpen}
									onClose={() => setDateOpen(false)}
									error={false}
									helperText={null}
								/>
							</MuiPickersUtilsProvider>
						}
					/>
				</>
			)}
		</Box>
	);
};

export default ControlBar;

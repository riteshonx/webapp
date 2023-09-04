import { useState, useEffect, useRef, FC } from "react";
import { client } from "src/services/graphql";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { Box, IconButton } from "@material-ui/core";
import {
  CREATE_STATUS_LIST,
  UPDATE_STATUS_LIST,
  DELETE_STATUS_LIST,
} from "src/modules/baseService/forms/grqphql/queries/statusList";
import { useForm, Controller } from "react-hook-form";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import {
  canUpdateTemplates,
  canUpdateFormTemplateStatus,
} from "src/modules/baseService/forms/utils/permission";
import DiscardIcon from "@material-ui/icons/HighlightOff";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import TickIcon from "@material-ui/icons/CheckCircleOutline";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/EditOutlined";
import CustomSwitch from "./CustomSwitch";

const useStyles = makeStyles(() =>
  createStyles({
    disabledInput: {
      color: "#7f7f7f",
    },
    input: {
      padding: "1.1rem 0",
      textOverflow: "ellipsis",
    },
    notchedOutline: {
      border: "none",
    },
    listItem: {
      marginLeft: "0.7rem",
      fontSize: "1.2rem",
      fontWeight: 500,
      width: "33.3%",
    },
    errorStatus: {
      fontSize: "1rem",
      color: "#fb7070",
    },
    actionIcon: {
      padding: "6px",
    },
    tickIcon: {
      color: "var(--onx-text-black)",
    },
    disabledIcon: {
      color: "lightgray",
    },
    discardIcon: {
      color: "var(--onx-text-black)",
    },
    editIcon: {
      color: "var(--onx-text-black)",
      transition: "color 300ms",
      "&:hover": {
        color: "#8fa3ff",
      },
    },
    deleteIcon: {
      color: "var(--onx-text-black)",
      transition: "color 300ms",
      "&:hover": {
        color: "#ff8080",
      },
    },
    buttonLabel: {
      justifyContent: "flex-end",
    },
  })
);

export type ActionType = "SUBMIT" | "UPDATE" | "DISCARD" | "DELETE";

export interface StatusListItemType {
  id: number;
  status: string;
  open: boolean;
  featureId: number;
  onAction?: (id: number, type: ActionType) => void;
  isDefaultItem: boolean;
}

const StatusListItem: FC<StatusListItemType> = ({
  id,
  status,
  open,
  featureId,
  onAction,
  isDefaultItem,
}) => {
  //Note: +id indicates UPDATE, and -id indicates CREATE
  const classes = useStyles();
  const inputRef = useRef<any>(null);
  const errorRef = useRef<any>(null);
  const [enableEdit, setEnableEdit] = useState(id > 0 ? false : true);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status,
      open,
    },
  });

  const [enableTick, setEnableTick] = useState(false);
  const currentStatusValue = watch("status");
  const currentOpenValue = watch("open");

  useEffect(() => {
    if (
      (currentStatusValue !== status || currentOpenValue !== open) &&
      !enableTick
    ) {
      setEnableTick(true);
    } else if (
      currentStatusValue === status &&
      currentOpenValue === open &&
      enableTick
    ) {
      setEnableTick(false);
    }
  }, [currentStatusValue, currentOpenValue, status, open]);

  useEffect(() => {
    if (enableEdit) {
      inputRef.current.focus();
    }
    if (errors.status) {
      errorRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [enableEdit, errors.status]);

  const onSubmit = async (data: any) => {
    try {
      await client.mutate({
        mutation: CREATE_STATUS_LIST,
        variables: {
          featureId: Number(featureId),
          openStatus: data.open,
          status: data.status,
        },
        fetchPolicy: "network-only",
        context: {
          role: "createFormTemplate",
        },
      });
      onAction?.(id, "SUBMIT");
      Notification.sendNotification(
        `Successfully created status: ${data.status}`,
        AlertTypes.success
      );
    } catch (e: any) {
      console.error("Could not create new status", e);
      let errorMessage = e.message;
      if (e.message.includes("Uniqueness violation")) {
        errorMessage =
          "Status name already exists. Please try with a different status name";
      }
      Notification.sendNotification(errorMessage, AlertTypes.warn);
    }
  };

  const onUpdate = async (data: any) => {
    try {
      await client.mutate({
        mutation: UPDATE_STATUS_LIST,
        variables: {
          statusId: id,
          openStatus: data.open,
          status: data.status,
        },
        fetchPolicy: "network-only",
        context: {
          role: "updateFormTemplate",
        },
      });
      onAction?.(id, "UPDATE");
      setEnableEdit(false);
      Notification.sendNotification(
        `Successfully updated status: ${status}`,
        AlertTypes.success
      );
    } catch (e: any) {
      console.error("Could not update status", e);
      let errorMessage = e.message;
      if (e.message.includes("Uniqueness violation")) {
        errorMessage =
          "Status name already exists. Please try with a different status name";
      }
      Notification.sendNotification(errorMessage, AlertTypes.warn);
    }
  };

  const handleUpdateOrCreate = () => {
    if (id > 0) {
      //update
      handleSubmit(onUpdate)();
    } else {
      //create
      handleSubmit(onSubmit)();
    }
  };

  const handleDelete = async () => {
    try {
      await client.mutate({
        mutation: DELETE_STATUS_LIST,
        variables: {
          statusId: Number(id),
        },
        fetchPolicy: "network-only",
        context: {
          role: "updateFormTemplateStatus",
        },
      });
      onAction?.(id, "DELETE");
      Notification.sendNotification(
        `Successfully deleted status: ${status}`,
        AlertTypes.success
      );
    } catch (e: any) {
      console.error("Could not delete status with id", id);
      Notification.sendNotification(e, AlertTypes.warn);
    }
  };

  const handleDiscardEditOrCreate = () => {
    if (id > 0) {
      //update
      setValue("status", status);
      setValue("open", open);
      setEnableEdit(false);
    } else {
      //create
      onAction?.(id, "DISCARD");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      border="1px solid lightgrey"
      marginTop="1rem"
      borderRadius="3px"
    >
      <Box className={classes.listItem}>
        <Controller
          name="status"
          control={control}
          rules={{
            required: true,
            validate: (value) => {
              return !!value.trim();
            },
          }}
          render={({ field }) => (
            <OutlinedInput
              {...field}
              inputRef={inputRef}
              placeholder="Enter status value"
              classes={{
                disabled: classes.disabledInput,
                notchedOutline: classes.notchedOutline,
                input: classes.input,
              }}
              disabled={!enableEdit}
            />
          )}
        />
        {errors.status && (
          <div ref={errorRef} className={classes.errorStatus}>
            Status cannot be blank
          </div>
        )}
      </Box>

      <Controller
        name="open"
        control={control}
        render={({ field }) => (
          <CustomSwitch
            {...field}
            color="secondary"
            disabled={!enableEdit || isDefaultItem}
            checked={field.value}
          />
        )}
      />
      <Box width="33.3%" display="flex" flexDirection="row-reverse">
        {enableEdit ? (
          <>
            <IconButton
              onClick={handleDiscardEditOrCreate}
              classes={{ root: classes.actionIcon, label: classes.buttonLabel }}
            >
              <DiscardIcon classes={{ root: classes.discardIcon }} />
            </IconButton>
            <IconButton
              onClick={handleUpdateOrCreate}
              disabled={!enableTick}
              classes={{ root: classes.actionIcon, label: classes.buttonLabel }}
            >
              <TickIcon
                classes={{
                  root: !enableTick ? classes.disabledIcon : classes.tickIcon,
                }}
              />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton
              onClick={handleDelete}
              disabled={!canUpdateFormTemplateStatus || isDefaultItem}
              classes={{ root: classes.actionIcon, label: classes.buttonLabel }}
            >
              <DeleteIcon
                classes={{
                  root:
                    canUpdateFormTemplateStatus && !isDefaultItem
                      ? classes.deleteIcon
                      : classes.disabledIcon,
                }}
              />
            </IconButton>
            <IconButton
              onClick={() => setEnableEdit(true)}
              disabled={!canUpdateTemplates || isDefaultItem}
              classes={{
                root: classes.actionIcon,
                label: classes.buttonLabel,
              }}
            >
              <EditIcon
                classes={{
                  root:
                    canUpdateTemplates && !isDefaultItem
                      ? classes.editIcon
                      : classes.disabledIcon,
                }}
              />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default StatusListItem;

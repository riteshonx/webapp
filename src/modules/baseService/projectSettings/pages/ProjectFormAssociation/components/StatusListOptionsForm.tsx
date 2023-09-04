import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import StatusListProjectSettingItem from "./StatusListProjectSettingItem";
import { Button, Box } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/styles";
import { UPDATE_STATUS_LIST_PROJECT_SETTING } from "src/modules/baseService/forms/grqphql/queries/statusList";
import { client } from "src/services/graphql";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import type { StatusListOptionType } from "./StatusListProjectSetting";
import { canUpdateTemplates } from "src/modules/baseService/forms/utils/permission";

const useStyles = makeStyles(() =>
  createStyles({
    backButton: {
      padding: "4px",
      marginRight: "1rem",
    },
    actionButton: {
      textTransform: "none",
      width: "80px",
    },
    updateButton: {
      background: "#304a50",
      color: "#fff",
      marginLeft: "3rem",
      "&:hover": {
        background: "#07676e",
      },
    },
    cancelButton: {
      color: "#304a50",
    },
    disabledButton: {
      background: "lightgrey",
    },
  })
);

interface StatusListOptionsFormType {
  featureId: number;
  projectId: number;
  onCancelClick: () => void;
  onPostSubmit: () => void;
  statusListOptions: Array<StatusListOptionType>;
}

const StatusListOptionsForm: FC<StatusListOptionsFormType> = ({
  onCancelClick,
  statusListOptions,
  featureId,
  projectId,
  onPostSubmit,
}) => {
  const defaultValues = statusListOptions.reduce((acc: any, curr) => {
    acc[`checkbox-${curr.id}`] = curr.selected;
    return acc;
  }, {});
  const {
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm({ defaultValues });
  const classes = useStyles();

  const onSubmit = async (values: any) => {
    const updatedDirtyFields = Object.keys(dirtyFields).reduce(
      (a, key) => ({ ...a, [key]: values[key] }),
      {}
    );
    const toUpdateValues = Object.entries(updatedDirtyFields).map(
      ([key, value]) => {
        const touched: any = Object.create({});
        touched.featureId = featureId;
        touched.formStatusId = Number(key.split("-")[1]);
        touched.projectId = projectId;
        touched.deleted = !value;
        return touched;
      }
    );
    try {
      await client.mutate({
        mutation: UPDATE_STATUS_LIST_PROJECT_SETTING,
        variables: {
          objects: toUpdateValues,
        },
        fetchPolicy: "network-only",
        context: {
          role: "updateFormTemplate",
        },
      });
      Notification.sendNotification(
        "Successfully updated status selection",
        AlertTypes.success
      );
      onPostSubmit();
    } catch (e) {
      const errorMsg = "Could not update status selection";
      Notification.sendNotification(errorMsg, AlertTypes.warn);
      console.error(errorMsg, e);
    }
  };

  return (
    <Box
      height="calc(100% - 47px)"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Box overflow="auto">
        {statusListOptions.map((option) => (
          <StatusListProjectSettingItem
            key={option.id}
            status={option.status}
            openStatus={option.openStatus}
            control={control}
            id={option.id}
            disabled={option.disableSelect}
          />
        ))}
      </Box>
      <Box marginTop="2rem" alignSelf="flex-end">
        <Button
          classes={{
            root: classes.actionButton,
            outlined: classes.cancelButton,
          }}
          variant="outlined"
          onClick={onCancelClick}
        >
          Cancel
        </Button>
        {canUpdateTemplates && (
          <Button
            disabled={!isDirty}
            type="submit"
            classes={{
              root: classes.actionButton,
              text: classes.updateButton,
              disabled: classes.disabledButton,
            }}
          >
            Update
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default StatusListOptionsForm;

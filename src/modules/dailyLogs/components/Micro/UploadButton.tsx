import { useRef, useContext } from "react";
import Button from "@material-ui/core/Button";
import AddPhotoAlternate from "@material-ui/icons/AddPhotoAlternate";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { multiPartPost, postApiWithEchange } from "src/services/api";
import { useParams } from "react-router-dom";
import {
  insertAttachedFiles,
  insertAttachedFilesWithTaskId,
} from "../../common/requests";
import { setRefreshAssignedActivities } from "../../actions";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { AddDailyLogContext } from "../../pages/AddDailyLog/AddDailyLog";
import { makeStyles } from "@material-ui/core/styles";

interface UploadButtonProps {
  readOnly?: boolean;
  taskId: string;
  timeSheetId: number | string;
  disabled?: boolean;
}

const FILE_SIZE_LIMIT_MB = 10;
const MAX_FILE_COUNT_AT_A_TIME = 10;

const useStyles = makeStyles({
  disabled: {
    "&:hover": {
      cursor: "not-allowed",
    },
  },
});

const UploadButton: React.FC<UploadButtonProps> = ({
  taskId,
  timeSheetId,
  disabled = false,
}) => {
  const inputRef: any = useRef(null);
  const classes = useStyles();
  const { dispatch }: any = useContext(stateContext);
  const params: any = useParams();
  const { dispatchAddDailyLog } = useContext(AddDailyLogContext);

  const handleUploadClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const uploadFileToS3 = async (item: any, file: any) => {
    try {
      await multiPartPost(item.url, item.fields, file, {});
      if (timeSheetId) {
        await insertAttachedFiles(
          item?.fields?.key,
          file.name,
          file.size,
          file.type,
          timeSheetId
        );
      } else {
        await insertAttachedFilesWithTaskId(
          item?.fields?.key,
          file.name,
          file.size,
          file.type,
          taskId
        );
      }
      Notification.sendNotification(
        "Dailylog attachment added successfully",
        AlertTypes.success
      );
      dispatchAddDailyLog(setRefreshAssignedActivities(true));
      dispatch(setIsLoading(false));
    } catch {
      console.error("Something went wrong while uploading to S3");
      dispatch(setIsLoading(false));
    }
  };

  const handleChange = async (e: any) => {
    const files = e.target.files;
    const filesArray = Array.from(files);
    const fileGreaterThan5Mb = filesArray.some(
      (file: any) => file.size > 1024 * 1024 * FILE_SIZE_LIMIT_MB
    );
    const invalidFormat = filesArray.some(
      (file: any) =>
        !(
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/jpg"
        )
    );
    const fileCount = filesArray.length;
    if (fileCount > MAX_FILE_COUNT_AT_A_TIME) {
      Notification.sendNotification(
        `Upto ${MAX_FILE_COUNT_AT_A_TIME} images can be uploaded at a time. Please reselect.`,
        AlertTypes.error
      );
      return;
    }
    if (invalidFormat) {
      Notification.sendNotification(
        "Only images with jpeg or png formats are allowed",
        AlertTypes.error
      );
      return;
    }
    if (fileGreaterThan5Mb) {
      Notification.sendNotification(
        `One or more images are greater than the ${FILE_SIZE_LIMIT_MB}MB size limit. Please reselect.`,
        AlertTypes.error
      );
      return;
    }
    const payload = filesArray.map((file: any) => {
      return {
        fileName: file?.name,
        projectId: Number(params.projectId),
      };
    });

    try {
      dispatch(setIsLoading(true));
      const projectTokenResponse = await postApiWithEchange(
        "V1/S3/uploadFilesInfo",
        payload
      );
      if (projectTokenResponse?.success.length > 0) {
        projectTokenResponse?.success.forEach((item: any, index: number) => {
          uploadFileToS3(item, files[index]);
        });
      }
    } catch (error) {
      console.error("Something went wrong while uploading the file");
      dispatch(setIsLoading(false));
    }
  };
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png"
        style={{ display: "none" }}
        onChange={handleChange}
        multiple
      />
      <Button
        onClick={handleUploadClick}
        style={{
          padding: "24px 17px 22px 30px",
          position: "relative",
          top: "-2px",
        }}
        disableRipple={disabled}
        classes={disabled ? { root: classes.disabled } : {}}
        startIcon={
          <AddPhotoAlternate
            style={{ fontSize: "3rem", color: disabled ? "#e6e6e6" : "" }}
          />
        }
        variant="outlined"
      />
    </div>
  );
};

export default UploadButton;

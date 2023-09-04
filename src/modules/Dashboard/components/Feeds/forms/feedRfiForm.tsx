import React, { useContext, useEffect, useState } from "react";
import "./feedRfiForm.scss";
import { getFormDetailByFormId } from "../../../api/gql/form";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { rfiFormMapper } from "src/modules/Dashboard/utils/mapper/formDataMapper";
import { CommonDetailPopover } from "./commonDetailPopover";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";

export const FeedRfiForm = ({
  onClose,
  formId,
  onDataLoad,
}: {
  formId: number;
  onClose: any;
  onDataLoad?: any;
}): React.ReactElement => {
  const { state }: any = useContext(stateContext);
  const [loading, setLoading] = useState(false);
  const [formObejct, setFormObject] = useState<any>({} as any);
  const getRfiFormListDetailData = async (formId: number) => {
    setLoading(true);
    try {
      const rfiFormListDetailData = await getFormDetailByFormId(
        formId,
        state.selectedProjectToken
      );
      setFormObject(rfiFormMapper(rfiFormListDetailData));
    } catch (error) {
      console.log("error in fetching form data", error);
      Notification.sendNotification(
        "Something went wrong while fetching rfi form data",
        AlertTypes.warn
      );
    } finally {
      setLoading(false);
      onDataLoad && onDataLoad(true);
    }
  };

  useEffect(() => {
    getRfiFormListDetailData(formId);
  }, []);

  return (
    <CommonDetailPopover
      onClose={onClose}
      mappedData={formObejct}
      loading={loading}
      maxWidth={"580px"}
      maxHeight={"200px"}
    ></CommonDetailPopover>
  );
};

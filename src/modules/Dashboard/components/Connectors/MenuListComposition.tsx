import { Button, Grid } from "@mui/material";
import React, { useContext } from "react";
import { SelSourceProjectContext } from "../DashboardSlate2/Components/ConnectorsScreen/ConnectorsScreen";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { importForms } from "./actions/actions";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import "./styles/styles.scss";
import { ProjectDataInterface, ConnRowData } from "./utils/types";
import { getSourceSystemLabel, getTransformAccountId } from "./utils/helper";
import AgaveLink from "./AgaveLink";
interface MenuListProps {
  row: ConnRowData;
  selectedArtifact: any;
  status: string;
}
export default function MenuListComposition({
  row,
  selectedArtifact,
  status,
}: MenuListProps): React.ReactElement {
  const {
    dispatch,
    state: { sourceSystem },
  } = React.useContext(stateContext);

  const {
    selSourceProjectState: [selSourceProject],
  } = useContext(SelSourceProjectContext);
  const { projectId, id, featureId, targetProjectName } = row;
  let sourceProject = selSourceProject[featureId]?.value;
  if (!sourceProject) {
    sourceProject = row as unknown as ProjectDataInterface;
  }
  const localSourceSystem = getSourceSystemLabel(sourceProject?.metadata ?? {});

  const handleLoader = async (
    cb: (...rest: any[]) => Promise<any>,
    ...rest: any[]
  ) => {
    try {
      dispatch(setIsLoading(true));
      await cb(...rest);
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const menuItems = [
    {
      text: "RFI",
      call: () =>
        handleLoader(importForms, "RFI", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "RFI",
          projectId,
          initiator: "client",
        }),
      id: "rfi",
      disabled: ["BIM 360"].includes(localSourceSystem || ""),
    },
    {
      text: "Manpower Log",
      call: () =>
        handleLoader(importForms, "Manpower Log", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "Manpower Log",
          projectId,
          initiator: "client",
        }),
      id: "manpower-log",
      disabled: ["BIM 360"].includes(localSourceSystem || ""),
    },
    {
      text: "Manpower Logs",
      call: () =>
        handleLoader(importForms, "Manpower Log", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "Manpower Log",
          projectId,
          initiator: "client",
        }),
      id: "manpower-logs",
      disabled: ["BIM 360"].includes(localSourceSystem || ""),
    },
    {
      text: "Procore RFI",
      call: () =>
        handleLoader(importForms, "RFI", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "RFI",
          projectId,
          initiator: "client",
        }),
      id: "rfi",
      disabled: ["BIM 360"].includes(localSourceSystem || ""),
    },
    {
      text: "Timecard Entries",
      call: () =>
        handleLoader(importForms, "Timecard Entries", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "Timecard Entries",
          projectId,
          initiator: "client",
        }),
      id: "timecard-entries",
      disabled: ["BIM 360"].includes(localSourceSystem || ""),
    },
    {
      text: "Productivity Log",
      call: () =>
        handleLoader(importForms, "Productivity Log", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "Productivity Log",
          projectId,
          initiator: "client",
        }),
      id: "productivity-log",
      disabled: ["BIM 360"].includes(localSourceSystem || ""),
    },
    {
      text: "Productivity Logs",
      call: () =>
        handleLoader(importForms, "Productivity Log", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "Productivity Log",
          projectId,
          initiator: "client",
        }),
      id: "productivity-logs",
      disabled: ["BIM 360"].includes(localSourceSystem || ""),
    },
    {
      text: "Checklist",
      call: () =>
        handleLoader(importForms, "Checklist", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "Checklist",
          projectId,
          initiator: "client",
        }),
      id: "checklist",
      disabled: ["Procore"].includes(localSourceSystem || ""),
    },
    {
      text: "BIM360 RFI",
      call: () =>
        handleLoader(importForms, "RFI", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "BIM360 RFI",
          projectId,
          initiator: "client",
        }),
      id: "bim360-rfi",
      disabled: ["Procore"].includes(localSourceSystem || ""),
    },
    {
      text: "Issues",
      call: () =>
        handleLoader(importForms, "Issues", targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: "Issue Log",
          projectId,
          initiator: "client",
        }),
      id: "issue-log",
      disabled: ["Procore"].includes(localSourceSystem || ""),
    },
  ];

  const showImport = sourceSystem
    ? [
        "RFI",
        "Manpower Log",
        "Manpower Logs",
        "Procore RFI",
        "Timecard Entries",
        "Productivity Log",
        "Productivity Logs",
      ].includes(selectedArtifact)
      ? ["BIM 360"].includes(sourceSystem?.name)
      : ["Procore"].includes(sourceSystem?.name)
    : false;

  const importFormCriteria =
    sourceSystem?.name === localSourceSystem &&
    sourceProject?.metadata?.accountId === getTransformAccountId(sourceSystem);

  const handleImport = () => {
    if (!importFormCriteria) {
      Notification.sendNotification(
        "Please select a source project",
        AlertTypes.error
      );
      return;
    }
    const selected = menuItems?.find(
      ({ text }: any) => text === selectedArtifact
    );

    if (selected?.disabled) {
      Notification.sendNotification(
        "Source System not supported.",
        AlertTypes.error
      );
    } else {
      selected?.call();
    }
  };
  return (
    <Grid item>
      {!sourceSystem || showImport ? (
        <AgaveLink status={status} />
      ) : (
        <Button
          id="composition-button"
          onClick={() => handleImport()}
          className="btn-primary"
          disabled={!importFormCriteria || showImport}
        >
          {status === "Connected" ? "Re Sync" : "Import"}
        </Button>
      )}
    </Grid>
  );
}

import { Button, CircularProgress } from "@material-ui/core";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
  IconButton
} from "@mui/material";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { useContext, useEffect, useMemo, useState } from "react";
import { stateContext} from "src/modules/root/context/authentication/authContext";
import { decodeExchangeToken } from "src/services/authservice";
import { client } from "src/services/graphql";
import { tenantProjectRole } from "src/utils/role";
import Notification, {
  AlertTypes,
} from "../../../../../shared/components/Toaster/Toaster";
import {
  GET_PROJECT_PHASES,
  GET_PROJECT_PHASES_BY_PROJECTID,
  SET_PROJECT_PHASES,
} from "../../../../graphql/queries/dashboard";
import { setphaseChanges } from "src/modules/root/context/authentication/action";
import "./ProjectPhaseDialog.scss";

const styles = () => ({
  dialogPaper: {
    maxHeight: "60%",
    width: "40%",
    minHeight: "60%",
    minWidth: "40%",
    backgroundColor: "#171d25 ",
  },
  formControl: {
    marginX: 3,
    paddingBottom: "5px",
  },
});

const ProjectPhaseDialog = (props: any): React.ReactElement => {
  const classes: any = styles();
  const { onClose, selectedValue, open } = props;
  const { state,dispatch }: any = useContext(stateContext);
  const [phases, setPhases]: any = useState([]);
  const [isLoading, setIsLoading]: any = useState(false);


  useEffect(() => {
    state?.selectedProjectToken &&
      state?.currentProject?.projectId &&
      getProjectPhases();
  }, [state?.selectedProjectToken, state?.currentProject]);
  const flattenData = (data:any[])=>{
    const flattenArray:any[] = [];
    const flattenPhase = (phase:any)=>{
     flattenArray.push({
      id:phase.id,
      name:phase.name,
      checked:phase.checked,
      isProject:phase.isProject
     })
      if (phase.children && phase.children.length > 0) {
      phase.children.forEach((child: any) => {
        flattenPhase(child);
      });
    }
    }
    data.forEach((item)=>{
      flattenPhase(item)
    })
  
    return flattenArray;
  }
  const isButtonDisabled = useMemo(() => {
  if (isLoading || !phases || !flattenData(phases).some((phase:any) => phase.checked)) {
    return true;
  }
  return false;
}, [isLoading, phases]);

  const getProjectPhases = async () => {
    setIsLoading(true);
    const responseData = await client.query({
      query: GET_PROJECT_PHASES,
      fetchPolicy: "network-only",
      context: {
        role: "viewMyProjects",
      },
    });
    if (responseData.data.projectPhase?.length) {
      getProjectPhasesByProjectId(responseData.data.projectPhase);
    }
  };

  const getProjectPhasesByProjectId = async (phaseData: any) => {
    try {
      if (
        !decodeExchangeToken().allowedRoles.includes(
          tenantProjectRole.updateTenantProject
        )
      ) {
        setPhases([]);
        return;
      }
      const responseData = await client.query({
        query: GET_PROJECT_PHASES_BY_PROJECTID,
        fetchPolicy: "network-only",
        variables: {
          projectId: state?.currentProject?.projectId,
        },
        context: {
          role: "viewMyProjects",
        },
      });
      const data: any = [];
      const projectPhaseData = responseData.data.projectPhaseDetails;
      for (let i = 0; i < phaseData.length; i++) {
        const obj1 = phaseData[i];
        let matchFound = false;
        for (let j = 0; j < projectPhaseData.length; j++) {
          const obj2 = projectPhaseData[j];
          if (obj1.id === obj2.projectPhase.id) {
            data.push({
              ...obj1,
              checked: true,
              isProject: true,
              open: true, 
            });
            matchFound = true;
            break;
          }
        }
        if (!matchFound) {
          data.push({
            ...obj1,
            checked: false,
            deleted: false,
            open: true,
          });
        }
      }
      const updateData = organizeData(data)
      setPhases(updateData);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleChange = (data: any) => {
    const updatedData = updatePhaseData([...phases],data)
    setPhases(updatedData);
  };
  const updatePhaseData :any = (data: any[], updatedPhase: any) => {
  return data.map((phase: any) => {
    if (phase.id === updatedPhase.id) {
      return {
        ...phase,
        checked: !phase.checked,
      };
    } else if (phase.children && phase.children.length > 0) {
      return {
        ...phase,
        children: updatePhaseData(phase.children, updatedPhase),
      };
    }
    return phase;
  });
};
  const organizeData = (data:any)=>{
   const nestedData :any={}
   const nodeMap:any={};
   data.forEach((node:any)=>{
    nodeMap[node.id] = {...node,children:[]}
   })
    data.forEach((node:any) => {
    if (node.parentId) {
      const parent = nodeMap[node.parentId];
      if (parent) {
        parent.children.push(nodeMap[node.id]);
      }
    } else {
      nestedData[node.id] = nodeMap[node.id];
    }
  });
   return Object.values(nestedData)
  }
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload: any = [];
      const flattenPhases = flattenData(phases) 
      flattenPhases.forEach((item: any) => {
        if (!item.checked && item.isProject) {
          payload.push({
            phaseId: item.id,
            phaseName: item.name,
            projectId: state.currentProject?.projectId,
            deleted: true,
          });
        } else if (item.checked && !item.isProject) {
          payload.push({
            phaseId: item.id,
            phaseName: item.name,
            projectId: state.currentProject?.projectId,
          });
        }
      });
      await client.mutate({
        mutation: SET_PROJECT_PHASES,
        variables: { projectPhases: payload },
        context: { role: "createTenantProject" },
      });
      dispatch(setphaseChanges(payload))
      Notification.sendNotification(
        "Project phase updated successfully",
        AlertTypes.success
      );
      setIsLoading(false);
      onClose();
      // getProjectPhases();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
const renderPhases = (phases: any[]) => {
  return phases.map((phase: any) => (
    <React.Fragment key={phase.id}>
      <FormControlLabel
        control={
          <Checkbox
            disableRipple
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: 20,
                color: '#fff',
                marginLeft:3
              },
            }}
            checked={phase.checked}
            onChange={() => handleChange(phase)}
          />
        }
        label={
          <Typography className="projectPhaseDialog-main__phase">
            {phase.name}
          </Typography>
        }
      />
      {phase.open && phase.children && phase.children.length > 0 && (
        <FormGroup>
          {renderPhases(phase.children)}
        </FormGroup>
      )}
    </React.Fragment>
  ));
};
const handleTogglePhase = (phaseId :any) => {
  setPhases((prevPhases :any) =>
    prevPhases.map((phase:any) => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          open: !phase.open,
          children: phase.children.map((child:any) => ({
            ...child,
            open: !phase.open,
          })),
        };
      }
      return phase;
    })
  );
};
return (
  <Dialog
    className="projectPhaseDialog-main"
    disableEnforceFocus
    onClose={handleClose}
    open={open}
    PaperProps={{
      sx: classes.dialogPaper,
    }}
  >
    <DialogTitle className="projectPhaseDialog-main__title">
      Project Phase
    </DialogTitle>

    <DialogContent dividers className="projectPhaseDialog-main__content">
      {!isLoading ? (
        <>
          {flattenData(phases)
            ?.filter((p: any, i: any) => p.checked)?.length > 0 && (
            <div className="projectPhaseDialog-main__content__selectedPhasesContainer">
              <span style={{ color: '#fe9a0b' }}>Selected Phases: </span>
              {flattenData(phases)
                .filter((p: any) => p.checked)
                .map((p: any, i: any, arr: any) => (
                  <span key={i}>
                    {p.name}
                    {i !== arr.length - 1 && ', '}
                  </span>
                ))}
            </div>
          )}

          <FormControl
            sx={classes.formControl}
            component="fieldset"
            variant="standard"
          >
            <FormGroup>
              {phases.map((phase: any) => (
                <React.Fragment key={phase.id}>
                  {phase.parentId !== null ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          disableRipple
                          sx={{
                            '& .MuiSvgIcon-root': {
                              fontSize: 20,
                              color: '#fff',
                            },
                          }}
                          checked={phase.checked}
                          onChange={() => handleChange(phase)}
                        />
                      }
                      label={
                        <Typography className="projectPhaseDialog-main__phase">
                          {phase.name}
                        </Typography>
                      }
                    />
                  ) : (
                    <>
                      <Typography className="projectPhaseDialog-main__phase">
                        {phase.open ? (
                          <>
                            <IconButton onClick={() => handleTogglePhase(phase.id)} className="projectPhaseDialog-main__icon">
                              <ExpandMoreIcon />
                            </IconButton>
                            {phase.name}
                          </>
                        ) : (
                          <>
                            <IconButton onClick={() => handleTogglePhase(phase.id)} className="projectPhaseDialog-main__icon">
                              <ChevronRightIcon />
                            </IconButton>
                            {phase.name}
                          </>
                        )}
                      </Typography>

                      {phase.open && phase.children && phase.children.length > 0 && (
                        <FormGroup>
                          {renderPhases(phase.children)}
                        </FormGroup>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </FormGroup>
          </FormControl>
        </>
      ) : (
        <div className="projectPhaseDialog-main__loadingContainer">
          <CircularProgress />
        </div>
      )}
    </DialogContent>

    {!isLoading && isButtonDisabled && (
      <p className="projectPhaseDialog-main__error">
        *At least one phase should be selected to save.
      </p>
    )}

    <DialogActions>
      <Button
        onClick={handleSave}
        className={`projectPhaseDialog-main__saveButton ${
          isButtonDisabled ? 'disabled' : ''
        }`}
        disabled={isButtonDisabled}
      >
        Save
      </Button>
      <Button
        onClick={onClose}
        className="projectPhaseDialog-main__cancelButton"
      >
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);
}
export default ProjectPhaseDialog;

import { useContext } from "react";
import "./AddTeammate.scss";
import BackArrowIcon from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";
import InviteUserTable from "./InviteUserTable";
import IconButton from "@material-ui/core/IconButton";
import { useEffect, useState } from "react";
import {
  getProjectRoles,
  getSystemRoles,
  getUserProjects,
  getTenantCompanies,
  associateUserWithProjects,
} from "./requests";
import { decodeExchangeToken } from "src/services/authservice";
import { setIsLoading,setEditMode } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { postApiWithEchange } from "src/services/api";
import { canInviteUsers } from "src/services/permission";
import SuccessDialog from "../../components/successDialog";
import ErrorDialog from "./components/ErrorDialog";
import useBeforeunload from 'src/customhooks/useUnload';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';

interface message{
  header:string,
  text:string,
  cancel:string,
  proceed:string
}

export const confirmMessageBeforeLeave:message = {
  header: "Are you sure?",
  text: "If you cancel now, your changes won’t be saved.",
  cancel: "Go back",
  proceed: "Yes, I'm sure",
};

const Header = ({ handleBackClick }: any) => (
  <div className="teammateContainer_heading">
    <IconButton onClick={handleBackClick}>
      <BackArrowIcon />
    </IconButton>
    <h1>Invite Users</h1>
  </div>
);

const AddTeammate = ({
  history: {
    location: { state:userState},
  },
}: any) => {
  const navigate = useHistory();
  const { dispatch,state }: any = useContext(stateContext);
  const [roles, setRoles] = useState({ systemRoles: [], projectRoles: [] });
  const [userProjects, setUserProjects] = useState([]);
  const [tenantCompanies, setTenantCompanies] = useState([]);
  const [successDialogOpen, setSuccessDialogOpen] = useState<any>({
    isOpen: false,
    values: [],
  });
  const [errorDialogOpen, setErrorDialogOpen] = useState<any>({
    isOpen: false,
    values: [],
  });
  const [pageError, setPageError] = useState(false);
  const [showConfirm,setShowConfirm] = useState(false);
  const [proceedChanges,setProceedChanges] = useState(false);

  const handleUserInvitation = async (values: any) => {
    dispatch(setEditMode(false));
    const data = values.inviteUsers.map((value: any) => {
      const companies = value.companies.map((company: any) =>
        parseInt(company)
      );
      const projectIds = value.projects.map((project:any)=>project?.projectId)
      const { firstName, lastName, email } = value;
      return {
        company: companies,
        role: parseInt(value.systemRole),
        email,
        firstName,
        lastName,
        jobTitle: value.jobTitle?.trim() || undefined,
        projectIds,
      };
    });
    const tenantId = decodeExchangeToken().tenantId;
    const url = `V1/tenant/${tenantId}/user`;
    try {
      dispatch(setIsLoading(true));
      const response = await postApiWithEchange(url, data);
      if (response.success) {
        const { invitedUsers, associatedUsers } = response.success;
        const totalUsers = [...invitedUsers, ...associatedUsers];
        if (totalUsers.length > 0) {
          const enrichedUsers = totalUsers.map((user: any) => {
            const foundUser = values.inviteUsers.find(
              (inviteUser: any) => user.email === inviteUser.email
            );
            return { projects: foundUser?.projects || [], userId: user.id };
          });
          const usersTobeAssociated = enrichedUsers.flatMap((eUser: any) => {
            return eUser?.projects.map((project: any) => {
              return {
                role: project.roleId,
                projectId: project.projectId,
                userId: eUser.userId,
              };
            });
          });
          if (usersTobeAssociated.length)
            await associateUserWithProjects(usersTobeAssociated);
          setSuccessDialogOpen({
            isOpen: true,
            values: totalUsers.map((v: any) => v.email),
          });
        }

        // else {
        //   const missedUsers = values.inviteUsers?.filter(
        //     (inviteUser: any) =>
        //       !totalUsers?.find(
        //         (respondedUser: any) => inviteUser.email == respondedUser.email
        //       )
        //   );
        //   setErrorDialogOpen({
        //     isOpen: true,
        //     values: missedUsers.map((v: any) => v.email),
        //   });
        // }
        dispatch(setIsLoading(false));
      }
    } catch (error: any) {
      console.error(error);
      dispatch(setIsLoading(false));
      setSuccessDialogOpen({
        isOpen: false,
        values: [],
      });
      setPageError(true);
      throw new Error();
    }
  };

  useBeforeunload((event: any) => {
    if(state.editMode) {
        event.preventDefault();
    }
  });

  useEffect(() => {
    (async () => {
      let projectRoles,
        userProjects = [];
      if (canInviteUsers()) {
        try {
          dispatch(setIsLoading(true));
          userProjects = await getUserProjects();
          const fetchedProjectRoles = await getProjectRoles();
          projectRoles = fetchedProjectRoles.filter(
            (role: any) => !role.deleted
          );
          const fetchedSystemRoles = await getSystemRoles();
          const tenantCompanies = await getTenantCompanies();
          const systemRoles = fetchedSystemRoles.filter(
            (role: any) => !role.deleted && role.id !== 1 && role.id !== 5
          );
          setTenantCompanies(tenantCompanies);
          setUserProjects(userProjects);
          setRoles({
            systemRoles,
            projectRoles,
          });
        } catch {
          setPageError(true);
        } finally {
          dispatch(setIsLoading(false));
        }
      } else {
        navigate.push("/pagenotfound");
      }
    })();
  }, []);
  useEffect(()=>{
    return () => {
      dispatch(setEditMode(false));
    }
  },[])

  const handleFieldChange=(hasEmptyValue:any)=>{
      if(state && !state.editMode && !proceedChanges && !hasEmptyValue){
        dispatch(setEditMode(true));
      }else if(hasEmptyValue && state.editMode){
        dispatch(setEditMode(false));
      }
    }

  const handleBackClick=()=>{
    if(state.editMode){
      setShowConfirm(true)
    }else{
      navigate.push("/base/teammates/lists");
    }
  }

  const proceed = ()=>{
    dispatch(setEditMode(false));
    //dispatch(setIsLoading(true));
    setProceedChanges(true);
    setShowConfirm(false);
    setTimeout(() => {
      navigate.push("/base/teammates/lists");
    }, 1000);
  } 

  return (
    <div className="teammateContainer">
      <Header handleBackClick={handleBackClick} />
      {pageError ? (
        <div className="teammateContainer_error">
          <h3>Uh ho! Something went wrong!</h3>
        </div>
      ) : (
        <>
          <InviteUserTable
            roles={roles}
            projects={userProjects}
            companies={tenantCompanies}
            projectId={userState?.projectId}
            companyId={userState?.companyId}
            handleUserInvitation={handleUserInvitation}
            handleFieldChange = {(val:any)=>handleFieldChange(val)}
          />
          <SuccessDialog
            open={successDialogOpen.isOpen}
            emails={successDialogOpen.values}
          />
          <ErrorDialog
            isOpen={errorDialogOpen.isOpen}
            values={errorDialogOpen.values}
          />
        </>
      )}
           {showConfirm?(<ConfirmDialog open={showConfirm} message={confirmMessageBeforeLeave} close={()=>setShowConfirm(false)} proceed={proceed}/>):("")}
    </div>
  );
};

export default AddTeammate;

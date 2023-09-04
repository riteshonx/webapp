import Button from '@material-ui/core/Button';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { decodeExchangeToken, decodeProjectFormExchangeToken } from 'src/services/authservice';
import './InviteProjectTeammates.scss';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import Popover from '@material-ui/core/Popover';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from "@material-ui/icons/Add";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import EmailIcon from '@material-ui/icons/Email';
import { match, useRouteMatch } from 'react-router-dom';
import { axiosApiInstance } from 'src/services/api';
import { features } from 'src/utils/constants';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { InviteEmailTemplate } from 'src/modules/drawings/templates/invite';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { client } from 'src/services/graphql';
import { CREATE_DRAWING_SESSION, CREATE_DRAWING_USER_SESSION_ASSOCIATION, FETCH_SESSION_BASED_ON_DRAWING } from '../../graphql/queries/drawingSheets';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { setDrawingSessionId, setSessionCreated } from '../../context/DrawingLibDetailsAction';


export interface Params {
  projectId: string;
  drawingId: string;
}

const NOTIFICATION_URL: any = process.env["REACT_APP_NOTIFICATION_URL"];
const NOTIFICATION_PATH = "V1/notification";

export default function InviteProjectTeammates(props: any): ReactElement {

    const pathMatch: match<Params> = useRouteMatch();
    const {dispatch, state }:any = useContext(stateContext);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [userList, setUserList] = useState<Array<any>>([]);
    const [isDisabled, setIsDisabled] = useState(true);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [selectedUsersList, setSelectedUsersList] = useState<Array<any>>([]);

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
      if(DrawingLibDetailsState.activeSessionUsers){
        setSelectedUsersList(DrawingLibDetailsState.activeSessionUsers.map((item: any)=> item.userId));
      } else{
        setSelectedUsersList([]);
      }
    }, [pathMatch.params.drawingId, DrawingLibDetailsState.activeSessionUsers])
    

    //open popover
    const handleInvitation = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    }

    //close popover
    const handleClose = () => {
        clearSelect();
        setAnchorEl(null);
    };

    useEffect(() => {
      if(props.userList){
        const users: Array<any> = [];
        props.userList.forEach((element: any) => {
          const newItem= {...element};
          if(element.id !== decodeExchangeToken().userId){
              if(selectedUsersList.indexOf(element.id)>-1){
                newItem.isSelected= true;
              }
              users.push(newItem);
          }
        });
        setUserList(users);
      }
    }, [props.userList, selectedUsersList, anchorEl]);
    

    //select or unselect the user from the list
    const addRemoveUser = (user: any, argIndex: number) => {
      if(selectedUsersList.indexOf(user.id)<0){
        const users = [...userList];
        users[argIndex].isSelected = !user.isSelected;
        setUserList(users);
        checkButtonCase();
      }
    };
    

    //handle notify button
    const sendEmailNotification = async() => {
      const allowedRoles= decodeProjectFormExchangeToken(state.selectedProjectToken).allowedRoles;
          const role= allowedRoles.includes(projectFeatureAllowedRoles.createDrawings)?projectFeatureAllowedRoles.createDrawings
          :allowedRoles.includes(projectFeatureAllowedRoles.updateDrawings)? projectFeatureAllowedRoles.createDrawings:'';
      const users = [...userList];
      const selectedUsers = users?.filter((user: any) => user.isSelected && selectedUsersList.indexOf(user.id)<0);
      if(role){
        if(DrawingLibDetailsState.drawingSessionId){
          // associate new users to the session
          const sessionAssociationPayload= frameAsscoiationPayload(DrawingLibDetailsState.drawingSessionId, selectedUsers, false);
          await associateUserToDrawingSession(sessionAssociationPayload, role);
          if(selectedUsers.length > 0){
            sendEmailCall();
          }
        } else{
          // create new session and then associate user to the session;
          const drawingSessionResponse= await client.query({
            query: FETCH_SESSION_BASED_ON_DRAWING,
            variables:{
              drawingId: pathMatch.params.drawingId
            },
            fetchPolicy: "network-only",
            context: {
              role: projectFeatureAllowedRoles.viewDrawings,
              token: state.selectedProjectToken,
            },
          });
          const drawingSessionId= drawingSessionResponse.data.dwgSession.length>0?drawingSessionResponse.data.dwgSession[0].id:'';
          if(drawingSessionId){
            // a session is already in progress
            const currentUser = drawingSessionResponse.data.dwgSession[0].dwgUserSessionAssociations
            .find((item: any)=>item.userId == decodeExchangeToken().userId);
            if(currentUser){
              // current user is part of the session then find the diffrence in the users and associate
              const activeusers= drawingSessionResponse.data.dwgSession[0].dwgUserSessionAssociations.map((item: any)=>item.userId);
              const invitedUsersList= selectedUsers.filter((item: any)=> activeusers.indexOf(item.id)===-1);
              if(invitedUsersList.length>0){
                const sessionAssociationPayload= frameAsscoiationPayload(drawingSessionId, invitedUsersList, false);
                await associateUserToDrawingSession(sessionAssociationPayload, role)
              }
              if(selectedUsers.length > 0){
                sendEmailCall();
              }
              DrawingLibDetailsDispatch(setSessionCreated(true));
            } else{
              // alert user that an active session is in progress and hide collaborate button
              DrawingLibDetailsDispatch(setDrawingSessionId(drawingSessionId));
              Notification.sendNotification('It looks like their is an active session in progress', AlertTypes.warn);
            }
          } else{
            // create a fresh session and associate users
            const sessionObject=[{
              drawingId:pathMatch.params.drawingId,
              name:'',
              status: 3
            }];
            const sessionResponse= await client.mutate({
              mutation: CREATE_DRAWING_SESSION,
              variables:{objects: sessionObject},
              context:{
                role,
                token: state.selectedProjectToken,
               }
            });
            if(sessionResponse.data.insert_dwgSession.returning.length>0){
              const sessionAssociationPayload= frameAsscoiationPayload(sessionResponse.data.insert_dwgSession.returning[0].id, selectedUsers);
              DrawingLibDetailsDispatch(setDrawingSessionId(sessionResponse.data.insert_dwgSession.returning[0].id))
              await associateUserToDrawingSession(sessionAssociationPayload, role);
              DrawingLibDetailsDispatch(setSessionCreated(true));
            }
            if(selectedUsers.length > 0){
              sendEmailCall();
            }
          }
        }
      }
      handleClose();
    }

    const associateUserToDrawingSession= async (argPayload: Array<any>, role: string)=>{
        try{
          await client.mutate({
            mutation: CREATE_DRAWING_USER_SESSION_ASSOCIATION,
            variables:{
              objects: argPayload
            },
            context:{
              role,
              token: state.selectedProjectToken,
              }
          })
        } catch(error: any){
          console.log(error);
        }
    }

    const frameAsscoiationPayload=(argSessionId: string, argUsers: Array<any>, isNew=true)=>{
      const returnValue: Array<any>= [];
      argUsers.forEach((item: any)=>{
        const drawingAssociationItem={
          dwgSessionId:argSessionId,
          status: false,
          userId:item.id,
        }
        returnValue.push(drawingAssociationItem);
      });
      if(isNew){
        returnValue.push({
          dwgSessionId:argSessionId,
          status: true,
          userId:decodeExchangeToken().userId,
        })
      }
      return returnValue;
    }

    const frameEmailPayload=()=>{
      const users = [...userList];
      const selectedUsers = users?.filter((user: any) => user.isSelected && selectedUsersList.indexOf(user.id)<0)
      ?.map((item: any) => ({id: item.id, email: item.email}));
      const host= `${location.protocol}//${location.host}`;
      const redirectionUrl = `${host}/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${pathMatch.params.drawingId}?tenant-id=${decodeExchangeToken().tenantId}`;
      const currentDrawing = DrawingLibDetailsState?.drawingSheetLists.find((item: any)=> item.id == pathMatch.params.drawingId);
      const currentProject = state.projectList.find((item: any)=> item.projectId == pathMatch.params.projectId);
      const htmlEmail= InviteEmailTemplate({
        projectName: currentProject?.projectName || '',
        drawingName: currentDrawing?.drawingNumber ||'',
        redirectionUrl
      })
      const payload: any = [{
        users:selectedUsers,
        email: true,
        // eslint-disable-next-line max-len
        emailTemplate: htmlEmail,
        subject: "Invite for drawing collaboration",
        contentModified: {    
          actionType: "ADDED",    
          featureType: features.DRAWINGS,    
          tenantFeatureId: null,    
          projectFeatureId: 5, 
          projectId: pathMatch.params.projectId, 
          fieldName: "Drawing Name",
          oldValue: null,   
          newValue: null,
          navigationUrl: {    
                serviceName: "authentication",    
                path: `/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${pathMatch.params.drawingId}?tenant-id=${decodeExchangeToken().tenantId}`
          }
        }  
      }  
    ]
    return payload;
    }

    //clear the selected user
    const clearSelect = () => {
      const allUsers = [...userList];
      allUsers.forEach((user: any) => {
        user.isSelected = false
      });
      setUserList(allUsers);
      checkButtonCase()
    }

    //post call for sending mail notification
    const sendEmailCall = async () => {
      try {
        const payload= frameEmailPayload();
        dispatch(setIsLoading(true));
        const response: any =  await axiosApiInstance.post(
          `${NOTIFICATION_URL}${NOTIFICATION_PATH}`,
          payload,
          {
            headers: {
              token: "exchange",
            },
          }
        );
        if(response.data.success){
          dispatch(setIsLoading(false));
          Notification.sendNotification('Email sent successfully', AlertTypes.success);
        }
        
      } catch (error: any) {
        dispatch(setIsLoading(false));
        Notification.sendNotification(error, AlertTypes.warn);
      }
    }

    const checkButtonCase = () => {
      const users = [...userList];
      const selectedUsers = users?.filter((user: any) => user.isSelected && selectedUsersList.indexOf(user.id)<0)?.map((item: any) => ({id: item.id, email: item.email}));
      selectedUsers.length > 0 ? setIsDisabled(false) : setIsDisabled(true)
    }


    return (
        <div className="invite-teammates">
            <Button
                data-testid={'notify-user'}
                variant="outlined"
                className="btn btn-primary"
                onClick={(event) => handleInvitation(event)}
                startIcon={<GroupAddIcon />}
                size="small"
            >
              Collaborate
            </Button>

            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
              }}
              transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
              }}
            >   
                <div className="invite-popOver">
                  {userList.length>0?(
                    <>
                     <div className="invite-popOver__users">
                     {userList.map((user: any, i: number) => (
                         <Box
                           key={user.id}
                           display="flex"
                           alignItems="center"
                           justifyContent="space-between"
                           className="invite-popOver__users__assigneeContainer"
                           onClick={() => addRemoveUser(user, i)}
                         >
                           <Box display="flex" alignItems="center">
                             <Avatar className="invite-popOver__users__avatar" alt={user.firstName} src="/">
                             </Avatar>
                             <div className="invite-popOver__users__details">
                               <div className="invite-popOver__users__details__name">
                                 {`${user.firstName} ${user.lastName}`}
                               </div>
                               <div className="invite-popOver__users__details__designation">
                                 {user.email}
                               </div>
                             </div>
                           </Box>
                           <IconButton
                             className="invite-popOver__users__addIconContainer" 
                           >
                             {!user.isSelected ? (
                               <AddIcon className="invite-popOver__users__addIconContainer__addIcon" />
                             ) : (
                               <CheckCircleIcon 
                               className={`${selectedUsersList.indexOf(user.id)<0?'invite-popOver__users__addIconContainer__active':
                               'invite-popOver__users__addIconContainer__disabled'}`}/>
                             )}
                           </IconButton>
                         </Box>
                       ))}
                   </div>
 
                   <div className="invite-popOver__actions">
                     <Button
                         data-testid={'cancel-invite'}
                         variant="outlined"
                         className="btn btn-secondary"
                         onClick={handleClose}
                         size="small"
                     >
                         Cancel
                     </Button>
                     <Button
                         data-testid={'cancel-invite'}
                         variant="outlined"
                         className="btn btn-primary"
                         onClick={sendEmailNotification}
                         startIcon={<EmailIcon />}
                         size="small"
                         disabled={isDisabled}
                     >
                         Invite
                     </Button>
                   </div>  
                   </>
                  ):( <div className="invite-popOver__message">
                    Looks like it's lonely out here! Please add other members to the project to start Collaborating.
                  </div>)} 
                </div>
            </Popover>
        </div>
    )
}

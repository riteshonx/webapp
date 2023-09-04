import React, { ReactElement, useContext, useEffect, useState } from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Tooltip from '@material-ui/core/Tooltip';
import './DrawingViewerHeader.scss';
import DrawingVersions from '../DrawingVersions/DrawingVersions';
import InviteProjectTeammates from '../InviteProjectTeammates/InviteProjectTeammates';
import { match, useRouteMatch } from 'react-router-dom';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { FETCH_PROJECT_USERS_LIST } from '../../graphql/queries/drawingSheets';
import { client } from 'src/services/graphql';
import { myProjectRole } from 'src/utils/role';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { Avatar, AvatarGroup } from '@mui/material';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';

export interface Params {
    projectId: string;
    drawingId: string;
  }
  

export default function DrawingViewerHeader(props: any): ReactElement {
    const pathMatch: match<Params> = useRouteMatch();
    const {dispatch }:any = useContext(stateContext);
    const [userList, setUserList] = useState<Array<any>>([]);
    const [selectedUsersList, setSelectedUsersList] = useState<Array<any>>([]);
    const {DrawingLibDetailsState}: any = useContext(DrawingLibDetailsContext);

    useEffect(() => {
        if(pathMatch.params.projectId){
            getProjectUsersLists();   
        }
    }, [pathMatch.params.projectId])

    useEffect(() => {
        if(userList.length>0 && DrawingLibDetailsState.activeSessionUsers.length>0){
            const userIds= DrawingLibDetailsState.activeSessionUsers.filter((item: any)=> item.status).map((item: any)=>item.userId);
            setSelectedUsersList(userList.filter((item: any)=> userIds.includes(item.id)));
        } else{
            setSelectedUsersList([]);
        }
    }, [userList,DrawingLibDetailsState.activeSessionUsers])
    
    

    //fetch project users list
    const getProjectUsersLists= async()=>{
        try{
        dispatch(setIsLoading(true));
        const projectTeammatesResponse= await client.query({
            query:FETCH_PROJECT_USERS_LIST,
            variables:{
                projectId: Number(pathMatch.params.projectId),
                featureId: [5]
            },
            fetchPolicy: 'network-only',
            context:{role: myProjectRole.viewMyProjects }
            });
            const users: Array<any> = [];
            if(projectTeammatesResponse?.data.projectAssociation && projectTeammatesResponse?.data.projectPermission){
                const allowedRoles= projectTeammatesResponse?.data.projectPermission.map((item: any)=> item.roleId);
                projectTeammatesResponse?.data.projectAssociation.forEach((item: any)=>{
                    if (allowedRoles.indexOf(item.role) > -1 && item?.user) {
                        if(item.status!==1){
                            const user = {
                                id: item.user.id,
                                firstName:item.user.firstName,
                                lastName:item.user.lastName,
                                email: item.user.email,
                                status: item.status
                            };
                            users.push(user);
                        }
                    }
                })
            }
            setUserList(users);
            dispatch(setIsLoading(false));
        }catch(err){
            console.log(err);
            dispatch(setIsLoading(false));
        }
    }

    

    return (
        <div className="viewer-header">
            <div className="viewer-header__wrapper">
                <div className="viewer-header__wrapper__text">
                    <div className="viewer-header__wrapper__navBack">
                        <ArrowBackIosIcon onClick={() => props.navigateBack()}/>
                    </div>
                    <div className="viewer-header__wrapper__header">
                        <h2>    
                            <Tooltip title={''} aria-label="delete category">
                                <label>
                                    Drawing Viewer
                                </label>
                            </Tooltip>
                        </h2>
                        {selectedUsersList.length>0 && (
                            <AvatarGroup max={3} className="viewer-header__wrapper__followers__container__user">
                                {selectedUsersList.map((item: any)=>(
                                    <Tooltip title={`${item.firstName} ${item.lastName}`} key={item.id}>
                                        <Avatar alt={`${item.firstName} ${item.lastName}`} src="/" />
                                    </Tooltip>
                                ))}
                            </AvatarGroup>
                           )}
                    </div>
                </div>
                <div className="viewer-header__wrapper__selectBox">
                    {/* <DrawingVersions /> */}
                </div>
                <div className="viewer-header__wrapper__followers">
                    <DrawingVersions />
                    {DrawingLibDetailsState.isLoadingSession?(""):(
                        !DrawingLibDetailsState.drawingSessionId ?
                        (<InviteProjectTeammates
                        subscribe={props.subscribe} userList={userList}/> )
                        :DrawingLibDetailsState.drawingSessionId && DrawingLibDetailsState.collaborationEnabled ?(
                           <InviteProjectTeammates
                           subscribe={props.subscribe} userList={userList}/> 
                        ):("") 
                    )}
                </div>
            </div>
        </div>
    )
}

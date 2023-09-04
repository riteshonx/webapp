import React, {
  ReactElement,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { match, useRouteMatch } from "react-router-dom";
import { myProjectRole } from "src/utils/role";
import { client } from "src/services/graphql";
import "./InsightSendMail.scss";
import { Avatar, Checkbox, Chip, IconButton } from "@material-ui/core";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import { axiosApiInstance } from "src/services/api";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { InsightMail } from "./insightMail";
import { decodeExchangeToken } from "src/services/authservice";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { ScheduleImpactTask } from "src/modules/insights/models/insights";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { FETCH_PROJECT_ASSOCIATED_USERS } from "src/modules/insights/graphql/queries/schedule";

interface Params {
  projectId: string;
  id: string;
  featureId: string;
}
interface User {
  name: string;
  email: string;
  id: string;
}

const NOTIFICATION_URL: any = process.env["REACT_APP_NOTIFICATION_URL"];
const NOTIFICATION_PATH = "V1/notification";

interface IInsightSendMailProps {
  insight: any;
  onClose: () => void;
}

export default function InsightSendMail({
  insight,
  onClose,
}: IInsightSendMailProps): ReactElement {
  const [userList, setUserList]: any = React.useState([] as Array<User>);
  const [assigneesList, setAssigneesList]: any = React.useState(
    [] as Array<User>
  );
  const [userSearchName, setUserSearchName] = useState("");
  const [description, setDescription] = useState("");
  const pathMatch: match<Params> = useRouteMatch();
  const [openSearch, setOpenSearch] = useState(false);
  const wrapperRef: any = useRef(null);
  const { state, dispatch }: any = useContext(stateContext);

  useEffect(() => {
    fetchSearchedUsers();
  }, []);
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (wrapperRef?.current && !wrapperRef?.current?.contains(event.target)) {
        setOpenSearch(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const fetchSearchedUsers = async () => {
    try {
      const projectAssociationResponse = await client.query({
        query: FETCH_PROJECT_ASSOCIATED_USERS,
        fetchPolicy: "network-only",
        variables: {
          projectId: state?.currentProject?.projectId,
        },
        context: { role: myProjectRole.viewMyProjects },
      });
      const targetUsers: Array<any> = [];
      if (projectAssociationResponse.data.projectAssociation.length > 0) {
        projectAssociationResponse.data.projectAssociation.forEach(
          (item: any) => {
            try {
              const name =
                item.status == 3 && item.user.firstName && item.user.lastName
                  ? `${item.user.firstName} ${item.user.lastName}`
                  : item.user.email.split("@")[0];
              if (
                !targetUsers.find((user: User) => {
                  return user.id === item.user.id;
                })
              ) {
                const user = {
                  name: name,
                  email: item.user.email,
                  id: item.user.id,
                } as User;
                targetUsers.push(user);
              }
            } catch {}
          }
        );
      }
      setUserList(targetUsers);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const assigneesIdList = (): Array<string> => {
    return assigneesList.map((assigne: User) => assigne.id);
  };

  const toggleUser = (user: User) => {
    const index = assigneesIdList().indexOf(user.id);
    if (index === -1) {
      setAssigneesList([...assigneesList, user]);
    } else {
      assigneesList.splice(index, 1);
      setAssigneesList([...assigneesList]);
    }
  };

  const frameEmailPayload = () => {
    const selectedUsers = assigneesList.map((item: User) => ({
      id: item.id,
      email: item.email,
    }));
    const currentProject = state.currentProject;
    const host = `${location.protocol}//${location.host}`;
    const redirectionUrl = `${host}/slate-assist/${state?.currentProject?.projectId}/${insight?.id}`;
    const templateBody = {
      userName: decodeExchangeToken().userName,
      projectName: currentProject?.projectName || "",
      insight: insight,
      // redirectionUrl: window.location.href,
      redirectionUrl: redirectionUrl,
      description: description,
    };
    const htmlEmail = InsightMail(templateBody);
    const payload: any = [
      {
        users: selectedUsers,
        email: true,
        // eslint-disable-next-line max-len
        emailTemplate: htmlEmail,
        subject: `${
          decodeExchangeToken().userName
        } has shared an insight with you`,
        contentModified: {
          actionType: "ADDED",
          tenantFeatureId: null,
          projectFeatureId: 5,
          projectId: state?.currentProject?.projectId,
          fieldName: "Schedule Impact Insight",
          oldValue: null,
          newValue: null,
          navigationUrl: {
            serviceName: "authentication",
            path: `${host}/slate-assist`,
          },
        },
      },
    ];
    return payload;
  };

  //post call for sending mail notification
  const sendEmailCall = async () => {
    try {
      const payload = frameEmailPayload();
      dispatch(setIsLoading(true));
      const response: any = await axiosApiInstance.post(
        `${NOTIFICATION_URL}${NOTIFICATION_PATH}`,
        payload,
        {
          headers: {
            token: "exchange",
          },
        }
      );
      if (response.data.success) {
        dispatch(setIsLoading(false));
        Notification.sendNotification(
          "Email sent successfully",
          AlertTypes.success
        );
        onClose();
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(error, AlertTypes.warn);
    }
  };

  return (
    <div className="insight-mail">
      <div className="insight-mail_container">
        <div className="insight-mail_nav">
          <h3>Share Insight</h3>
          <IconButton
            className="insight-mail_nav_iconContainer"
            onClick={onClose}
          >
            <CancelOutlinedIcon htmlColor="#fe9a0b" />
          </IconButton>
        </div>
        <div className="insight-mail_user" ref={wrapperRef}>
          <div className="insight-mail_user_search">
            {assigneesList.map((user: User) => {
              return (
                <Chip
                  className="insight-mail_user_chips"
                  key={user.id}
                  label={user.name}
                  variant="outlined"
                  size="small"
                  onDelete={() => toggleUser(user)}
                />
              );
            })}
            <input
              type="text"
              onFocus={() => {
                setOpenSearch(true);
              }}
              value={userSearchName}
              placeholder="Select User"
              onChange={(e) => setUserSearchName(e.target.value)}
            />
          </div>
          {openSearch ? (
            <div className="insight-mail_user_select">
              {userList
                .filter((user: User) => {
                  return user.name
                    .toLowerCase()
                    .includes(userSearchName.toLowerCase());
                })
                .map((user: User, index: number) => {
                  return (
                    <div
                      onClick={() => {
                        toggleUser(user);
                      }}
                      className="insight-mail_user_option"
                      key={user.id + index}
                    >
                      <Avatar alt={user.name} />
                      <div className="insight-mail_user_detail">
                        <div className="insight-mail_user_name">
                          {user.name}
                        </div>
                        <div className="insight-mail_user_email">
                          {user.email}
                        </div>
                      </div>
                      <Checkbox checked={assigneesIdList().includes(user.id)} />
                    </div>
                  );
                })}
            </div>
          ) : (
            <></>
          )}
        </div>
        <label>Description</label>
        <textarea
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        ></textarea>
        <div className="insight-mail_action">
          <button
            disabled={!assigneesList.length}
            onClick={sendEmailCall}
            className="insight-mail_action_submit"
          >
            Send
          </button>
          <button onClick={onClose} className="insight-mail_action_cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

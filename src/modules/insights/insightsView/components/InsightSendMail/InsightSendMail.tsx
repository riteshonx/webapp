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
import { Avatar, Checkbox, Chip } from "@material-ui/core";
import { axiosApiInstance } from "src/services/api";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { ScheduleImpactEmailTemplate } from "../../template/scheduleImpactMail";
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
  scheduleImpactList: Array<ScheduleImpactTask>;
  detailScheduleImpact: ScheduleImpactTask;
  shareAll: boolean;
  onClose: () => void;
}

export default function InsightSendMail({
  scheduleImpactList,
  detailScheduleImpact,
  shareAll,
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
        variables: {
          projectId: state?.currentProject?.projectId,
        },
        fetchPolicy: "network-only",
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
    const currentProject = state.projectList.find(
      (item: any) => item.projectId == pathMatch.params.projectId
    );
    let templateBody, htmlEmail;
    if (!shareAll) {
      templateBody = {
        userName: decodeExchangeToken().userName,
        projectName: currentProject?.projectName || "",
        scheduleImpactList: [detailScheduleImpact],
        redirectionUrl: window.location.href,
        description: description,
      };
      htmlEmail = ScheduleImpactEmailTemplate(templateBody);
    } else {
      templateBody = {
        userName: decodeExchangeToken().userName,
        projectName: currentProject?.projectName || "",
        scheduleImpactList: scheduleImpactList,
        redirectionUrl: window.location.href,
        description: description,
      };
      htmlEmail = ScheduleImpactEmailTemplate(templateBody);
    }
    const payload: any = [
      {
        users: selectedUsers,
        email: true,
        // eslint-disable-next-line max-len
        emailTemplate: htmlEmail,
        subject: `${
          decodeExchangeToken().userName
        } would like to share some insights with you`,
        contentModified: {
          actionType: "ADDED",
          tenantFeatureId: null,
          projectFeatureId: 5,
          projectId: pathMatch.params.projectId,
          fieldName: "Schedule Impact Insight",
          oldValue: null,
          newValue: null,
          navigationUrl: {
            serviceName: "authentication",
            path: `/insights/projects/${pathMatch.params.projectId}/scheduleImpact/insight/${pathMatch.params.id}`,
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
          <svg
            onClick={onClose}
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="#3B3B3B"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.1653 8.33544C17.1653 8.21634 17.0678 8.1189 16.9487 8.1189L15.1623 8.12702L12.4718 11.3345L9.78401 8.12972L7.99486 8.1216C7.87576 8.1216 7.77832 8.21634 7.77832 8.33814C7.77832 8.38957 7.79727 8.43829 7.82975 8.47889L11.3512 12.6743L7.82975 16.8671C7.79704 16.9067 7.77889 16.9564 7.77832 17.0078C7.77832 17.1269 7.87576 17.2244 7.99486 17.2244L9.78401 17.2162L12.4718 14.0088L15.1596 17.2135L16.946 17.2216C17.0651 17.2216 17.1626 17.1269 17.1626 17.0051C17.1626 16.9537 17.1436 16.905 17.1111 16.8644L13.5951 12.6716L17.1166 8.47619C17.149 8.43829 17.1653 8.38686 17.1653 8.33544Z"
              fill="#3B3B3B"
            />
            <path
              d="M12.4719 0.492188C5.77541 0.492188 0.345703 5.9219 0.345703 12.6184C0.345703 19.3148 5.77541 24.7445 12.4719 24.7445C19.1683 24.7445 24.598 19.3148 24.598 12.6184C24.598 5.9219 19.1683 0.492188 12.4719 0.492188ZM12.4719 22.6874C6.91224 22.6874 2.40282 18.178 2.40282 12.6184C2.40282 7.05872 6.91224 2.54931 12.4719 2.54931C18.0315 2.54931 22.5409 7.05872 22.5409 12.6184C22.5409 18.178 18.0315 22.6874 12.4719 22.6874Z"
              fill="#3B3B3B"
            />
          </svg>
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
          <button onClick={onClose} className="insight-mail_action_cancel">
            Cancel
          </button>
          <button
            disabled={!assigneesList.length}
            onClick={sendEmailCall}
            className="insight-mail_action_submit"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

import { useContext, useEffect } from "react";
import { axiosApiInstance } from "src/services/api";
import { CircularProgress } from "@material-ui/core";
import moment from "moment";
import "./Notification.scss";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  setNotificationError,
  setNotificationLoaded,
  setNotificationLoading,
  setNotificationTriggerFetch,
} from "src/modules/root/context/authentication/action";

const NOTIFICATION_URL: any = process.env["REACT_APP_NOTIFICATION_URL"];
const PATH = "V1/notification";

const Notification = ({
  closePopup,
  unreadCount,
  handleUpdateUnreadCount,
}: any) => {
  const { state, dispatch }: any = useContext(stateContext);

  useEffect(() => {
    (async () => {
      dispatch(setNotificationLoading());
      try {
        const response = await axiosApiInstance.get(
          `${NOTIFICATION_URL}${PATH}`,
          {
            headers: {
              token: "exchange",
            },
          }
        );
        dispatch(setNotificationLoaded(response.data.success.notifications));
        handleUpdateUnreadCount(Number(response.data.success.count));
      } catch (e) {
        dispatch(setNotificationError());
        console.error("Error occurred while fetching notifications");
      }
    })();
  }, []);

  async function handleMarkAllAsRead() {
    await axiosApiInstance.patch(
      `${NOTIFICATION_URL}${PATH}`,
      {},
      {
        headers: {
          token: "exchange",
        },
      }
    );
    handleUpdateUnreadCount(0);
    dispatch(setNotificationTriggerFetch(!state.triggerNotificationFetch));
  }

  async function handleMarkItemAsRead(id: any, shouldClosePopUp = true) {
    await axiosApiInstance.patch(
      `${NOTIFICATION_URL}${PATH}`,
      {},
      {
        params: {
          id,
        },
        headers: {
          token: "exchange",
        },
      }
    );
    dispatch(setNotificationTriggerFetch(!state.triggerNotificationFetch));
    if (shouldClosePopUp) closePopup();
  }

  if (state.isNotificationLoading) {
    return (
      <div className="notification_container">
        <div className="notification_container_center">
          <CircularProgress size="3rem" />
          <p className="notification_container_center_helper_text">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  if (state.isNotificationError) {
    return (
      <div className="notification_container">
        <div className="notification_container_center">
          <p className="notification_container_center_helper_text">
            Uh oh! Something went wrong
          </p>
        </div>
      </div>
    );
  }

  if (state.notification.length === 0) {
    return (
      <div className="notification_container">
        <div className="notification_container_center">
          <p className="notification_container_center_helper_text_bold">
            You're all set 👍
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification_container">
      <div className="notification_container_headerSection">
        <h1 className="notification_container_headerSection_header">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <p className="notification_container_headerSection_notificationCountPill">
            {unreadCount}
          </p>
        )}
        <div
          className="notification_container_headerSection_markAllAsRead"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </div>
      </div>
      <div className="notification_container_items_container">
        {state.notification?.map((notification: any) => {
          const { id, navigationUrl, message, date, metaData, readStatus } =
            notification;
          const initials = message
            .split(" ")
            .splice(0, 1)
            .map((word: string) => word.charAt(0).toUpperCase());
          return (
            <div
              key={id}
              className={`notification_status ${
                !readStatus && "notification_status_unread"
              }`}
            >
              <a
                target="_blank"
                href={navigationUrl}
                className="notification_container_item"
                onClick={() => {
                  if (navigationUrl) {
                    handleMarkItemAsRead(id);
                  }
                  handleMarkItemAsRead(id, false);
                }}
              >
                <div className="notification_container_item_content">
                  {/* <div className="notification_container_item_content_avatar">
                    {initials}
                  </div> */}
                  <div className="notification_container_item_content_message_box">
                    <p
                      className={
                        !readStatus
                          ? "notification_container_item_content_message_box_message notification_status_unread"
                          : "notification_container_item_content_message_box_message"
                      }
                    >
                      {message}
                    </p>
                    {metaData?.projectFeature?.name && (
                      <span className="notification_container_item_content_message_box_action">
                        {metaData?.projectFeature?.name}
                      </span>
                    )}
                  </div>
                </div>
                <p className="notification_container_item_timeAgo">
                  {(() => {
                    let currentDate = moment.utc(date).fromNow();
                    if (currentDate.includes("day")) {
                      currentDate = moment.utc(date).format("DD MMM yyyy");
                    }
                    return currentDate;
                  })()}
                </p>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notification;

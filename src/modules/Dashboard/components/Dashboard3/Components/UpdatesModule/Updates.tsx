import React, { ReactElement, useContext, useEffect } from "react";
import {
  setNotificationError,
  setNotificationLoaded,
  setNotificationLoading,
  setNotificationTriggerFetch,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { axiosApiInstance } from "src/services/api";
import InsightsLP from "../insightsLP/InsightsLP";
import NotificationUpdates from "../NotificationUpdates/NotificationUpdates";
import "./Updates.scss";

const NOTIFICATION_URL: any = process.env["REACT_APP_NOTIFICATION_URL"];
const PATH = "V1/notification";

const Updates = ({
  unreadCount,
  handleUpdateUnreadCount,
  updatesTab,
  setUpdatesTab,
}: any): ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);

  useEffect(() => {
    if (!updatesTab) {
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
    }
  }, [state.triggerNotificationFetch, updatesTab]);

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

  async function handleMarkItemAsRead(id: any) {
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
  }

  return (
    <div className="updates-main">
      <div className="updates-main__headerContainer">
        Updates
        {!updatesTab && unreadCount > 0 && (
          <span className="updates-main__headerContainer__unreadCount">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="updates-main__insightsAndNotificationsheaderContainer">
        <span className="updates-main__insightsAndNotificationsheaderContainer__1">
          <span
            className={
              updatesTab
                ? "updates-main__insightsAndNotificationsheaderContainer__1__text active"
                : "updates-main__insightsAndNotificationsheaderContainer__1__text"
            }
            onClick={() => setUpdatesTab(true)}
          >
            Insights
          </span>

          <span
            onClick={() => setUpdatesTab(false)}
            className={
              !updatesTab
                ? "updates-main__insightsAndNotificationsheaderContainer__1__text active"
                : "updates-main__insightsAndNotificationsheaderContainer__1__text"
            }
          >
            My Notifications
          </span>
        </span>
        {!updatesTab && state.notification?.length ? (
          <span
            className="updates-main__insightsAndNotificationsheaderContainer__1__markAllAsReadText"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </span>
        ) : (
          <></>
        )}
      </div>
      {updatesTab && <InsightsLP />}
      {!updatesTab && (
        <NotificationUpdates
          notification={{
            messages: state?.notification,
            isLoading: state?.isNotificationLoading,
            isError: state?.isNotificationError,
          }}
          handleMarkItemAsRead={handleMarkItemAsRead}
        />
      )}
    </div>
  );
};

export default Updates;

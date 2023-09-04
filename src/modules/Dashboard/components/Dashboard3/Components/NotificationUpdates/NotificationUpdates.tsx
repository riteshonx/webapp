import { CircularProgress } from "@material-ui/core";
import moment from "moment";
import React, { ReactElement } from "react";
import "./NotificationUpdates.scss";

interface NotificationUpdates {
  handleMarkItemAsRead: any;
  notification: any;
}

const NotificationUpdates = ({
  handleMarkItemAsRead,
  notification,
}: NotificationUpdates): ReactElement => {
  if (notification.isLoading) {
    return (
      <div className="notificationUpdates-main__loadingErrorNoMessagesContainer">
        <div className="notificationUpdates-main__loadingErrorNoMessagesContainer__1">
          <CircularProgress size="3rem" />
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  if (notification.isError) {
    return (
      <div className="notificationUpdates-main__loadingErrorNoMessagesContainer">
        <div className="notificationUpdates-main__loadingErrorNoMessagesContainer__1">
          <p>Uh oh! Something went wrong</p>
        </div>
      </div>
    );
  }

  if (notification.messages.length === 0) {
    return (
      <div className="notificationUpdates-main__loadingErrorNoMessagesContainer">
        <div className="notificationUpdates-main__loadingErrorNoMessagesContainer__1">
          <p className="notification_container_center_helper_text_bold">
            You're all set 👍
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="notificationUpdates-main">
      {notification.messages.map((notification: any) => {
        const { id, navigationUrl, message, date, metaData, readStatus } =
          notification;
        const initials = message
          .split(" ")
          .splice(0, 1)
          .map((word: string) => word.charAt(0).toUpperCase());
        return (
          <a
            key={id}
            target="_blank"
            href={navigationUrl}
            onClick={() => {
              if (navigationUrl) {
                handleMarkItemAsRead(id);
              }
              handleMarkItemAsRead(id, false);
            }}
            className={
              !readStatus
                ? `notificationUpdates-main__card notificationUpdates-main__card__unread`
                : `notificationUpdates-main__card`
            }
          >
            {metaData?.projectFeature?.name && (
              <span className="notificationUpdates-main__card__name">
                {metaData?.projectFeature?.name}
              </span>
            )}
            <span className="notificationUpdates-main__card__message">
              {message}
            </span>
            <span className="notificationUpdates-main__card__currentDate">
              {(() => {
                let currentDate = moment.utc(date).fromNow();
                if (currentDate.includes("day")) {
                  currentDate = moment.utc(date).format("DD MMM yyyy");
                }
                return currentDate;
              })()}
            </span>
          </a>
        );
      })}
    </div>
  );
};

export default NotificationUpdates;

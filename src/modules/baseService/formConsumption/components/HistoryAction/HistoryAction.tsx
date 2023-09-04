import { ReactElement, useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import "./HistoryAction.scss";
import moment from "moment";
import { FieldType } from "src/utils/constants";
import {
  groupByKey,
  dateSorter,
  ignoredEvents,
  removeAllEventsExcept,
  FieldNameMap,
} from "./HistoryUtils";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
interface IHistoryData {
  historyData: Array<any>;
  commentsHistoryData: Array<any>;
}

// The following method takes in an array of events, ignores certain events and creates a custom array of data.
function generateEnrichedFormsHistory(
  historyData: Array<any>,
  commentsHistoryData: Array<any>
): Array<any> {
  const mergedHistoryData = [...commentsHistoryData, ...historyData]
    .sort(dateSorter)
    .map((item) => {
      const newItem = { ...item };
      newItem.createdAt = item.createdAt.split(".")[0];
      return newItem;
    });

  const filteredEvents = mergedHistoryData.filter(
    ({ field }: any) =>
      !ignoredEvents.some((ignoredEvent) => ignoredEvent === field)
  );
  const groupedHistoryEvents = groupByKey(filteredEvents, "createdAt");
  const historyEventsTimeline = Object.keys(groupedHistoryEvents);
  const firstTimelineEvent = historyEventsTimeline.slice(-1)[0];

  const firstGroupedTimeLineEvent = groupedHistoryEvents[firstTimelineEvent];
  groupedHistoryEvents[firstTimelineEvent] = removeAllEventsExcept(
    firstGroupedTimeLineEvent,
    FieldType.PROJECT_AUTO_INCREMENT
  );

  const groupedEvents: any = {};

  const historyEventEntries: any = Object.entries(groupedHistoryEvents);
  for (const [timestamp, listOfEvents] of historyEventEntries) {
    const timeStampEvents: any = [];
    for (const currentEvent of listOfEvents) {
      const historyContent: any = {
        ...currentEvent,
        displayField: currentEvent.field,
      };
      const { verbiage, historyForms } = currentEvent;

      if (!historyForms?.length) {
        if (verbiage) {
          historyContent.displayField = verbiage;
        }
      } else {
        const [historyFormEvent] = historyForms; // 1 - 1 relationship
        const {
          userId,
          userGroupId,
          attachmentId,
          companyId,
          configReferenceId,
          followerUserId,
          locationReferenceId,
        } = historyFormEvent;

        if (userId) {
          historyContent.type = "USER";
          historyContent.userDetails = historyFormEvent.associatedUser;
        }
        if (userGroupId) {
          historyContent.type = "USER_GROUP";
          historyContent.userGroupDetails = historyFormEvent.userGroup.name;
        }
        if (attachmentId) {
          historyContent.type = "ATTACHMENT";
          historyContent.attachmentDetails = historyFormEvent.attachment;
        }
        if (companyId) {
          historyContent.type = "COMPANY";
          historyContent.companyDetails =
            historyFormEvent.companyMaster?.tenantCompanyAssociations[0].name;
        }
        if (configReferenceId) {
          historyContent.type = "CONFIG";
          historyContent.configDetails =
            historyFormEvent.configurationValue?.formsConfigLists[0]?.configValue;
        }
        if (followerUserId) {
          historyContent.type = "FOLLOWER";
          historyContent.followerDetails = historyFormEvent.followerUser;
        }
        if (locationReferenceId) {
          historyContent.type = "LOCATION";
          historyContent.locationDetails = historyFormEvent.projectLocationTree.nodeName;
        }
      }
      if (!parseFloat(historyContent.displayField))
        //this ignores table events
        timeStampEvents.push(historyContent);
    }

    const groupedEventsByTimestamp = groupedEvents[timestamp];
    if (groupedEventsByTimestamp) {
      groupedEvents[timestamp] = {
        ...groupedEventsByTimestamp,
        timeStampEvents,
      };
    } else {
      groupedEvents[timestamp] = timeStampEvents;
    }
  }
  return groupedEvents;
}

const renderContentComponents = (activity: any) => {
  return (
    <>
      {(() => {
        switch (activity.field) {
          case FieldType.DUE_DATE:
          case FieldType.VALUE_DATE: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                {activity?.oldValue && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      {moment(activity?.oldValue)
                        .utc()
                        .format("MMM DD YYYY")
                        ?.toString()}
                      {/* {activity.oldValue} */}
                    </div>
                    <div className="action__wrapper__details_container__arrow">
                      <ArrowRightAltIcon />
                    </div>
                  </>
                )}

                <div className="action__wrapper__details_container_hLayout__newValue">
                  {moment(activity?.newValue)
                    .utc()
                    .format("MMM DD YYYY")
                    ?.toString()}
                </div>
              </div>
            );
          }
          case FieldType.VALUE_TIME: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                {activity?.oldValue && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      {moment(activity?.oldValue, "HH:mm:ss")
                        .format("hh:mm A")
                        ?.toString()}
                    </div>
                    <div className="action__wrapper__details_container__arrow">
                      <ArrowRightAltIcon />
                    </div>
                  </>
                )}

                <div className="action__wrapper__details_container_hLayout__newValue">
                  {moment(activity?.newValue, "HH:mm:ss")
                    .format("hh:mm A")
                    ?.toString()}
                </div>
              </div>
            );
          }
          case FieldType.VALUE_INT:
          // case FieldType.PROJECT_AUTO_INCREMENT:
          case FieldType.COST_IMPACT_COMMENTS:
          case FieldType.SCHEDULE_IMPACT_COMMENTS:
          case FieldType.VALUE_BOOL:
          case FieldType.VALUE_STRING: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                {activity?.oldValue && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      {activity?.oldValue?.toString()}
                    </div>
                    <div className="action__wrapper__details_container__arrow">
                      <ArrowRightAltIcon />
                    </div>
                  </>
                )}

                <div className="action__wrapper__details_container_hLayout__newValue">
                  {activity?.newValue?.toString()}
                </div>
              </div>
            );
          }
          case FieldType.COMMENT: {
            return (
              <div className="action__wrapper__details_vLayout">
                {activity?.oldValue && (
                  <>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: activity?.oldValue,
                      }}
                      className="action__wrapper__details_vLayout_commentBox"
                    />
                    <div className="action__wrapper__details_container__arrow">
                      <ArrowRightAltIcon
                        style={{ transform: "rotate(90deg)", margin: "12px" }}
                      />
                    </div>
                  </>
                )}

                <div
                  dangerouslySetInnerHTML={{
                    __html: activity?.newValue,
                  }}
                  className="action__wrapper__details_vLayout_commentBox"
                />
              </div>
            );
          }
          case FieldType.DELETED: {
            return (
              <div
                dangerouslySetInnerHTML={{ __html: activity?.comment?.comment }}
                className="action__wrapper__details_vLayout_commentBox"
              />
            );
          }
          case FieldType.COST_IMPACT:
          case FieldType.SCHEDULE_IMPACT: {
            return (
              <div className="action__wrapper__details_container__boolean">
                {activity?.oldValue && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      {activity?.oldValue === "true" ? "Yes" : "No"}
                    </div>
                    <div className="action__wrapper__details_container__arrow">
                      <ArrowRightAltIcon />
                    </div>
                  </>
                )}

                <div className="action__wrapper__details_container_hLayout__newValue">
                  {activity?.newValue === null
                    ? "Clear"
                    : activity?.newValue === "true"
                    ? "Yes"
                    : "No"}
                </div>
              </div>
            );
          }
          case FieldType.CUSTOM_LIST:
          case FieldType.RFI_TYPE:
            return (
              <div className="action__wrapper__details_container__boolean">
                {activity?.oldValue && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      {activity?.oldValue ? activity.oldValue : null}
                    </div>
                    <div className="action__wrapper__details_container__arrow">
                      <ArrowRightAltIcon />
                    </div>
                  </>
                )}

                {activity?.historyForms[0]?.configurationValue
                  ?.formsConfigLists[0]?.configValue[0] && (
                  <div className="action__wrapper__details_container_hLayout__newValue">
                    {
                      activity?.historyForms[0]?.configurationValue
                        ?.formsConfigLists[0]?.configValue[0]
                    }
                  </div>
                )}
              </div>
            );
          // case FieldType.FORMS_FOLLOWER:
          case FieldType.COMPANY_LIST:
          case FieldType.RESPONSIBLE_CONTRACTOR:
          case FieldType.MULTI_VALUE_COMPANY:
          case FieldType.SINGLE_VALUE_COMPANY: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                {activity?.historyForms[0].companyMaster
                  .tenantCompanyAssociations[0] && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      <span className="userName">
                        {activity?.historyForms[0].companyMaster
                          .tenantCompanyAssociations[0].name
                          ? activity?.historyForms[0].companyMaster
                              .tenantCompanyAssociations[0].name
                          : null}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          }
          // case FieldType.SINGLE_VALUE_COMPANY:
          case FieldType.SINGLE_VALUE_USER:
          case FieldType.USER_LIST:
          case FieldType.MULTI_VALUE_USER: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                {activity?.userDetails && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      <span className="userName">
                        {generateName(activity, true, true)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          }

          case FieldType.FORMS_FOLLOWER: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                {activity?.followerDetails && (
                  <>
                    <div className="action__wrapper__details_container_hLayout__oldValue">
                      <span className="userName">
                        {generateFollowerName(activity)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          }

          case FieldType.ATTACHMENT_COPY:
          case FieldType.ATTACHMENT: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                {activity?.historyForms[0]?.attachment.fileName && (
                  <div className="action__wrapper__details_container_hLayout__newValue">
                    {activity?.historyForms[0]?.attachment.fileName}
                  </div>
                )}
              </div>
            );
          }
          case FieldType.PROJECT_AUTO_INCREMENT: {
            return <div></div>;
          }
          case FieldType.ASSIGNEE: {
            return (
              <div className="action__wrapper__details_container_hLayout">
                <div className="action__wrapper__details_container_hLayout__newValue">
                  {generateName(activity, true, true)}
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })()}
    </>
  );
};

const generateHeaderVerb = (activity: any) => {
  const { field, oldValue, newValue } = activity;
  switch (field) {
    case FieldType.PROJECT_AUTO_INCREMENT:
      return "published the form";
    case FieldType.FORMS_FOLLOWER:
      return "added a follower";
    case FieldType.ASSIGNEE:
    case FieldType.ATTACHMENT:
      return `${newValue.toLowerCase()} an`;
    case FieldType.DELETED:
      return "deleted a";
    case FieldType.COMMENT:
      return oldValue ? "updated a" : "added a";
    case FieldType.USER_LIST:
    case FieldType.COMPANY_LIST:
      return `${newValue.toLowerCase()}`;
    case FieldType.VALUE_BOOL:
    case FieldType.SCHEDULE_IMPACT:
    case FieldType.COST_IMPACT:
      if (oldValue === null && newValue) {
        return "selected";
      }
      return "updated";
    case FieldType.RESPONSIBLE_CONTRACTOR:
      return "selected";
    case FieldType.RFI_TYPE:
      return `${newValue.toLowerCase()}`;
  }
  return oldValue ? "updated" : "added";
};

const generateName = (
  activity: any,
  withLastName = false,
  fromUserDetails = false
) => {
  try{
    const { firstName, lastName, email } = fromUserDetails
    ? activity.userDetails
    : activity.user;

  if (firstName) {
    if (withLastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName;
  }
  return email;
  } catch(error: any){
    return '-';
  }
};

const generateFollowerName = (activity: any) => {
  const {
    followerDetails: { firstName, lastName, email },
  } = activity;
  if (firstName) {
    return `${firstName} ${lastName}`;
  }
  return email;
};

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const generateActionItem = (activity: any) => {
  const { field, verbiage, displayField, locationDetails } = activity;
  if (
    field === FieldType.PROJECT_AUTO_INCREMENT ||
    field === FieldType.FORMS_FOLLOWER
  ) {
    return "";
  }
  if (field === FieldType.DELETED) {
    return "Comment";
  }
  if (verbiage) return verbiage;
  const mappedValue = FieldNameMap.get(displayField);
  if (mappedValue) return mappedValue;
  if(locationDetails) return locationDetails;
  return capitalizeFirstLetter(displayField);
};

const TimeLine = ({ timestamp, isFirst }: any) => (
  <div className="action__wrapper__timeline">
    <div className="action__wrapper__timeline__date">
      {moment.utc(timestamp).format("DD MMM").toString()}
    </div>
    <div className="action__wrapper__timeline__time">
      {moment.utc(timestamp).format("hh:mm:ss a").toString()}
    </div>
    {!isFirst && <div className="action__wrapper__timeline__line" />}
  </div>
);

const TimeLineData = ({ activity }: any) => (
  <div className="action__wrapper__details">
    <div className="action__wrapper__details__header">
      <div className="action__wrapper__details__header_left">
        <Avatar alt={generateName(activity)} src="" />
      </div>
      <div className="action__wrapper__details__header__right">
        <div className="action__wrapper__details__header__text">
          <span className="userName">{generateName(activity, true)}</span>{" "}
          <span>{generateHeaderVerb(activity)}</span>{" "}
          {activity?.field && (
            <span className="userName">{generateActionItem(activity)}</span>
          )}
        </div>
        <div className="action__wrapper__details__header__time">
          {moment.utc(activity.createdAt).fromNow()}
        </div>
      </div>
    </div>
    <div className="action__wrapper__details_container">
      {renderContentComponents(activity)}
    </div>
  </div>
);

export default function HistoryAction({
  historyData,
  commentsHistoryData,
}: IHistoryData): ReactElement {
  const [historyActivityDataFiltered, setHistoryActivityData] = useState({});

  useEffect(() => {
    if (!historyData.length && !commentsHistoryData.length) return;
    const formsHistory = generateEnrichedFormsHistory(
      historyData,
      commentsHistoryData
    );
    setHistoryActivityData(formsHistory);
  }, [historyData, commentsHistoryData]);

  return (
    <div className="action">
      {Object.entries(historyActivityDataFiltered).map(
        ([timestamp, activities]: any, index, { length }) => {
          return (
            activities.length > 0 && (
              <div key={timestamp} className="action__wrapper">
                <TimeLine
                  timestamp={timestamp}
                  isFirst={index === length - 1}
                />
                <div className="action__wrapper__grouped">
                  {activities.map((activity: any) => {
                    return <TimeLineData activity={activity} />;
                  })}
                </div>
              </div>
            )
          );
        }
      )}
    </div>
  );
}

import React, { useContext, useEffect, useState } from "react";
import "./InsightNotification.scss";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IconButton } from "@material-ui/core";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setZIndexPriority } from "src/modules/root/context/authentication/action";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  AutoAwesome as AutoAwesomeIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
} from "@mui/icons-material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@mui/icons-material";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import { Chip } from "@mui/material";
import { client } from "src/services/graphql";
import { INSIGHTS_LIST_BY_METRIC } from "src/modules/insights/graphql/queries/schedule";
import { setPreference } from "src/modules/root/context/authentication/action";
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import classNames from "classnames";
import { FeedDetailCard } from "../../../Feeds/FeedDetailCard";
import LoadingCard from "src/modules/insights2/insightsView/components/LoadingCard/LoadingCard";

const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];

const InsightNotification = ({
  handleClose,
  setMailModal,
}: any): React.ReactElement => {
  const history: any = useHistory();
  const { dispatch, state }: any = useContext(stateContext);
  const [actionType, setActionType]: any = useState("");
  const [showFilter, setShowFilter]: any = useState(false);
  const [selectedTab, setSelectedTab]: any = useState("all");
  const [insightsData, setInsightsData]: any = useState([]);
  const [filterValues, setFilterValues]: any = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPopoverOpen,setIsPopoverOpen] = useState <boolean>(false)
  const [pageLimitAndOffset, setPageLimitAndOffset] = useState({
    limit: 10,
    offset: 0,
  });
  const [filterOptions, setFilterOptions] = useState([
    {
      name: "RFI",
      value: "RFI",
      checked: false,
    },
    {
      name: "Site Update",
      value: "DailyLogs",
      checked: false,
    },
    {
      name: "Weather",
      value: "Weather",
      checked: false,
    },
    {
      name: "Issues",
      value: "Issues",
      checked: false,
    },
    {
      name: "Checklist",
      value: "Checklist",
      checked: false,
    },
    {
      name: "Budget",
      value: "ChangeOrders",
      checked: false,
    },
  ]);
  const urlLocation = useLocation();

  useEffect(() => {
    if (urlLocation?.pathname?.includes("visualize")) {
      setFilterValues(["Issues", "Checklist"]);
      setShowFilter(true);
    } else if (
      urlLocation?.pathname === "/" &&
      state?.selectedMetric === "Budget"
    ) {
      setFilterValues(["ChangeOrders"]);
    } else {
      setFilterValues([]);
    }
  }, [urlLocation, state?.selectedMetric, state?.currentProject?.projectId]);

  useEffect(() => {
    state?.selectedProjectToken &&
      state?.currentProject?.projectId &&
      setPageLimitAndOffset({
        limit: 10,
        offset: 0,
      });
  }, [state.selectedProjectToken]);

  useEffect(() => {
    state?.selectedProjectToken &&
      state?.currentProject?.projectId &&
      getInsightsData();
  }, [pageLimitAndOffset]);

  useEffect(() => {
    if (
      state.selectedProjectToken &&
      state?.currentProject?.projectId &&
      Number(decodeProjectExchangeToken().projectId) ===
        Number(state?.currentProject?.projectId)
    ) {
      if (pageLimitAndOffset?.offset !== 0) {
        setPageLimitAndOffset({
          limit: 10,
          offset: 0,
        });
      } else {
        getInsightsData();
      }
    }
  }, [filterValues, selectedTab, state?.selectedPreference]);

  const getInsightsData = async () => {
    try {
      setIsLoading(true);
      if (state?.selectedMetric === "Collab") {
        setInsightsData([]);
        setIsLoading(false);
        return;
      }
      const response = await axios.post(
        `${process.env["REACT_APP_AUTHENTICATION_URL"]}v1/projectInsights`,
        {
          archived: false,
          favorites: selectedTab === "fav" ? true : false,
          datasources: filterValues,
          metrics:
            urlLocation?.pathname === "/" ||
            urlLocation?.pathname?.includes("scheduling")
              ? state?.selectedMetric === "Budget"
                ? ["Budget", "Productivity"]
                : ["Scheduler"]
              : [],
          limit: pageLimitAndOffset?.limit,
          offset: pageLimitAndOffset?.offset,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state?.selectedProjectToken}`,
          },
        }
      );

      const sortedList: any = response?.data?.data;

      if (sortedList?.length) {
        const insightsList: any = [];
        const insights_like_dislike =
          state?.selectedPreference?.insights_like_dislike || {};
        const insights_archives =
          state?.selectedPreference?.insights_archives || [];
        sortedList?.forEach((item: any) => {
          if (!insights_archives.includes(item.id)) {
            insightsList.push({
              id: item?.id,
              shortMsg: item?.messagesShortWeb?.msg,
              longMsg: item?.messagesLongWeb?.msg,
              recommendation: item?.recommendation?.msg_web || "",
              taskId: item?.taskId,
              isExpand: false,
              isLiked: insights_like_dislike[item.id]
                ? insights_like_dislike[item.id] === 1
                : 0,
              isDislike: insights_like_dislike[item.id]
                ? insights_like_dislike[item.id] === -1
                : 0,
              taskName: item?.projectTask?.taskName,
              source: item?.messagesLongWeb?.details?.map(
                ({ datasource }: any) => datasource
              ),
              details: item?.messagesLongWeb?.details,
              showInfo: false,
            });
          }
        });
        if (pageLimitAndOffset?.offset === 0) {
          setInsightsData(insightsList);
        } else {
          setInsightsData([...insightsData, ...insightsList]);
        }
        setIsLoading(false);
      } else {
        if (pageLimitAndOffset?.offset === 0) {
          setInsightsData([]);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const savePreference = async (data: any, type: any) => {
    let payload: any;
    if (type === "fav") {
      payload = {
        tenantId: Number(decodeExchangeToken().tenantId),
        userId: decodeExchangeToken().userId,
        preferencesJson: { ...state?.selectedPreference, insights_favs: data },
      };
    } else if (type === "pin") {
      payload = {
        tenantId: Number(decodeExchangeToken().tenantId),
        userId: decodeExchangeToken().userId,
        preferencesJson: {
          ...state?.selectedPreference,
          insights_pins: data,
        },
      };
    } else if (type === "dismiss") {
      payload = {
        tenantId: Number(decodeExchangeToken().tenantId),
        userId: decodeExchangeToken().userId,
        preferencesJson: {
          ...state?.selectedPreference,
          insights_archives: data,
        },
      };
    } else if (type === "likeDislike") {
      payload = {
        tenantId: Number(decodeExchangeToken().tenantId),
        userId: decodeExchangeToken().userId,
        preferencesJson: {
          ...state?.selectedPreference,
          insights_like_dislike: data,
        },
      };
    }

    const token = getExchangeToken();
    try {
      const response = await axios.post(
        `${DASHBOARD_URL}dashboard/savePreferences`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.status === 200) {
        setActionType("");
        dispatch(setPreference(payload.preferencesJson));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = () => {
    console.log("fetchData");
    setPageLimitAndOffset({
      limit: 10,
      offset: pageLimitAndOffset.offset + 10,
    });
  };

  const handleFavorite = ({ id }: any) => {
    if (selectedTab === "fav") {
      setActionType("fav" + id);
    }
    setTimeout(() => {
      const temp = state?.selectedPreference?.insights_favs || [];
      const index = temp.indexOf(id);
      if (index > -1) {
        temp.splice(index, 1); // 2nd parameter means remove one item only
        savePreference(temp, "fav");
      } else {
        temp.push(id);
        savePreference(temp, "fav");
      }
    }, 1000);
  };

  const handleDismiss = ({ id }: any) => {
    setActionType("dismiss" + id);

    setTimeout(() => {
      const temp = state?.selectedPreference?.insights_archives || [];
      const index = temp.indexOf(id);
      if (index > -1) {
        temp.splice(index, 1); // 2nd parameter means remove one item only
        savePreference(temp, "dismiss");
      } else {
        temp.push(id);
        savePreference(temp, "dismiss");
      }
      const updatedData = insightsData.filter((item: any) => item.id != id);
      setInsightsData(updatedData);
    }, 1000);
  };

  const handleExpand = ({ id }: any) => {
    const temp: any = insightsData?.map((item: any) => {
      if (item?.id === id) {
        return {
          ...item,
          isExpand: !item.isExpand,
        };
      } else {
        return {
          ...item,
          isExpand: false,
        };
      }
    });
    setInsightsData(temp);
    setIsPopoverOpen(false)
  };

  const updateFilter = (item: any) => {
    const temp: any = [...filterValues];
    const index = temp.indexOf(item.value);
    if (index > -1) {
      temp.splice(index, 1); // 2nd parameter means remove one item only
    } else {
      temp.push(item.value);
    }
    setFilterValues(temp);
  };

  const setLikeDislike = (id: number, order: number) => {
    const insightIndex = insightsData.findIndex((e: any) => e.id === id);
    const insightItem = insightsData[insightIndex];
    insightItem.isLiked = order === 1;
    insightItem.isDislike = order === -1;
    setInsightsData([
      ...insightsData.slice(0, insightIndex),
      insightItem,
      ...insightsData.slice(insightIndex + 1),
    ]);
    const temp = JSON.parse(
      JSON.stringify(state?.selectedPreference?.insights_like_dislike || {})
    );
    if (temp[id] === order) {
      temp[id] = 0;
    } else {
      temp[id] = order;
    }
    savePreference(temp, "likeDislike");
  };
 const handleScroll=()=>{
  setIsPopoverOpen(true)
 }
  return (
    <div
      className="insightNotification-container"
      style={{
        zIndex: state?.zIndexPriority === "insightNotification" ? 3 : 0,
      }}
      onClick={() => dispatch(setZIndexPriority("insightNotification"))}
    >
      <IconButton
        className="insightNotification-container__closeIconContainer"
        onClick={() => {
          handleClose();
        }}
      >
        <KeyboardArrowLeftIcon className="insightNotification-container__closeIconContainer__icon" />
      </IconButton>
      <div className="insightNotification-container__head">
        <span
          className={
            selectedTab === "all"
              ? "insightNotification-container__head__leftText1 insightNotification-container__head__textUnderline"
              : "insightNotification-container__head__leftText1"
          }
          onClick={() => setSelectedTab("all")}
        >
          All
        </span>{" "}
        <span
          className={
            selectedTab === "fav"
              ? "insightNotification-container__head__leftText2 insightNotification-container__head__textUnderline"
              : "insightNotification-container__head__leftText2"
          }
          onClick={() => setSelectedTab("fav")}
        >
          Fav
        </span>
        <span className="insightNotification-container__head__title">
          {urlLocation?.pathname === "/" ||
          urlLocation?.pathname?.includes("scheduling")
            ? state?.selectedMetric === "Budget"
              ? "Productivity Insights"
              : state?.selectedMetric === "Scheduler"
              ? "Schedule Insights"
              : ""
            : "Insights"}
        </span>
        {showFilter ? (
          <AutoAwesomeIcon
            className="insightNotification-container__head__filterIcon"
            onClick={() => setShowFilter(!showFilter)}
          />
        ) : (
          <AutoAwesomeOutlinedIcon
            className="insightNotification-container__head__filterIcon"
            onClick={() => setShowFilter(!showFilter)}
          />
        )}
        {history.location.pathname !== "/slate-assist" &&
            <IconButton
              className="insightNotification-container__head__expandIcon"
              onClick={() => {
                history.push("/slate-assist"), handleClose();
              }}
            >
              <OpenInFullRoundedIcon htmlColor="#fff" />
            </IconButton>
          }
      </div>
      {showFilter && (
        <div className="insightNotification-container__filtersContainer">
          {filterOptions?.map((option: any, index: any) => (
            <div
              key={index}
              className="insightNotification-container__filtersContainer__filterOption"
            >
              <Chip
                className={
                  filterValues?.includes(option?.value)
                    ? "insightNotification-container__filtersContainer__filterOption__chip insightNotification-container__filtersContainer__filterOption__activeChip"
                    : "insightNotification-container__filtersContainer__filterOption__chip"
                }
                label={option?.name}
                onClick={() => updateFilter(option)}
              />
            </div>
          ))}
        </div>
      )}
      <div
        className="insightNotification-container__insightsContainer"
        id="scrollableDiv"
        style={{
          maxHeight: showFilter ? "calc(100% - 90px)" : "calc(100% - 30px)",
          top: showFilter ? "12%" : "4%",
        }}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="insightNotification-container__insightsContainer__loader">
            <LoadingCard />
          </div>
        ) : (
          <></>
        )}
        {insightsData?.length ? (
          <InfiniteScroll
            dataLength={insightsData?.length ? insightsData?.length : 0} //This is important field to render the next data
            next={() => fetchData()}
            hasMore={true}
            scrollableTarget="scrollableDiv"
            loader={""}
          >
            <div
              className={
                "insightNotification-container__insightsContainer__scroll"
              }
            >
              {insightsData?.map((item: any, index: number) => (
                <div
                  key={index}
                  className={classNames({
                    "insightNotification-container__insightsContainer__messageCard insightNotification-container__insightsContainer__dismissCard":
                      actionType === "dismiss" + item.id,
                    "insightNotification-container__insightsContainer__messageCard insightNotification-container__insightsContainer__favCard":
                      actionType === "fav" + item.id,
                    "insightNotification-container__insightsContainer__messageCard insightNotification-container__insightsContainer__pinCard":
                      actionType === "pin" + item.id,
                    "insightNotification-container__insightsContainer__messageCard":
                      true,
                  })}
                >
                  <div
                    className="insightNotification-container__insightsContainer__messageCard__textContainer"
                    onClick={() => handleExpand(item)}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: item?.shortMsg }}
                    ></div>
                  </div>

                  {item?.isExpand && <FeedDetailCard insightDetail={item} isPopoverOpen={isPopoverOpen} setIsPopoverOpen={setIsPopoverOpen}/>}

                  <div className="insightNotification-container__insightsContainer__leftIconContainer">
                    <ThumbUpIcon
                      onClick={() => setLikeDislike(item.id, 1)}
                      className={
                        "insightNotification-container__insightsContainer__leftIconContainer__icon1" +
                        (item.isLiked ? " active" : "")
                      }
                    />
                    <ThumbDownIcon
                      onClick={() => setLikeDislike(item.id, -1)}
                      className={
                        "insightNotification-container__insightsContainer__leftIconContainer__icon2" +
                        (item.isDislike ? " active" : "")
                      }
                    />
                  </div>
                  <span className="insightNotification-container__insightsContainer__rightIconContainer">
                    <IconButton
                      className="insightNotification-container__insightsContainer__rightIconContainer__iconContainer"
                      onClick={() =>
                        setMailModal({
                          msgs: [{ msg: item?.longMsg }],
                          ...item,
                        })
                      }
                    >
                      <ShareRoundedIcon className="insightNotification-container__insightsContainer__rightIconContainer__iconContainer__icon" />
                    </IconButton>

                    <IconButton
                      className="insightNotification-container__insightsContainer__rightIconContainer__iconContainer"
                      onClick={() => {
                        handleFavorite(item);
                      }}
                    >
                      <FavoriteIcon
                        className="insightNotification-container__insightsContainer__rightIconContainer__iconContainer__icon"
                        style={{
                          color:
                            state?.selectedPreference?.insights_favs?.includes(
                              item?.id
                            )
                              ? "rgb(247, 176, 71)"
                              : "#fff",
                        }}
                      />
                    </IconButton>
                    <IconButton
                      className="insightNotification-container__insightsContainer__rightIconContainer__iconContainer"
                      onClick={() => {
                        handleDismiss(item);
                      }}
                    >
                      <DeleteIcon className="insightNotification-container__insightsContainer__rightIconContainer__iconContainer__icon" />
                    </IconButton>
                  </span>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="insightNotification-container__insightsContainer__noDataContainer">
            <span className="insightNotification-container__insightsContainer__noDataContainer__commonText">
              Our AI
            </span>
            <span className="insightNotification-container__insightsContainer__noDataContainer__commonText">
              is hard at work
            </span>
            <span>to serve you Insights!</span>
          </div>
        )}
        {/* </div> */}
      </div>
    </div>
  );
};

export default InsightNotification;

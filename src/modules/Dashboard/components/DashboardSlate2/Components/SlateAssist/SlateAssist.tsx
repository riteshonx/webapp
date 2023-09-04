import React, { useContext, useEffect, useRef, useState } from "react";
import img1 from "../../../../../../assets/images/is-1.png";
import w2 from "../../../../../../assets/images/w-1.png";
import "./SlateAssist.scss";
import {
  AutoAwesome as AutoAwesomeIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
} from "@mui/icons-material";
import InfiniteScroll from "react-infinite-scroll-component";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { Button, CircularProgress, Tooltip } from "@material-ui/core";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import TextsmsIcon from "@mui/icons-material/Textsms";
import InfoIcon from "@mui/icons-material/Info";
import EmailIcon from "@mui/icons-material/Email";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import WeatherComponent from "../WeatherComponent/WeatherComponent";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import { IconButton } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import LeftArrowIcon from "@material-ui/icons/KeyboardArrowLeft";
import { Chip } from "@mui/material";
import axios from "axios";
import { setPreference } from "src/modules/root/context/authentication/action";
import InsightSendMail from "../InsightSendMail/InsightSendMail";
import LessonsLearned from "src/modules/insights2/insightsView/pages/LessonsLearn/LessonsLearn";
import Schedule from "src/modules/insights2/insightsView/pages/Schedule/Schedule";
import { FeedDetailCard } from "../../../Feeds/FeedDetailCard";
import LoadingCard from "src/modules/insights2/insightsView/components/LoadingCard/LoadingCard";
import InsightsInfoPopover from "../InsightsInfoPopover/InsightsInfoPopover";
import { client } from "src/services/graphql";
import { IS_PROJECT_INSIGHT } from "src/modules/insights/graphql/queries/schedule";
const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];

const filterOptions = [
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
];

const SlateAssist = () => {
  const history: any = useHistory();
  const [selectedTab, setSelectedTab] = React.useState(1);
  const [readMore, setReadMore] = React.useState(null);
  const [highlightRecom, setHightlightRecom] = React.useState(false);
  const { dispatch, state }: any = useContext(stateContext);
  const [insightsData, setInsightsData]: any = useState([]);
  const [mailModal, setMailModal]: any = useState(null);
  const [showFilter, setShowFilter]: any = useState(false);
  const [filterValues, setFilterValues] = React.useState<string[]>([]);
  const [noDataFilterMsg, setNoDataFilterMsg] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResponseEmpty, setResponseEmpty] = useState<boolean>(false);
  const [openInsightInfo, setOpenInsightInfo] = useState(false);
  const [pageLimitAndOffset, setPageLimitAndOffset] = useState({
    limit: 10,
    offset: 0,
  });
  const [targetBox, setTargetBox] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  } as DOMRect);
  const [sharedInsightId, setSharedInsightId] = useState(null);
  const [isValidInsight, setIsValidInsight] = useState(false);
  const sharedInsightRef: any = useRef(null);

  useEffect(() => {
    const insightId =
      history.location.pathname.split("/")[
      history.location.pathname.split("/")?.length - 1
      ];
    setSharedInsightId(insightId);
  }, [history.location.pathname]);

  useEffect(() => {
    sharedInsightRef?.current &&
      window.scrollTo(0, sharedInsightRef?.current.offsetTop - 200);
  }, [sharedInsightRef?.current]);

  useEffect(() => {
    state?.currentProject?.projectId && getInsightsData();
  }, [state.selectedProjectToken, pageLimitAndOffset]);

  useEffect(() => {
    const insightId =
      history.location.pathname.split("/")[
      history.location.pathname.split("/")?.length - 1
      ];
    state?.currentProject?.projectId &&
      history.location.pathname.split("/")?.length - 1 > 1 &&
      isProjectInsight(insightId);
  }, [history.location.pathname, state.selectedProjectToken]);

  useEffect(() => {
    const insightId =
      history.location.pathname.split("/")[
      history.location.pathname.split("/")?.length - 1
      ];
    if (
      isValidInsight &&
      insightsData?.length &&
      history.location.pathname.split("/")?.length - 1 > 1
    ) {
      const sharedData = insightsData?.find(
        (item: any) => Number(item?.id) === Number(insightId)
      );
      !sharedData?.id && fetchData();
    }
  }, [insightsData, history.location.pathname, isValidInsight]);

  useEffect(() => {
    if (state?.currentProject?.projectId) {
      if (pageLimitAndOffset?.offset !== 0) {
        setPageLimitAndOffset({
          limit: 10,
          offset: 0,
        });
      } else {
        getInsightsData();
      }
    }
  }, [filterValues, state?.selectedPreference, state.phases]);

  const isProjectInsight = async (id: number) => {
    try {
      const response = await client.query({
        query: IS_PROJECT_INSIGHT,
        variables: {
          id: id,
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewMasterPlan",
          token: state?.selectedProjectToken,
        },
      });
      setIsValidInsight(
        response?.data?.projectInsightsDrilldown?.length ? true : false
      );
    } catch (error) {
      console.log("isProjectInsight error", error);
    }
  };

  const getInsightsData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env["REACT_APP_AUTHENTICATION_URL"]}v1/projectInsights`,
        {
          archived: false,
          favorites: false,
          datasources: filterValues,
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
        setResponseEmpty(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = () => {
    setPageLimitAndOffset({
      limit: 10,
      offset: pageLimitAndOffset.offset + 10,
    });
  };

  const handleTabChange = (tab: any) => {
    setReadMore(null);
    setSelectedTab(tab);
  };

  const updateFilter = (item: any) => {
    const temp: any = [...filterValues];
    const index = temp.indexOf(item.value);
    if (index > -1) {
      temp.splice(index, 1); // 2nd parameter means remove one item only
    } else {
      temp.push(item.value);
    }
    if (!temp) return;
    setReadMore(null);
    setFilterValues(temp);
  };

  const loadMore = (id: any, i: any) => {
    if (readMore === i) {
      setSharedInsightId(null);
      setReadMore(null);
      return;
    }
    setSharedInsightId(id);
    setReadMore(i);
  };

  const handleClose = () => {
    // console.log("handleClose");
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
        dispatch(setPreference(payload.preferencesJson));
        setReadMore(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDismiss = ({ id }: any) => {
    const temp = state?.selectedPreference?.insights_archives || [];
    const index = temp.indexOf(id);
    if (index > -1) {
      temp.splice(index, 1); // 2nd parameter means remove one item only
      savePreference(temp, "dismiss");
    } else {
      temp.push(id);
      savePreference(temp, "dismiss");
    }
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

  const handleInsightInfoClick = (e: any, id: any) => {
    const data = insightsData?.map((item: any) => {
      if (item?.id === id) {
        return {
          ...item,
          showInfo: true,
        };
      } else {
        return {
          ...item,
          showInfo: false,
        };
      }
    });
    setInsightsData(data);
    setTargetBox(e.target.getBoundingClientRect());
  };

  const handleInsightInfoClose = (id: any) => {
    const data = insightsData?.map((item: any) => {
      if (item?.id === id) {
        return {
          ...item,
          showInfo: false,
        };
      } else {
        return item;
      }
    });
    setInsightsData(data);
  };

  return (
    <div className="slateAssistContainer">
      <div className="slateAssistContainer__stickyHeader">
        <div className="slateAssistContainer__headerContent">
          <IconButton
            className="slateAssistContainer__headerContent__backBtn"
            onClick={() => history.push("/")}
          >
            <LeftArrowIcon />
          </IconButton>
          <span
            style={{
              color: selectedTab === 1 ? "#fbd784" : "rgba(152,175,197,0.7)",
              textDecoration: selectedTab === 1 ? "underline" : "none",
            }}
            className="slateAssistContainer__headerContent__tab"
            onClick={() => handleTabChange(1)}
          >
            Insights
          </span>
          <span
            style={{
              color: selectedTab === 2 ? "#fbd784" : "rgba(152,175,197,0.7)",
              textDecoration: selectedTab === 2 ? "underline" : "none",
            }}
            className="slateAssistContainer__headerContent__tab"
            onClick={() => handleTabChange(2)}
          >
            Lessons Learned
          </span>
          <span
            style={{
              color: selectedTab === 3 ? "#fbd784" : "rgba(152,175,197,0.7)",
              textDecoration: selectedTab === 3 ? "underline" : "none",
            }}
            className="slateAssistContainer__headerContent__tab"
            onClick={() => handleTabChange(3)}
          >
            Scheduling Standards
          </span>
          {selectedTab === 1 && (
            <div className="slateAssistContainer__headerContent__filter">
              {showFilter ? (
                <AutoAwesomeIcon
                  onClick={() => setShowFilter(!showFilter)}
                  className="slateAssistContainer__headerContent__filter__icon"
                />
              ) : (
                <AutoAwesomeOutlinedIcon
                  onClick={() => setShowFilter(!showFilter)}
                  className="slateAssistContainer__headerContent__filter__icon"
                />
              )}
            </div>
          )}
        </div>
        {showFilter && selectedTab === 1 && (
          <div className="slateAssistContainer__filterOptionsMain">
            <div className="slateAssistContainer__filterOptionsMain__option">
              <Chip
                label={"All"}
                className={`slateAssistContainer__filterOptionsMain__option__chip ${filterValues?.length === 0
                    ? "slateAssistContainer__filterOptionsMain__option__chip__active"
                    : "slateAssistContainer__filterOptionsMain__option__chip__inActive"
                  }`}
                onClick={() => filterValues?.length > 0 && setFilterValues([])}
              />
            </div>
            {filterOptions?.map((option: any, index: any) => (
              <div
                key={index}
                className="slateAssistContainer__filterOptionsMain__option"
              >
                <Chip
                  label={option?.name}
                  className={`slateAssistContainer__filterOptionsMain__option__chip ${filterValues?.includes(option?.value)
                      ? "slateAssistContainer__filterOptionsMain__option__chip__active"
                      : "slateAssistContainer__filterOptionsMain__option__chip__inActive"
                    }`}
                  onClick={() => updateFilter(option)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="slateAssistContainer__contentMain">
        {isLoading ? (
          <div className="slateAssistContainer__contentMain__loader">
            <LoadingCard />
          </div>
        ) : (
          <></>
        )}
        {selectedTab === 1 ? (
          insightsData.length ? (
            <InfiniteScroll
              dataLength={insightsData?.length ? insightsData?.length : 0} //This is important field to render the next data
              next={() => fetchData()}
              hasMore={true}
              loader={""}
            >
              {insightsData.map((item: any, index: any) => (
                <div key={index}>
                  <div
                    ref={
                      Number(sharedInsightId) === Number(item?.id)
                        ? sharedInsightRef
                        : null
                    }
                    key={index}
                    style={{
                      marginTop: index === 0 ? "150px" : "0px",
                      marginBottom:
                        readMore === null || readMore !== index ? "280px" : "0",
                    }}
                    className="slateAssistContainer__contentMain__row text-animation fadeInBottom"
                  >
                    <div className="slateAssistContainer__contentMain__row__col-1">
                      <div className="slateAssistContainer__contentMain__row__col-1__index">
                        {index < 9 ? `0${index + 1}` : index + 1}
                      </div>
                      <div className="slateAssistContainer__contentMain__row__col-1__titleMain">
                        <div className="slateAssistContainer__contentMain__row__col-1__titleMain__line"></div>
                        <h5 className="slateAssistContainer__contentMain__row__col-1__titleMain__title">
                          {item.source.includes("ChangeOrders")
                            ? "BudgetImpact"
                            : "ScheduleImpact"}
                        </h5>
                      </div>
                      <h2
                        className="slateAssistContainer__contentMain__row__col-1__shortMsg"
                        onClick={() => loadMore(item?.id, index)}
                        dangerouslySetInnerHTML={{ __html: item?.shortMsg }}
                      ></h2>
                      <p className="slateAssistContainer__contentMain__row__col-1__source">
                        {Array.from(new Set(item?.source || [])).join(", ")}
                      </p>
                      <div
                        className="slateAssistContainer__contentMain__row__col-1__analyzeLink"
                        onClick={() => loadMore(item?.id, index)}
                      >
                        Analyze <ArrowForwardIcon />
                      </div>
                    </div>
                    <div className="slateAssistContainer__contentMain__row__col-2">
                      <img
                        src={item?.source?.includes("Weather") ? w2 : img1}
                        width="100%"
                        height="100%"
                      />
                    </div>
                  </div>
                  {readMore === index && (
                    <div className="slateAssistContainer__contentMain__expandedView">
                      <div className="slateAssistContainer__contentMain__expandedView__col-1"></div>
                      <div className="slateAssistContainer__contentMain__expandedView__col-2">
                        <div
                          className="slateAssistContainer__contentMain__expandedView__col-2__content"
                          style={{
                            boxShadow: item?.source?.includes("Weather")
                              ? "rgb(145 166 195) 30px 30px 60px 10px inset, rgb(23 29 37) -3px -3px 6px 1px inset"
                              : "none",
                            margin:
                              readMore !== null ? "50px 0px 280px 0" : "0",
                          }}
                        >
                          <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col">
                            <div>
                              <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__feedContainer">
                                <FeedDetailCard insightDetail={item} />
                                {!item.source.includes("ChangeOrders") && (
                                  <Button
                                    className="slateAssistContainer__contentMain__expandedView__col-2__content__col__feedContainer__button"
                                    onClick={(e: any) =>
                                      handleInsightInfoClick(e, item.id)
                                    }
                                  >
                                    Impact Analysis
                                  </Button>
                                )}
                              </div>
                              {item?.source?.includes("Weather") && (
                                <WeatherComponent handleClose={handleClose} />
                              )}
                              {item?.showInfo && (
                                <InsightsInfoPopover
                                  selectedInsight={item}
                                  onClose={() =>
                                    handleInsightInfoClose(item.id)
                                  }
                                />
                              )}
                            </div>
                            <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-1 text-animation fadeIn">
                              <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-1__col">
                                <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-1__col__recom">
                                  <span
                                    className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-1__col__recom__heading"
                                    onMouseEnter={() =>
                                      setHightlightRecom(true)
                                    }
                                    onMouseLeave={() =>
                                      setHightlightRecom(false)
                                    }
                                  >
                                    Recommendation:
                                  </span>{" "}
                                  <span
                                    style={{
                                      color: highlightRecom
                                        ? "#fff"
                                        : "rgba(152,175,197,0.7)",
                                    }}
                                    dangerouslySetInnerHTML={{
                                      __html: item?.recommendation,
                                    }}
                                  ></span>
                                </div>
                              </div>
                            </div>
                            <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2 text-animation fadeIn">
                              <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-1">
                                <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-1__actionMain">
                                  <span className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-1__actionMain__heading">
                                    Actions:
                                  </span>{" "}
                                  <span
                                    className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-1__actionMain__link-2"
                                    onClick={() =>
                                      setMailModal({
                                        msgs: [{ msg: item?.longMsg }],
                                        ...item,
                                      })
                                    }
                                  >
                                    Delegate
                                  </span>{" "}
                                </div>
                              </div>
                              <div className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-2">
                                {/* <Tooltip title={"Text"} placement="top">
                                <TextsmsIcon className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-2__textIcon" />
                              </Tooltip> */}
                                <Tooltip title={"Email"} placement="top">
                                  <EmailIcon
                                    className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-2__emailIcon"
                                    onClick={() =>
                                      setMailModal({
                                        msgs: [{ msg: item?.longMsg }],
                                        ...item,
                                      })
                                    }
                                  />
                                </Tooltip>
                                <Tooltip title={"Dismiss"} placement="top">
                                  <DeleteIcon
                                    className="slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__col-2__deleteIcon"
                                    onClick={() => handleDismiss(item)}
                                  />
                                </Tooltip>
                              </div>
                              <div>
                                <ThumbUpIcon
                                  onClick={() => setLikeDislike(item.id, 1)}
                                  className={
                                    "slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__thumb" +
                                    (item.isLiked ? " active" : "")
                                  }
                                />
                                <ThumbDownIcon
                                  onClick={() => setLikeDislike(item.id, -1)}
                                  className={
                                    "slateAssistContainer__contentMain__expandedView__col-2__content__col__row-2__thumb" +
                                    (item.isDislike ? " active" : "")
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="slateAssistContainer__contentMain__expandedView__col-3"></div>
                    </div>
                  )}
                </div>
              ))}
            </InfiniteScroll>
          ) : (
            <div className="slateAssistContainer__nodata">
              {filterValues.length > 0 && (
                <h1>No insight available for the selected filter</h1>
              )}
              {isResponseEmpty && !filterValues.length && (
                <h1> No insights present for the selected project</h1>
              )}
            </div>
          )
        ) : selectedTab === 2 ? (
          <LessonsLearned />
        ) : selectedTab === 3 ? (
          <Schedule />
        ) : (
          <></>
        )}
      </div>
      {mailModal ? (
        <InsightSendMail
          onClose={() => {
            setMailModal(null);
          }}
          insight={mailModal}
        />
      ) : (
        <></>
      )}
      {/* {noDataFilterMsg ? <h1>There is no filter msg</h1>:""} */}
    </div>
  );
};

export default SlateAssist;

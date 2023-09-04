import axios from "axios";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import {
  setHeaderShown,
  setIsLoading,
  setProjectInfo,
  setSelectedMenu,
  setPreviousRoute,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import MapView from "../MapView/MapView";
import TwitterCard from "../../../../shared/TwitterCard/TwitterCard";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import classNames from "classnames";
import "./ProjectView.scss";
import ImageCarousel from "../../../../shared/ImageCarousel/ImageCarousel";
import LeftArrowIcon from "@material-ui/icons/ArrowLeft";
import RightArrowIcon from "@material-ui/icons/ArrowRight";
import { IconButton } from "@material-ui/core";
import Widget from "../../../../shared/Widget/Widget";
import CommonWidget from "../../../../shared/CommonWidget/CommonWidget";
import ontime from "../../../../../../assets/images/ontrack.svg";
import ahead from "../../../../../../assets/images/ahaead.svg";
import milestoneImg from "../../../../../../assets/images/milestorne1.svg";
import rfiImg from "../../../../../../assets/images/sb1.svg";
import carbonFPImg from "../../../../../../assets/images/carb2.svg";
import constrImg from "../../../../../../assets/images/constr.svg";
import tmrImg from "../../../../../../assets/images/tmr.svg";
import varianceImg from "../../../../../../assets/images/variance.svg";
import TaskAndNewsCard from "../../../../shared/TaskAndNewsCard/TaskAndNewsCard";
import carbonDataImg from "../../../../../../assets/images/projectBehind.svg";
import projectBehind from "../../../../../../assets/images/behind2.svg";
import EmbodiedCarbonWidget from "../../../../shared/EmbodiedCarbonWidget/EmbodiedCarbonWidget";
import { GET_IMAGES_ON_DASHBOARD } from "src/modules/upload/graphql/graphql";
import { client } from "src/services/graphql";
import { postApi } from "src/services/api";
import { FETCH_PROJECT_BY_ID } from "src/graphhql/queries/projects";
import { useHistory } from "react-router-dom";
import NewWidget from "../NewWidget/NewWidget";
import TimeAndStatus from "../TimeAndStatus/TimeAndStatus";
import NonComplianceWidget from "../NonComplianceWidget/NonComplianceWidget";
import Timeline from "../Timeline/TimelineChart";
import { nFormatter } from "src/modules/Dashboard/utils/util";
import Dropdown from "src/modules/Dashboard/shared/Dropdown/Dropdown";
import SpiWidget from "../spiWidget/SpiWidget";
import NoWidgetBg from "../../../../../../assets/images/Productivity.svg";

interface Props {
  menuEl: any;
  handleClick: any;
  handleClose: any;
  currentMenu: any;
  handleFilterChange: any;
  handleListItemClick: any;
  handleFilterApply: any;
  selectedIndex: number;
  savedValue: any;
  currentMenuType: any;
  currentLevel: string;
  handleYearFilterClick: any;
  selectedYearIndex: number;
}

const ProjectView = ({
  menuEl,
  handleClick,
  handleClose,
  currentMenu,
  handleFilterChange,
  handleListItemClick,
  handleFilterApply,
  selectedIndex,
  savedValue,
  currentMenuType,
  currentLevel,
  selectedYearIndex,
  handleYearFilterClick,
}: Props): ReactElement => {
  const { dispatch, state }: any = useContext(stateContext);
  const [projectInfo, setProjectDetails]: any = useState(null);
  const { innerHeight: height } = window;
  const [projectWidgetsInfo, setProjectWidgetsInfo]: any = useState(null);
  const [openCarousel, setOpenCarousel] = useState(false);
  const [openImagePanel, setOpenImagePanel] = useState(false);
  const [tmrWidgetData, setTMRWidgetData]: any = useState(null);
  const [ppcWidgetData, setPPCWidgetData]: any = useState(null);
  const [variancesData, setVariancesData]: any = useState(null);
  const [constraintsData, setConstraintsData]: any = useState(null);
  const [flipBack, setFlipBack]: any = useState(false);
  const [embodiedCarbonWidgetData, setEmbodiedCarbonWidgetData]: any =
    useState(null);
  const [embodiedFootprintWidgetData, setEmbodiedFootprintWidgetData]: any =
    useState(null);
  const [displayWidgetScrollIcons, setDisplayWidgetScrollIcons]: any =
    useState(true);
  const [photoUrls, setPhotoUrls]: any = useState([]);
  const wrapperRef: any = useRef(null);
  const token = getExchangeToken();
  const [projectDataForCurrency, setProjectDataForCurrency]: any = useState();
  const history: any = useHistory();
  const [rfiData, setRfiData]: any = useState(null);
  const [spiData, setSPIData]: any = useState(null);
  const [cpiData, setCPIData]: any = useState(null);
  const [workpackagesData, setWorkpackagesData]: any = useState(null);
  const [milestoneData, setMilestoneData]: any = useState(null);
  const [nonComplianceData, setNonComplianceData]: any = useState(null);
  const [onsiteData, setOnsiteData]: any = useState(null);
  const [healthData, setHealthData]: any = useState(null);
  const [productivityData, setProductivityData]: any = useState(null);
  const [productivityAvgData, setProductivityAvgData]: any = useState(null);
  const [timelineData, setTimelineData]: any = useState([]);
  const [timelineRollup, setTimelineRollup] = useState({
    rollup: "weekly",
    year: new Date().getFullYear(),
  });
  const [nonComplianceBarData, setNonComplianceBarData]: any = useState(null);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (wrapperRef?.current && !wrapperRef?.current?.contains(event.target)) {
        setOpenImagePanel(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (projectWidgetsInfo?.projectId) {
      fetchProjectDetail();
    }
  }, [projectWidgetsInfo]);

  useEffect(() => {
    state.selectedProjectToken && getProjectImages();
  }, [state.selectedProjectToken]);

  const openImageCarousel = () => {
    setOpenCarousel(true);
  };
  useEffect(() => {
    dispatch(setIsLoading(true));
    state.currentProject?.projectId && getProjectsInfo();
  }, [state.currentProject]);

  useEffect(() => {
    setConstraintsData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.constraints &&
      getConstraintsData();
  }, [state.currentProject, state.projectWidgetSettings.constraints]);

  useEffect(() => {
    setVariancesData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.variances &&
      getVariancesData();
  }, [state.currentProject, state.projectWidgetSettings.variances]);

  useEffect(() => {
    setEmbodiedCarbonWidgetData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.carbondata &&
      getEmbodiedCarbonData();
  }, [state.currentProject, state.projectWidgetSettings.carbondata]);

  useEffect(() => {
    setEmbodiedFootprintWidgetData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.carbonfootprint &&
      getEmbodiedCarbonFootPrintData();
  }, [state.currentProject, state.projectWidgetSettings.carbonfootprint]);

  useEffect(() => {
    setProjectWidgetsInfo(null);
    state.currentProject?.projectId &&
      (state.projectWidgetSettings.budget ||
        state.projectWidgetSettings.status) &&
      getProjectWidgetData();
  }, [
    state.currentProject,
    savedValue,
    state.projectWidgetSettings.budget,
    state.projectWidgetSettings.status,
  ]);

  useEffect(() => {
    setTMRWidgetData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.tmr &&
      getTMRData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.tmr]);

  useEffect(() => {
    setPPCWidgetData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.ppc &&
      getPPCData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.ppc]);

  useEffect(() => {
    setNonComplianceData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.noncompliance &&
      getNonComplianceData();
  }, [
    state.currentProject,
    savedValue,
    state.projectWidgetSettings.noncompliance,
  ]);

  useEffect(() => {
    setOnsiteData(null);
    setProductivityAvgData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.onsite &&
      getOnsiteEmployeesData();
    state.currentProject?.projectId &&
      state.projectWidgetSettings.onsite &&
      getProductivityAvgData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.onsite]);

  useEffect(() => {
    setHealthData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.health &&
      getIncidentsData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.health]);

  useEffect(() => {
    setProductivityData(null);
    setCPIData(null);
    setNonComplianceBarData(null)
    state.currentProject?.projectId &&
      state.projectWidgetSettings.productivity &&
      getProductivityData();
    state.currentProject?.projectId &&
      state.projectWidgetSettings.productivity &&
      getCPIData();
  }, [
    state.currentProject,
    savedValue,
    state.projectWidgetSettings.productivity,
  ]);

  useEffect(() => {
    setMilestoneData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.milestone &&
      getMilestoneData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.milestone]);

  useEffect(() => {
    setRfiData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.rfi &&
      getRFICountByStatus();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.rfi]);

  useEffect(() => {
    setWorkpackagesData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.timeandstatus &&
      getWorkpackagesCount();
  }, [
    state.currentProject,
    savedValue,
    state.projectWidgetSettings.timeandstatus,
  ]);

  useEffect(() => {
    setSPIData(null);
    state.currentProject?.projectId &&
      state.projectWidgetSettings.spi &&
      getSPIData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.spi]);

  useEffect(() => {
    state.currentProject?.projectId && getTimelineData();
  }, [timelineRollup, state.currentProject]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const projectWidgets = [
      "tmr",
      "ppc",
      "variances",
      "constraints",
      "carbonfootprint",
      "rfi",
      "milestone",
      "budget",
      "carbondata",
      "status",
      "productivity",
      "noncompliance",
      "onsite",
      "timeandstatus",
      "health",
      "spi",
    ];
    const widgetsLength = 16;
    const unselectedWidgets = Object.keys(state.projectWidgetSettings).filter(
      (widget: any) =>
        projectWidgets.includes(widget) &&
        state.projectWidgetSettings[widget] === false
    )?.length;
    if (widgetsLength === unselectedWidgets) {
      setDisplayWidgetScrollIcons(false);
    } else {
      setDisplayWidgetScrollIcons(true);
    }
  }, [state?.projectWidgetSettings]);

  const getRFICountByStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getRFIsCountByStatus` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRfiData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProductivityData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getProductivityWidget` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData: any =
        response?.data?.["revenue"]?.totalRevenue +
        response?.data?.["spend"]?.totalSpend +
        response?.data?.["nonComplianceAmount"]?.totalNonComplianceAmount +
        response?.data?.["plannedValueAmount"]?.amount
          ? [
              {
                title: "Revenue",
                subTitle:"Earned Value",
                chartData: response?.data?.["revenue"]?.totalRevenue
                  ? [
                      {
                        value: response?.data?.["revenue"]?.totalRevenue,
                        description: response?.data?.["revenue"]?.totalRevenue
                          ? nFormatter(
                              response?.data?.["revenue"]?.totalRevenue,
                              2
                            )
                          : 0,
                        color: "#003566",
                      },
                    ]
                  : [],
                pct: response?.data?.["revenue"]?.revenueTrend
                  ? nFormatter(response?.data?.["revenue"]?.revenueTrend, 2)
                  : 0,
              },
              {
                title: "Spend",
                subTitle:"Actual Cost",
                chartData: response?.data?.["spend"]?.totalSpend
                  ? [
                      {
                        value: response?.data?.["spend"]?.totalSpend,
                        description: response?.data?.["spend"]?.totalSpend
                          ? nFormatter(response?.data?.["spend"]?.totalSpend, 2)
                          : 0,
                        color: "#003566",
                      },
                    ]
                  : [],
                pct: response?.data?.["spend"]?.spendTrend
                  ? nFormatter(response?.data?.["spend"]?.spendTrend, 2)
                  : 0,
              },
              {
                title:"Budget",
                subTitle: "Planned Value",
                chartData: response?.data?.["plannedValueAmount"]?.amount
                  ? [
                      {
                        value: response?.data?.["plannedValueAmount"]?.amount,
                        description: response?.data?.["plannedValueAmount"]
                          ?.amount
                          ? nFormatter(
                              response?.data?.["plannedValueAmount"]?.amount,
                              2
                            )
                          : 0,
                        color: "#003566",
                      },
                    ]
                  : [],

                pct: response?.data?.["plannedValueAmount"]?.amountTrend
                  ? nFormatter(
                      response?.data?.["plannedValueAmount"]?.amountTrend,
                      2
                    )
                  : 0,
              },
            ]
          : [];
      setProductivityData(formattedData);
      const nonComplianceData =               
      {
        title: "NCR",
        chartData: response?.data?.["nonComplianceAmount"]
          ?.totalNonComplianceAmount
          ? [
              {
                value:
                  response?.data?.["nonComplianceAmount"]
                    ?.totalNonComplianceAmount,
                description: response?.data?.["nonComplianceAmount"]
                  ?.totalNonComplianceAmount
                  ? nFormatter(
                      response?.data?.["nonComplianceAmount"]
                        ?.totalNonComplianceAmount,
                      2
                    )
                  : 0,
                color: "#003566",
              },
            ]
          : [],
        pct: response?.data?.["nonComplianceAmount"]
          ?.nonComplianceAmountTrend
          ? nFormatter(
              response?.data?.["nonComplianceAmount"]
                ?.nonComplianceAmountTrend,
              2
            )
          : 0,
      }
    setNonComplianceBarData(nonComplianceData)
    } catch (error) {
      console.log(error);
    }
  };

  const getSPIData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getSpi` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSPIData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCPIData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getCpi` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCPIData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getNonComplianceData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getNonCompliance` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = {
        best: response.data?.best.map((item: any, i: number) => {
          return {
            title: item?.companyName ? item?.companyName : "Company " + i,
            chartData: [
              {
                value: item?.amount ? item?.amount : 0,
                description: item?.amount ? nFormatter(item?.amount, 2) : 0,
                color: "#FFD60A",
              },
            ],
            pct: item?.pctDiffAmount ? nFormatter(item?.pctDiffAmount, 2) : 0,
            total: item?.amount ? nFormatter(item?.amount, 2) : 0,
          };
        }),
        canImprove: response.data?.canImprove.map((item: any, i: number) => {
          return {
            title: item?.companyName ? item?.companyName : "Company " + i,
            chartData: [
              {
                value: item?.amount ? item?.amount : 0,
                description: item?.amount ? nFormatter(item?.amount, 2) : 0,
                color: "#FFD60A",
              },
            ],
            pct: item?.pctDiffAmount ? nFormatter(item?.pctDiffAmount, 2) : 0,
            total: item?.amount ? nFormatter(item?.amount, 2) : 0,
          };
        }),
      };
      setNonComplianceData(formattedData);
    } catch (error) {
      console.log(error);
    }
  };

  const getOnsiteEmployeesData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getOnsiteHrs` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = {
        totalSiteHours: response.data?.totalSiteHours
          ? nFormatter(response.data?.totalSiteHours, 2)
          : 0,
        totalAvgVal: response.data?.avgTrend
          ? nFormatter(response.data?.avgTrend, 2)
          : 0,
        data: response.data?.cube?.map((item: any, i: number) => {
          return {
            title: item?.projectName ? item?.projectName : "Project " + i,
            pct: item?.siteHoursTrend ? nFormatter(item?.siteHoursTrend, 2) : 0,
            siteHours: item?.siteHours ? nFormatter(item?.siteHours, 2) : 0,
            chartData: [
              {
                value: item?.employees ? item.employees : 0,
                description: item?.employees
                  ? nFormatter(item.employees, 2)
                  : 0,
                color: "#171d25",
              },
              {
                value: item?.labor ? item.labor : 0,
                description: item?.labor ? nFormatter(item.labor, 2) : 0,
                color: "#EEC644",
              },
              {
                value: item?.trade ? item?.trade : 0,
                description: item?.trade ? nFormatter(item.trade, 2) : 0,
                color: "#EF7753",
              },
            ].filter((val: any) => val.value > 0),
          };
        }),
      };
      setOnsiteData(formattedData);
    } catch (error) {
      console.log(error);
    }
  };

  const getIncidentsData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getIncidents` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = {
        totalIncidents: response.data?.portfolioIncidents
          ? nFormatter(response.data?.portfolioIncidents, 2)
          : 0,
        avgVal: response.data?.portfolioIncidentsTrend
          ? nFormatter(response.data?.portfolioIncidentsTrend, 2)
          : 0,
        data: response.data?.cube?.map((item: any, i: number) => {
          return {
            title: item?.projectName ? item?.projectName : "Project " + i,
            pct: item?.incidentsTrend ? nFormatter(item?.incidentsTrend, 2) : 0,
            total: item?.totalIncidents
              ? nFormatter(item?.totalIncidents, 2)
              : 0,
            chartData: [
              {
                value: item?.minorIncidents ? item?.minorIncidents : 0,
                description: item?.minorIncidents
                  ? nFormatter(item?.minorIncidents, 2)
                  : 0,
                color: "#105C6B",
              },
              {
                value: item?.lostDaysIncidents ? item?.lostDaysIncidents : 0,
                description: item?.lostDaysIncidents
                  ? nFormatter(item?.lostDaysIncidents, 2)
                  : 0,
                color:"#EEC644",
              },
              {
                value: item?.majorIncidents ? item?.majorIncidents : 0,
                description: item?.majorIncidents
                  ? nFormatter(item?.majorIncidents, 2)
                  : 0,
                color: "#EF7753",
              },
            ].filter((val: any) => val.value > 0),
          };
        }),
      };
      setHealthData(formattedData);
    } catch (error) {
      console.log(error);
    }
  };

  const getWorkpackagesCount = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getWorkPkgsCountByStatus` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWorkpackagesData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getMilestoneData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getMilestonesCountByStatus` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMilestoneData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProductivityAvgData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getProductivityValue` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProductivityAvgData(response?.data?.list[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getTimelineData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getTimeline?portfolioId=${state.currentPortfolio?.portfolioId}` +
          `&projectId=${state.currentProject?.projectId}&rollUp=${timelineRollup.rollup}&calYear=${timelineRollup.year}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTimelineData(response.data?.cube);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTimelineRollUp = (selected: any, e?: any) => {
    if (selected !== "yearly") {
      setTimelineRollup({ ...timelineRollup, rollup: selected });
    } else {
      setTimelineRollup({ ...timelineRollup, year: e.target.value });
    }
  };

  const handleScroll = () => {
    if (window.pageYOffset > 25) {
      dispatch(setHeaderShown(true));
    } else {
      dispatch(setHeaderShown(false));
    }
  };

  const getTMRData = async () => {
    try {
      const tmrData = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getTMR` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTMRWidgetData(
        tmrData.data?.list?.length ? tmrData.data?.list[0]?.tmr : 0
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getPPCData = async () => {
    const ppcData = await axios.get(
      `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getPPC` +
        `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPPCWidgetData(
      ppcData.data?.listOfPPCs?.length ? ppcData.data?.listOfPPCs[0]?.ppc : 0
    );
  };

  const getConstraintsData = async () => {
    try {
      const constraints = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getConstraints` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConstraintsData(
        constraints?.data?.list?.length
          ? constraints?.data?.list[0]?.constraintsCnt
          : 0
      );
    } catch (error) {
      console.log(error);
    }
  };
  const getVariancesData = async () => {
    try {
      const variances = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getVariances` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVariancesData(
        variances?.data?.list?.length
          ? variances?.data?.list[0]?.variancesCnt
          : 0
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getEmbodiedCarbonData = async () => {
    try {
      const embodiedCarbonData = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getEmbodiedCarbonData` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmbodiedCarbonWidgetData(
        embodiedCarbonData.data?.cube?.length
          ? embodiedCarbonData.data?.cube[0]
          : null
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getEmbodiedCarbonFootPrintData = async () => {
    try {
      const embodiedCarbonFootPrintData = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getEmbodiedCarbonFootPrint` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmbodiedFootprintWidgetData(
        embodiedCarbonFootPrintData.data?.cube?.length
          ? embodiedCarbonFootPrintData.data?.cube[0]
          : null
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectWidgetData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getWidgetsInfo` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&projectId=${state.currentProject?.projectId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        setProjectWidgetsInfo(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectsInfo = async () => {
    try {
      dispatch(setProjectInfo(null));
      setProjectDetails(null);
      dispatch(setIsLoading(true));
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getProjectInfo` +
          `?projectId=${state.currentProject.projectId}&portfolioId=${state.currentPortfolio.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        setProjectDetails(response.data);
        dispatch(setProjectInfo(response.data));
        dispatch(setIsLoading(false));
      }
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const getProjectImages = async () => {
    try {
      dispatch(setIsLoading(true));
      const documentsResponse = await client.query({
        query: GET_IMAGES_ON_DASHBOARD,
        fetchPolicy: "network-only",
        context: {
          role: "viewMyProjects",
          token: getExchangeToken(),
        },
        variables: {
          projectId: [state.currentProject?.projectId],
        },
      });
      formatDocumentData(documentsResponse);
    } catch (error) {
      dispatch(setIsLoading(false));

      console.log(error);
    }
  };

  const formatDocumentData = async (documentsResponse: any) => {
    const payload: any = [];

    documentsResponse?.data?.documents?.forEach((item: any) => {
      payload.push({
        fileName: `${item?.name}.${item?.mimeType?.split("/")[1]}`,
        key: item?.fileKey,
        expiresIn: 1000,
      });
    });

    try {
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      const temp: any = [];
      documentsResponse?.data?.documents?.forEach((item: any) => {
        const data = fileUploadResponse?.success.find(
          (res: any) => res.key === item?.fileKey
        );

        if (data) {
          temp.push(data.url);
        }
      });
      setPhotoUrls(temp);
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const fetchProjectDetail = async () => {
    try {
      const role = "viewMyProjects";

      const projectsResponse = await client.query({
        query: FETCH_PROJECT_BY_ID,
        variables: {
          id: Number(projectWidgetsInfo?.projectId),
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: "network-only",
        context: { role },
      });

      if (projectsResponse.data.project.length > 0) {
        projectsResponse.data.project?.forEach((project: any) => {
          let address = "";
          let countryCode = "";
          if (project?.addresses.length > 0) {
            address = `${project?.addresses[0]?.fullAddress}`;
            countryCode = project.addresses[0]?.countryShortCode;
          }

          const newItem = {
            name: project.name,
            status: project.status,
            id: project.id,
            address,
            type: project.config.type,
            stage: project.config.stage,
            projectCode: project.config.projectCode,
            currency:
              project.metrics.currency == "" ? "GBP" : project.metrics.currency,
            countryCode: countryCode,
          };
          setProjectDataForCurrency(newItem);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRFIWidgetClick = (status?: string) => {
    dispatch(setPreviousRoute(history.location.pathname));
    if (status) {
      state.currentProject?.projectId &&
        history.push(
          `/base/projects/${Number(
            state.currentProject?.projectId
          )}/form/${"2"}?status=${status}`
        );
    } else {
      state.currentProject?.projectId &&
        history.push(
          `/base/projects/${Number(
            state.currentProject?.projectId
          )}/form/${"2"}`
        );
    }
    dispatch(setSelectedMenu("Forms"));
    sessionStorage.setItem("selectedMenu", "Forms");
  };

  const handleMilestonesWidgetClick = () => {
    dispatch(setPreviousRoute(history.location.pathname));
    state.currentProject?.projectId &&
      history.push(
        `scheduling/project-plan/${Number(state.currentProject?.projectId)}`
      );

    dispatch(setSelectedMenu("Schedule"));
    sessionStorage.setItem("selectedMenu", "Schedule");
  };

  return !state.isLoading && projectInfo?.team?.length > 0 ? (
    <div className="projectView1-main">
      <div className="projectView1-main__container">
        <div className="projectView1-main__container__left">
          <div className="projectView1-main__container__left__nameAndFilterContainer">
            <div className="projectView1-main__container__left__nameAndFilterContainer__portfolioTitle">
              {state.currentProject?.projectName}
            </div>
            <div>
              <Dropdown
                menuEl={menuEl}
                handleClick={handleClick}
                handleClose={handleClose}
                currentMenu={currentMenu}
                handleFilterChange={handleFilterChange}
                handleListItemClick={handleListItemClick}
                handleFilterApply={handleFilterApply}
                selectedIndex={selectedIndex}
                savedValue={savedValue}
                currentMenuType={currentMenuType}
                currentLevel={currentLevel}
                handleYearFilterClick={handleYearFilterClick}
                selectedYearIndex={selectedYearIndex}
              />
            </div>
          </div>
          <div className="projectView1-main__container__left__widgetsContainer projectView1-main__container__left__widgetsContainer__wrapper">
            <div
              className={
                displayWidgetScrollIcons
                  ? "projectView1-main__container__left__widgetsContainer projectView1-main__container__left__widgetsContainer__content"
                  : "projectView1-main__container__left__widgetsContainer projectView1-main__container__left__widgetsContainer__noContent"
              }
              style={{
                maxHeight: height * 0.605,
              }}
            >
              {displayWidgetScrollIcons ? (
                <>
                  {state?.projectWidgetSettings?.productivity && (
                    <NewWidget
                      title="Productivity"
                      averageTitle={"Cost Performance Index"}
                      averageCost={
                        cpiData?.avgCpi ? nFormatter(cpiData?.avgCpi, 2) : 0
                      }
                      avgVal={
                        cpiData?.avgCpiTrend
                          ? nFormatter(cpiData?.avgCpiTrend, 2)
                          : 0
                      }
                      data={productivityData}
                      legend={[
                        { name: "Employees", color: "#171d25" },
                        { name: "Labor", color: "#EEC644" },
                        { name: "Trades", color: "#EF7753" },
                      ]}
                    />
                  )}
                  {state?.projectWidgetSettings?.noncompliance && (
                    <NonComplianceWidget
                      title="Non-Compliance"
                      data={nonComplianceData}
                      headerText = "Non-Compliance Reports (NCR)"
                      nonComplianceData={nonComplianceBarData}
                      category = {"Companies"}
                    />
                  )}
                  {state?.projectWidgetSettings?.timeandstatus && (
                    <TimeAndStatus
                      title="Time & Status"
                      workpackagesData={workpackagesData}
                    />
                  )}
                  {state?.projectWidgetSettings?.onsite && (
                    <NewWidget
                      title="Who: On-Site"
                      averageTitle={"Site Hours(All)"}
                      avgVal={
                        onsiteData?.totalAvgVal ? onsiteData?.totalAvgVal : 0
                      }
                      averageCost={
                        onsiteData?.totalSiteHours
                          ? onsiteData?.totalSiteHours
                          : 0
                      }
                      prodAvg={
                        productivityAvgData?.avgProductivity
                          ? nFormatter(productivityAvgData?.avgProductivity, 2)
                          : 0
                      }
                      prodAvgPerc={
                        productivityAvgData?.productivityTrend
                          ? nFormatter(
                              productivityAvgData?.productivityTrend,
                              2
                            )
                          : 0
                      }
                      data={onsiteData?.data}
                      legend={[
                        { name: "Employees", color: "#105C6B" },
                        { name: "Labor", color: "#EEC644" },
                        { name: "Trades", color: "#EF7753" },
                      ]}
                    />
                  )}
                  {state?.projectWidgetSettings?.health && (
                    <NewWidget
                      title="Health"
                      averageTitle="Incidents"
                      averageCost={
                        healthData?.totalIncidents
                          ? healthData?.totalIncidents
                          : 0
                      }
                      avgVal={healthData?.avgVal ? healthData?.avgVal : 0}
                      data={healthData?.data}
                      legend={[
                        { name: "Minor", color: "#171d25" },
                        { name: "Lost Time 1-7 days", color:"#EEC644" },
                        { name: "Major", color: "#EF7753" },
                      ]}
                    />
                  )}

                  {state?.projectWidgetSettings?.spi && (
                    <SpiWidget
                      title="Schedule Performance Index"
                      averageTitle={"SPI"}
                      spiData={spiData}
                    />
                  )}
                  {state?.projectWidgetSettings?.budget && (
                    <div>
                      <Widget
                        currency={projectDataForCurrency?.currency}
                        budget={
                          projectWidgetsInfo?.budget
                            ? projectWidgetsInfo?.budget
                            : 0
                        }
                        spend={
                          projectWidgetsInfo?.spend
                            ? projectWidgetsInfo?.spend
                            : 0
                        }
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.tmr && (
                    <div>
                      <CommonWidget
                        head={"TMR"}
                        value={tmrWidgetData}
                        img={tmrImg}
                        bgClass={"tmrBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.ppc && (
                    <div>
                      <CommonWidget
                        head={"PPC"}
                        value={ppcWidgetData}
                        img={tmrImg}
                        bgClass={"ppcBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.milestone && (
                    <div>
                      <CommonWidget
                        head={"Milestones"}
                        statusCount={milestoneData}
                        img={milestoneImg}
                        bgClass={"milestoneBg"}
                        dimensionsClass={"dimensions1"}
                        handleClick={handleMilestonesWidgetClick}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.variances && (
                    <div>
                      <CommonWidget
                        head={"Variances"}
                        value={variancesData}
                        img={varianceImg}
                        bgClass={"variancesBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.constraints && (
                    <div>
                      <CommonWidget
                        head={"Constraints"}
                        value={constraintsData}
                        img={constrImg}
                        bgClass={"constraintsBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.rfi && (
                    <div>
                      <CommonWidget
                        head={"RFI's"}
                        statusCount={rfiData}
                        img={rfiImg}
                        bgClass={"rfiBg"}
                        handleClick={handleRFIWidgetClick}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {projectWidgetsInfo?.completionStatus === "ontime" &&
                  state?.projectWidgetSettings?.status ? (
                    <div>
                      <CommonWidget
                        head={"Project Status"}
                        value={"On Time"}
                        img={ontime}
                        bgClass={"ontimeBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  ) : projectWidgetsInfo?.completionStatus === "ahead" &&
                    state?.projectWidgetSettings?.status ? (
                    <div>
                      <CommonWidget
                        head={"Project Status"}
                        value={"Ahead"}
                        img={ahead}
                        bgClass={"aheadBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  ) : (
                    state?.projectWidgetSettings?.status && (
                      <div>
                        <CommonWidget
                          head={"Project Status"}
                          value={"Behind"}
                          img={projectBehind}
                          bgClass={"behindBg"}
                          dimensionsClass={"dimensions1"}
                        />
                      </div>
                    )
                  )}
                  {state?.projectWidgetSettings?.carbondata && (
                    <div>
                      <EmbodiedCarbonWidget
                        head={"Carbon Data"}
                        subHead1={"Materials with Carbon"}
                        subHead2={"Without Carbon"}
                        value1={
                          embodiedCarbonWidgetData?.materialsWithCarbon
                            ? embodiedCarbonWidgetData?.materialsWithCarbon
                            : 0
                        }
                        value2={
                          embodiedCarbonWidgetData?.materialsWithoutCarbon
                            ? embodiedCarbonWidgetData?.materialsWithoutCarbon
                            : 0
                        }
                        img={carbonDataImg}
                        bgClass={"carbonDataBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.carbonfootprint && (
                    <div>
                      <EmbodiedCarbonWidget
                        head={"Carbon Footprint"}
                        subHead1={"EC Baseline"}
                        subHead2={"EC Design"}
                        value1={
                          embodiedFootprintWidgetData?.baselineEC
                            ? embodiedFootprintWidgetData?.baselineEC
                            : 0
                        }
                        value2={
                          embodiedFootprintWidgetData?.designEC
                            ? embodiedFootprintWidgetData?.designEC
                            : 0
                        }
                        img={carbonFPImg}
                        bgClass={"carbonFootprintBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="projectView1-main__container__left__widgetsContainer__noContent__container">
                  <img
                    src={NoWidgetBg}
                    className="projectView1-main__container__left__widgetsContainer__noContent__container__img"
                  />
                  <span className="projectView1-main__container__left__widgetsContainer__noContent__container__text">
                    For more insights, please select additional widgets.
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="projectView1-main__container__left__timeline">
            <Timeline
              chartData={timelineData}
              handleTimelineRollUp={handleTimelineRollUp}
            />
          </div>
        </div>
        <div className="projectView1-main__container__right">
          <div className="projectView1-main__container__right__mapContainer">
            <MapView info={projectInfo} levelType={state.currentLevel} />
          </div>
          <div className="projectView1-main__container__right__taskAndTweetsContainer">
            <div
              className={classNames({
                "projectView1-main__container__right__taskAndTweetsContainer__flip-card-inner":
                  true,
                "projectView1-main__container__right__taskAndTweetsContainer__flip-card-on-hover":
                  flipBack,
              })}
            >
              <div className="projectView1-main__container__right__taskAndTweetsContainer__flip-card-front">
                <div style={{ height: height * 0.54 }}>
                  <TwitterCard
                    setFlipBack={setFlipBack}
                    flipBack={flipBack}
                    height={0.54}
                    className={"twitter-feeds1"}
                  />
                </div>
              </div>
              <div className="projectView1-main__container__right__taskAndTweetsContainer__flip-card-back">
                <div>
                  <TaskAndNewsCard
                    setFlipBack={setFlipBack}
                    flipBack={flipBack}
                    height={0.54}
                    className={"taskAndNewsCard1"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!openImagePanel && photoUrls?.length ? (
        <IconButton
          className="projectView1-main__carouselIconButton"
          onClick={() => setOpenImagePanel(true)}
        >
          <LeftArrowIcon className="projectView1-main__carouselIconButton__icon" />
        </IconButton>
      ) : (
        ""
      )}

      <div
        className={
          openImagePanel
            ? "projectView1-main__carouselContainer projectView1-main__carouselContainer__show"
            : "projectView1-main__carouselContainer projectView1-main__carouselContainer__hide"
        }
        ref={wrapperRef}
      >
        <IconButton
          className={
            openImagePanel
              ? "projectView1-main__carouselContainer__iconButton projectView1-main__carouselContainer__iconButton__show"
              : "projectView1-main__carouselContainer__iconButton projectView1-main__carouselContainer__iconButton__hide"
          }
          onClick={() => setOpenImagePanel(false)}
        >
          <RightArrowIcon
            className={"projectView1-main__carouselList__iconButton__icon"}
          />
        </IconButton>
        <div
          className={
            photoUrls?.length > 5
              ? "projectView1-main__carouselContainer__listImages"
              : "projectView1-main__carouselContainer__listImages projectView1-main__carouselContainer__listImages__center"
          }
        >
          {photoUrls?.length &&
            photoUrls.map((url: any, i: number) => (
              <img
                src={url}
                className={
                  openImagePanel
                    ? "projectView1-main__carouselContainer__listImages__imageStyle" +
                      " projectView1-main__carouselContainer__listImages__imageStyle__show"
                    : "projectView1-main__carouselContainer__listImages__imageStyle" +
                      " projectView1-main__carouselContainer__listImages__imageStyle__hide"
                }
                key={i}
                onClick={() => {
                  setOpenImagePanel(false);
                  openImageCarousel();
                }}
              ></img>
            ))}
        </div>
      </div>
      {photoUrls?.length ? (
        <ImageCarousel
          open={openCarousel}
          close={() => setOpenCarousel(false)}
          pictures={photoUrls}
        />
      ) : (
        ""
      )}
    </div>
  ) : (
    <div className={"projectView1-main__noContent"}></div>
  );
};

export default ProjectView;

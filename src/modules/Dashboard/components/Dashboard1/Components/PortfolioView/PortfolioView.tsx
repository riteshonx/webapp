import axios from "axios";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import {
  setHeaderShown,
  setIsLoading,
  setPortfolioInfo,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import MapView from "../MapView/MapView";
import TwitterCard from "../../../../shared/TwitterCard/TwitterCard";
import { getExchangeToken } from "src/services/authservice";
import Dropdown from "../../../../shared/Dropdown/Dropdown";
import "./PortfolioView.scss";
import ImageCarousel from "../../../../shared/ImageCarousel/ImageCarousel";
import LeftArrowIcon from "@material-ui/icons/ArrowLeft";
import RightArrowIcon from "@material-ui/icons/ArrowRight";
import { IconButton } from "@material-ui/core";
import Widget from "../../../../shared/Widget/Widget";
import CommonWidget from "../../../../shared/CommonWidget/CommonWidget";
import CarbonWidget from "../../../../shared/CarbonWidget/CarbonWidget";
import ontime from "../../../../../../assets/images/ontrack.svg";
import ahead from "../../../../../../assets/images/ahaead.svg";
import projectBehind from "../../../../../../assets/images/behind2.svg";
import milestoneImg from "../../../../../../assets/images/milestorne1.svg";
import rfiImg from "../../../../../../assets/images/sb1.svg";
import projectBg2 from "../../../../../../assets/images/projectBg2.png";
import constrImg from "../../../../../../assets/images/constr.svg";
import tmrImg from "../../../../../../assets/images/tmr.svg";
import varianceImg from "../../../../../../assets/images/variance.svg";
import carbonFPImg from "../../../../../../assets/images/carb2.svg";
import TaskAndNewsCard from "../../../../shared/TaskAndNewsCard/TaskAndNewsCard";
import TMRAndPPCPortfolioWidget from "../../../../shared/TMRAndPPCPortfolioWidget/TMRAndPPCPortfolioWidget";
import EmbodiedCarbonWidget from "../../../../shared/EmbodiedCarbonWidget/EmbodiedCarbonWidget";
import classNames from "classnames";
import NewWidget from "../NewWidget/NewWidget";
import TimeAndStatus from "../TimeAndStatus/TimeAndStatus";
import NonComplianceWidget from "../NonComplianceWidget/NonComplianceWidget";
import Timeline from "../Timeline/TimelineChart";
import { nFormatter } from "src/modules/Dashboard/utils/util";
import SpiWidget from "../spiWidget/SpiWidget";
import NoWidgetBg from "../../../../../../assets/images/Productivity.svg";

interface Props {
  menuEl: any;
  handleClick: any;
  handleClose: any;
  currentMenu: any;
  handleFilterChange: any;
  handleYearFilterClick: any;
  handleListItemClick: any;
  handleFilterApply: any;
  selectedIndex: number;
  selectedYearIndex: number;
  savedValue: any;
  currentMenuType: any;
  currentLevel: string;
}

const PortfolioView = ({
  menuEl,
  handleClick,
  handleClose,
  currentMenu,
  handleFilterChange,
  handleYearFilterClick,
  handleListItemClick,
  handleFilterApply,
  selectedIndex,
  selectedYearIndex,
  savedValue,
  currentMenuType,
  currentLevel,
}: Props): ReactElement => {
  const { dispatch, state }: any = useContext(stateContext);
  const [portfolioWidgetInfo, setPortfolioWidgetInfo]: any = useState(null);
  const [portfolioInfo, setPortfolioDetails]: any = useState(null);
  const { innerHeight: height } = window;
  const [openCarousel, setOpenCarousel] = useState(false);
  const [openImagePanel, setOpenImagePanel] = useState(false);
  const [tmrData, setTMRData]: any = useState(null);
  const [ppcData, setPPCData]: any = useState(null);
  const [variancesData, setVariancesData]: any = useState(0);
  const [constraintsData, setConstraintsData]: any = useState(0);
  const [flipBack, setFlipBack]: any = useState(false);
  const [embodiedFootprintWidgetData, setEmbodiedFootprintWidgetData]: any =
    useState(null);
  const [bestAndWorstByECWidgetData, setbestAndWorstByECWidgetData]: any =
    useState(null);
  const [displayWidgetScrollIcons, setDisplayWidgetScrollIcons]: any =
    useState(true);
  const wrapperRef: any = useRef(null);
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);
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

  const openImageCarousel = () => {
    setOpenCarousel(true);
  };

  const token = getExchangeToken();

  useEffect(() => {
    dispatch(setIsLoading(true));
    state.currentPortfolio?.portfolioId && getPortfolioInfo();
  }, [state.currentPortfolio]);

  useEffect(() => {
    setConstraintsData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.constraints &&
      getConstraintsData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.constraints]);

  useEffect(() => {
    setVariancesData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.variances &&
      getVariancesData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.variances]);

  useEffect(() => {
    setEmbodiedFootprintWidgetData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.carbonfootprint &&
      getEmbodiedCarbonFootPrintData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.carbonfootprint]);

  useEffect(() => {
    setbestAndWorstByECWidgetData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.carbon &&
      getbestAndWorstByECData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.carbon]);

  useEffect(() => {
    setPortfolioWidgetInfo(null);
    state.currentPortfolio?.portfolioId &&
      (state?.projectWidgetSettings?.budget ||
        state?.projectWidgetSettings?.ontime ||
        state?.projectWidgetSettings?.ahead ||
        state?.projectWidgetSettings?.behind) &&
      getPortfolioWidgetData();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.budget,
    state?.projectWidgetSettings?.ontime,
    state?.projectWidgetSettings?.ahead,
    state?.projectWidgetSettings?.behind,
  ]);

  useEffect(() => {
    setTMRData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.tmr &&
      getTMRData();
  }, [state.currentPortfolio, savedValue, state?.projectWidgetSettings?.tmr]);

  useEffect(() => {
    setPPCData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.ppc &&
      getPPCData();
  }, [state.currentPortfolio, savedValue, state?.projectWidgetSettings?.ppc]);

  useEffect(() => {
    setNonComplianceData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.noncompliance &&
      getNonComplianceData();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.noncompliance,
  ]);

  useEffect(() => {
    setOnsiteData(null);
    setProductivityAvgData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.onsite &&
      getOnsiteEmployeesData();
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.onsite &&
      getProductivityAvgData();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.onsite,
  ]);

  useEffect(() => {
    setHealthData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.health &&
      getIncidentsData();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.health,
  ]);

  useEffect(() => {
    setProductivityData(null);
    setCPIData(null);
    setNonComplianceBarData(null)
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.productivity &&
      getProductivityData();
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.productivity &&
      getCPIData();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.productivity,
  ]);

  useEffect(() => {
    setMilestoneData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.milestone &&
      getMilestoneData();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.milestone,
  ]);

  useEffect(() => {
    setWorkpackagesData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.timeandstatus &&
      getWorkpackagesCount();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.timeandstatus,
  ]);

  useEffect(() => {
    setRfiData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.rfi &&
      getRFICountByStatus();
  }, [state.currentPortfolio, savedValue, state?.projectWidgetSettings?.rfi]);

  useEffect(() => {
    setSPIData(null);
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.spi &&
      getSPIData();
  }, [state.currentPortfolio, savedValue, state?.projectWidgetSettings?.spi]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId && getTimelineData();
  }, [timelineRollup, state.currentPortfolio]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const portfolioWidgets = [
      "tmr",
      "ppc",
      "variances",
      "constraints",
      "carbonfootprint",
      "rfi",
      "milestone",
      "budget",
      "carbon",
      "ontime",
      "behind",
      "ahead",
      "productivity",
      "noncompliance",
      "onsite",
      "timeandstatus",
      "health",
      "spi",
    ];
    const widgetsLength = 18;
    const unselectedWidgets = Object.keys(state.projectWidgetSettings).filter(
      (widget: any) => {
        return (
          portfolioWidgets.includes(widget) &&
          state.projectWidgetSettings[widget] === false
        );
      }
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
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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

  const getSPIData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getSpi` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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

  const getWorkpackagesCount = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getWorkPkgsCountByStatus` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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

  const getNonComplianceData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getNonCompliance` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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
            title: item?.projectName ? item?.projectName : "Project " + i,
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
            title: item?.projectName ? item?.projectName : "Project " + i,
            chartData: [
              {
                value: item?.amount ? item?.amount : item?.amount,
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
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = {
        totalSiteHours: response.data?.totalSiteHours
          ? response.data?.totalSiteHours
          : null,
        totalAvgVal: response.data?.avgTrend
          ? nFormatter(response.data?.avgTrend, 2)
          : 0,
        data: response.data?.cube?.map((item: any, i: number) => {
          return {
            title: item?.projectName ? item?.projectName : "Project " + i,
            pct: item?.siteHoursTrend ? nFormatter(item?.siteHoursTrend, 2) : 0,
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

  const getProductivityData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getProductivityWidget` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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

  const getMilestoneData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getMilestonesCountByStatus` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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

  const getIncidentsData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getIncidents` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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
                color: "#EEC644",
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

  const getProductivityAvgData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getProductivityValue` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
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

  const handleScroll = () => {
    if (window.pageYOffset > 25) {
      dispatch(setHeaderShown(true));
    } else {
      dispatch(setHeaderShown(false));
    }
  };

  const getTMRData = async () => {
    try {
      const tmr = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getTMR` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTMRData(tmr.data?.list);
    } catch (error) {
      console.log(error);
    }
  };

  const getPPCData = async () => {
    try {
      const ppc = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getPPC` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPPCData(ppc.data?.listOfPPCs);
    } catch (error) {
      console.log(error);
    }
  };

  const getConstraintsData = async () => {
    try {
      const constraints = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getConstraints` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      constraints?.data?.list?.length &&
        setConstraintsData(constraints?.data?.list[0]?.constraintsCnt);
    } catch (error) {
      console.log(error);
    }
  };
  const getVariancesData = async () => {
    try {
      const variances = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getVariances` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      variances?.data?.list?.length &&
        setVariancesData(variances?.data?.list[0]?.variancesCnt);
    } catch (error) {
      console.log(error);
    }
  };

  const getEmbodiedCarbonFootPrintData = async () => {
    try {
      const embodiedCarbonFootPrintData = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getEmbodiedCarbonFootPrint` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}`,
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

  const getbestAndWorstByECData = async () => {
    setIsWidgetLoading(true);
    try {
      const bestandWorstProjectsByEC = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getBestandWorstProjectsByEC` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setbestAndWorstByECWidgetData({
        top: bestandWorstProjectsByEC?.data?.top,
        bottom: bestandWorstProjectsByEC?.data?.bottom,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsWidgetLoading(false);
  }, [bestAndWorstByECWidgetData]);

  const getPortfolioWidgetData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getWidgetsInfo` +
          `?portfolioId=${state.currentPortfolio.portfolioId}&dateFilterKey=${savedValue.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        setPortfolioWidgetInfo(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTimelineData = async () => {
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v1/getTimeline` +
          `?portfolioId=${state.currentPortfolio?.portfolioId}&rollUp=${timelineRollup.rollup}&calYear=${timelineRollup.year}`,
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

  const getPortfolioInfo = async () => {
    try {
      dispatch(setIsLoading(true));
      dispatch(setPortfolioInfo(null));
      setPortfolioDetails(null);
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getPortfolioInfo` +
          `?portfolioId=${state.currentPortfolio.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        setPortfolioDetails(response.data);
        dispatch(setPortfolioInfo(response.data));
        dispatch(setIsLoading(false));
      }
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  return !state.isLoading && portfolioInfo?.projectInfos?.length > 0 ? (
    <div className="portfolioView1-main">
      <div className="portfolioView1-main__container">
        <div className="portfolioView1-main__container__left">
          <div className="portfolioView1-main__container__left__nameAndFilterContainer">
            <div className="portfolioView1-main__container__left__nameAndFilterContainer__portfolioTitle">
              {state.currentPortfolio?.portfolioName}
            </div>
            <div>
              <Dropdown
                menuEl={menuEl}
                handleClick={handleClick}
                handleClose={handleClose}
                currentMenu={currentMenu}
                handleFilterChange={handleFilterChange}
                handleYearFilterClick={handleYearFilterClick}
                handleListItemClick={handleListItemClick}
                handleFilterApply={handleFilterApply}
                selectedIndex={selectedIndex}
                selectedYearIndex={selectedYearIndex}
                savedValue={savedValue}
                currentMenuType={currentMenuType}
                currentLevel={currentLevel}
              />
            </div>
          </div>

          <div className="portfolioView1-main__container__left__widgetsContainer portfolioView1-main__container__left__widgetsContainer__wrapper">
            <div
              className={
                displayWidgetScrollIcons
                  ? "portfolioView1-main__container__left__widgetsContainer portfolioView1-main__container__left__widgetsContainer__content"
                  : "portfolioView1-main__container__left__widgetsContainer portfolioView1-main__container__left__widgetsContainer__noContent"
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
                      totalProjects={state.projectList?.length}
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
                      totalProjects={state.projectList?.length}
                      data={nonComplianceData}
                      headerText = "Non-Compliance Reports (NCR)"
                      nonComplianceData={nonComplianceBarData}
                      category = {"Projects"}
                    />
                  )}
                  {state?.projectWidgetSettings?.timeandstatus && (
                    <TimeAndStatus
                      title="Time & Status"
                      totalProjects={state.projectList?.length}
                      workpackagesData={workpackagesData}
                    />
                  )}
                  {state?.projectWidgetSettings?.onsite && (
                    <NewWidget
                      title="Who: On-Site"
                      totalProjects={state.projectList?.length}
                      averageTitle={"Site Hours(All)"}
                      avgVal={
                        onsiteData?.totalAvgVal ? onsiteData?.totalAvgVal : 0
                      }
                      averageCost={
                        onsiteData?.totalSiteHours
                          ? nFormatter(onsiteData?.totalSiteHours, 2)
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
                      totalProjects={state.projectList?.length}
                      averageTitle="Incidents"
                      averageCost={healthData?.totalIncidents}
                      avgVal={
                        healthData?.avgVal
                          ? nFormatter(healthData?.avgVal, 2)
                          : 0
                      }
                      data={healthData?.data}
                      legend={[
                        { name: "Minor", color: "#171d25" },
                        { name: "Lost Time 1-7 days", color: "#EEC644" },
                        { name: "Major", color: "#EF7753" },
                      ]}
                    />
                  )}
                  {state?.projectWidgetSettings?.spi && (
                    <SpiWidget
                      title="Schedule Performance Index"
                      averageTitle={"SPI Average"}
                      spiData={spiData}
                      totalProjects={state.projectList?.length}
                      currentLevel={state?.currentLevel}
                    />
                  )}
                  {state?.projectWidgetSettings?.budget && (
                    <div>
                      <Widget
                        currency={"GBP"}
                        budget={
                          portfolioWidgetInfo?.budget
                            ? portfolioWidgetInfo?.budget
                            : 0
                        }
                        spend={
                          portfolioWidgetInfo?.spend
                            ? portfolioWidgetInfo?.spend
                            : 0
                        }
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.tmr && (
                    <div>
                      <TMRAndPPCPortfolioWidget
                        head={"TMR"}
                        value={tmrData}
                        img={tmrImg}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.ppc && (
                    <div>
                      <TMRAndPPCPortfolioWidget
                        head={"PPC"}
                        value={ppcData}
                        img={tmrImg}
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
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.ahead && (
                    <div>
                      <CommonWidget
                        head={"Projects Ahead"}
                        value={
                          portfolioWidgetInfo?.numOfProjectsAhead
                            ? portfolioWidgetInfo?.numOfProjectsAhead
                            : 0
                        }
                        img={ahead}
                        bgClass={"aheadBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.ontime && (
                    <div>
                      <CommonWidget
                        head={"Projects Ontime"}
                        value={
                          portfolioWidgetInfo?.numOfProjectsOnTime
                            ? portfolioWidgetInfo?.numOfProjectsOnTime
                            : 0
                        }
                        img={ontime}
                        bgClass={"ontimeBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.behind && (
                    <div>
                      <CommonWidget
                        head={"Projects Behind"}
                        value={
                          portfolioWidgetInfo?.numOfProjectsBehind
                            ? portfolioWidgetInfo?.numOfProjectsBehind
                            : 0
                        }
                        img={projectBehind}
                        bgClass={"behindBg"}
                        dimensionsClass={"dimensions1"}
                      />
                    </div>
                  )}
                  {state?.projectWidgetSettings?.carbon && (
                    <div>
                      <CarbonWidget
                        head={"Carbon"}
                        subHead1={"EC Baseline"}
                        subHead2={"EC Design"}
                        data={bestAndWorstByECWidgetData}
                        isWidgetLoading={isWidgetLoading}
                        dimensionsClass={"dimensions1"}
                        stackBarDim={{
                          width: 290,
                          height: 180,
                        }}
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
                <div className="portfolioView1-main__container__left__widgetsContainer__noContent__container">
                  <img
                    src={NoWidgetBg}
                    className="portfolioView1-main__container__left__widgetsContainer__noContent__container__img"
                  />
                  <span className="portfolioView1-main__container__left__widgetsContainer__noContent__container__text">
                    For more insights, please select additional widgets.
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="portfolioView1-main__container__left__timeline">
            <Timeline
              chartData={timelineData}
              handleTimelineRollUp={handleTimelineRollUp}
            />
          </div>
        </div>
        <div className="portfolioView1-main__container__right">
          <div className="portfolioView1-main__container__right__mapContainer">
            <MapView info={portfolioInfo} levelType={state.currentLevel} />
          </div>
          <div className="portfolioView1-main__container__right__taskAndTweetsContainer">
            <div
              className={classNames({
                "portfolioView1-main__container__right__taskAndTweetsContainer__flip-card-inner":
                  true,
                "portfolioView1-main__container__right__taskAndTweetsContainer__flip-card-on-hover":
                  flipBack,
              })}
            >
              <div className="portfolioView1-main__container__right__taskAndTweetsContainer__flip-card-front">
                <div style={{ height: height * 0.54 }}>
                  <TwitterCard
                    setFlipBack={setFlipBack}
                    flipBack={flipBack}
                    height={0.54}
                    className={"twitter-feeds1"}
                  />
                </div>
              </div>
              <div className="portfolioView1-main__container__right__taskAndTweetsContainer__flip-card-back">
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
      {!openImagePanel && (
        <IconButton
          className="portfolioView1-main__carouselIconButton"
          onClick={() => setOpenImagePanel(true)}
        >
          <LeftArrowIcon className="portfolioView1-main__carouselIconButton__icon" />
        </IconButton>
      )}
      <div
        className={
          openImagePanel
            ? "portfolioView1-main__carouselContainer portfolioView1-main__carouselContainer__show"
            : "portfolioView1-main__carouselContainer portfolioView1-main__carouselContainer__hide"
        }
        ref={wrapperRef}
      >
        <IconButton
          className={
            openImagePanel
              ? "portfolioView1-main__carouselContainer__iconButton portfolioView1-main__carouselContainer__iconButton__show"
              : "portfolioView1-main__carouselContainer__iconButton portfolioView1-main__carouselContainer__iconButton__hide"
          }
          onClick={() => setOpenImagePanel(false)}
        >
          <RightArrowIcon
            className={"portfolioView1-main__carouselList__iconButton__icon"}
          />
        </IconButton>
        <div
          className={
            portfolioInfo?.photoURLs.length > 5
              ? "portfolioView1-main__carouselContainer__listImages"
              : "portfolioView1-main__carouselContainer__listImages portfolioView1-main__carouselContainer__listImages__center"
          }
        >
          {portfolioInfo &&
            portfolioInfo?.photoURLs.map((url: any, i: number) => (
              <img
                className={
                  openImagePanel
                    ? "portfolioView1-main__carouselContainer__listImages__imageStyle" +
                      " portfolioView1-main__carouselContainer__listImages__imageStyle__show"
                    : "portfolioView1-main__carouselContainer__listImages__imageStyle" +
                      " portfolioView1-main__carouselContainer__listImages__imageStyle__hide"
                }
                src={url}
                key={i}
                onClick={() => {
                  setOpenImagePanel(false);
                  openImageCarousel();
                }}
              ></img>
            ))}
        </div>
      </div>
      {portfolioInfo && (
        <ImageCarousel
          open={openCarousel}
          close={() => setOpenCarousel(false)}
          pictures={portfolioInfo?.photoURLs}
        />
      )}
    </div>
  ) : (
    <div
      className={"portfolioView1-main__noContent"}
      style={{
        backgroundImage:
          state.isLoading !== true && portfolioInfo?.projectInfos?.length === 0
            ? `url(${projectBg2})`
            : "linear-gradient(to bottom, rgba(29, 58, 64, 0.739583),rgba(29, 58, 64, 0.739583) 55%, hsla(12, 8%, 88%, 1) 45%,#dfdfdf)",
      }}
    >
      {state.isLoading !== true && portfolioInfo?.projectInfos?.length === 0 && (
        <>
          <span className={"portfolioView1-main__noContent__text"}>
            Lets build something amazing !
          </span>
          <span className={"portfolioView1-main__noContent__text1"}>
            Add projects to get started
          </span>
        </>
      )}
    </div>
  );
};

export default PortfolioView;

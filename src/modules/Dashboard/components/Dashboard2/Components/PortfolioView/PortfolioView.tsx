import axios from "axios";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import {
  setHeaderShown,
  setIsLoading,
  setPortfolioInfo,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import PortfolioProjectsCard from "../PortfolioProjectsCard/PortfolioProjectsCard";
import { getExchangeToken } from "src/services/authservice";
import "./PortfolioView.scss";
import ImageCarousel from "../../../../shared/ImageCarousel/ImageCarousel";
import LeftArrowIcon from "@material-ui/icons/ArrowLeft";
import RightArrowIcon from "@material-ui/icons/ArrowRight";
import { IconButton } from "@material-ui/core";
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
import classNames from "classnames";
import TaskAndNewsCard from "src/modules/Dashboard/shared/TaskAndNewsCard/TaskAndNewsCard";
import TwitterCard from "src/modules/Dashboard/shared/TwitterCard/TwitterCard";
import Dropdown from "src/modules/Dashboard/shared/Dropdown/Dropdown";
import CarbonWidget from "src/modules/Dashboard/shared/CarbonWidget/CarbonWidget";
import CommonWidget from "src/modules/Dashboard/shared/CommonWidget/CommonWidget";
import EmbodiedCarbonWidget from "src/modules/Dashboard/shared/EmbodiedCarbonWidget/EmbodiedCarbonWidget";
import TMRAndPPCPortfolioWidget from "src/modules/Dashboard/shared/TMRAndPPCPortfolioWidget/TMRAndPPCPortfolioWidget";
import Widget from "src/modules/Dashboard/shared/Widget/Widget";
import DashboardMapView from "../DashboardMapViewContainer";

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

const PortfolioView = ({
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
  handleYearFilterClick,
  selectedYearIndex,
}: Props): ReactElement => {
  const { dispatch, state }: any = useContext(stateContext);
  const portfolioSliderRef: any = useRef();
  const [portfolioWidgetInfo, setPortfolioWidgetInfo]: any = useState({
    constraintsData: 0,
    variancesData: 0,
  });
  const [portfolioInfo, setPortfolioDetails]: any = useState(null);
  const { innerWidth: width, innerHeight: height } = window;
  const [openCarousel, setOpenCarousel] = useState(false);
  const [openImagePanel, setOpenImagePanel] = useState(false);
  const [stateView, setStateView] = useState(sessionStorage.getItem("stateView"));
  const [tmrData, setTMRData]: any = useState([]);
  const [ppcData, setPPCData]: any = useState([]);
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
    setStateView(sessionStorage.getItem("stateView"));
  });

  const widgetScrollRef = useRef<HTMLInputElement>(null);
  const openImageCarousel = () => {
    setOpenCarousel(true);
  };

  const token = getExchangeToken();

  useEffect(() => {
    dispatch(setIsLoading(true));
    state.currentPortfolio?.portfolioId && getPortfolioInfo();
  }, [state.currentPortfolio]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.constraints &&
      getConstraintsData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.constraints]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.variances &&
      getVariancesData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.variances]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.carbonfootprint &&
      getEmbodiedCarbonFootPrintData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.carbonfootprint]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.carbon &&
      getbestAndWorstByECData();
  }, [state.currentPortfolio, state?.projectWidgetSettings?.carbon]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId &&
      (state?.projectWidgetSettings?.budget ||
        state?.projectWidgetSettings?.ontime ||
        state?.projectWidgetSettings?.ahead ||
        state?.projectWidgetSettings?.behind ||
        state?.projectWidgetSettings?.rfi ||
        state?.projectWidgetSettings?.milestone) &&
      getPortfolioWidgetData();
  }, [
    state.currentPortfolio,
    savedValue,
    state?.projectWidgetSettings?.budget,
    state?.projectWidgetSettings?.ontime,
    state?.projectWidgetSettings?.ahead,
    state?.projectWidgetSettings?.behind,
    state?.projectWidgetSettings?.rfi,
    state?.projectWidgetSettings?.milestone,
  ]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.tmr &&
      getTMRData();
  }, [state.currentPortfolio, savedValue, state?.projectWidgetSettings?.tmr]);

  useEffect(() => {
    state.currentPortfolio?.portfolioId &&
      state?.projectWidgetSettings?.ppc &&
      getPPCData();
  }, [state.currentPortfolio, savedValue, state?.projectWidgetSettings?.ppc]);

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
    ];
    const widgetsLength = 12;
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
    }
  };

  useEffect(() => {
    if (portfolioSliderRef?.current) {
      portfolioSliderRef?.current?.slickGoTo(0, true);
    }
  }, [state.projectWidgetSettings]);

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
      console.error(error);
    }
  };

  const handleWidgetScroll = (scrollType: any) => {
    if (widgetScrollRef?.current) {
      widgetScrollRef?.current.scrollTo(
        widgetScrollRef?.current?.scrollLeft + scrollType,
        0
      );
    }
  };

  return !state.isLoading && portfolioInfo?.projectInfos?.length > 0 ? (
    <div className="portfolioView-main">
      <div
        className="portfolioView-main__nameAndFilterContainer"
        style={{
          maxWidth: stateView !== "fourth" ? width * 0.93 : "100%",
        }}
      >
        <div className="portfolioView-main__nameAndFilterContainer__portfolioTitle">
          {state.currentPortfolio?.portfolioName}
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
      {displayWidgetScrollIcons && (
        <div
          className="portfolioView-main__widgetsContainer"
          style={{
            maxWidth: stateView !== "fourth" ? width * 0.93 : "100%",
          }}
        >
          <IconButton
            className="portfolioView-main__widgetsContainer__iconButton portfolioView-main__widgetsContainer__iconButton__left"
            onClick={() => handleWidgetScroll(-(window.innerWidth * 0.8))}
          >
            <LeftArrowIcon />
          </IconButton>
          <div
            className="portfolioView-main__widgetsContainer__scrollView"
            ref={widgetScrollRef}
          >
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
                    portfolioWidgetInfo?.spend ? portfolioWidgetInfo?.spend : 0
                  }
                  dimensionsClass={"dimensions"}
                />
              </div>
            )}
            {state?.projectWidgetSettings?.tmr && (
              <div>
                <TMRAndPPCPortfolioWidget
                  head={"TMR"}
                  value={tmrData}
                  img={tmrImg}
                  dimensionsClass={"dimensions"}
                />
              </div>
            )}
            {state?.projectWidgetSettings?.ppc && (
              <div>
                <TMRAndPPCPortfolioWidget
                  head={"PPC"}
                  value={ppcData}
                  img={tmrImg}
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
                />
              </div>
            )}
            {state?.projectWidgetSettings?.milestone && (
              <div>
                <CommonWidget
                  head={"Milestones"}
                  value={
                    portfolioWidgetInfo?.numOfMilestones
                      ? portfolioWidgetInfo?.numOfMilestones
                      : 0
                  }
                  img={milestoneImg}
                  bgClass={"milestoneBg"}
                  dimensionsClass={"dimensions"}
                />
              </div>
            )}
            {state?.projectWidgetSettings?.rfi && (
              <div>
                <CommonWidget
                  head={"RFI's"}
                  value={
                    portfolioWidgetInfo?.numOfRFIs
                      ? portfolioWidgetInfo?.numOfRFIs
                      : 0
                  }
                  img={rfiImg}
                  bgClass={"rfiBg"}
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
                  stackBarDim={{
                    width: 250,
                    height: 115,
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
                  dimensionsClass={"dimensions"}
                />
              </div>
            )}
          </div>
          <IconButton
            className={
              "portfolioView-main__widgetsContainer__iconButton portfolioView-main__widgetsContainer__iconButton__right"
            }
            onClick={() => handleWidgetScroll(+(window.innerWidth * 0.8))}
          >
            <RightArrowIcon />
          </IconButton>
        </div>
      )}

      <div className="portfolioView-main__mapAndTaskContainer">
        <div className="portfolioView-main__mapAndTaskContainer__mapContainer">
          <DashboardMapView info={portfolioInfo}/>
          <PortfolioProjectsCard
            info={portfolioInfo?.projectInfos}
            levelType={"portfolio"}
          />
          {/* <Timeline /> */}
        </div>
        <div className="portfolioView-main__mapAndTaskContainer__taskContainer">
          <div
            className={classNames({
              "portfolioView-main__mapAndTaskContainer__taskContainer__flip-card-inner":
                true,
              "portfolioView-main__mapAndTaskContainer__taskContainer__flip-card-on-hover":
                flipBack,
            })}
          >
            <div className="portfolioView-main__mapAndTaskContainer__taskContainer__flip-card-front">
              <div style={{ height: height * 0.5 }}>
                <TwitterCard
                  setFlipBack={setFlipBack}
                  flipBack={flipBack}
                  height={0.52}
                  className={"twitter-feeds"}
                />
              </div>
            </div>
            <div className="portfolioView-main__mapAndTaskContainer__taskContainer__flip-card-back">
              <div style={{ height: height * 0.5 }}>
                <TaskAndNewsCard
                  setFlipBack={setFlipBack}
                  flipBack={flipBack}
                  height={0.52}
                  className={"taskAndNewsCard"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {!openImagePanel && (
        <IconButton
          className="portfolioView-main__carouselIconButton"
          onClick={() => setOpenImagePanel(true)}
        >
          <LeftArrowIcon className="portfolioView-main__carouselIconButton__icon" />
        </IconButton>
      )}
      <div
        className={
          openImagePanel
            ? "portfolioView-main__carouselContainer portfolioView-main__carouselContainer__show"
            : "portfolioView-main__carouselContainer portfolioView-main__carouselContainer__hide"
        }
        ref={wrapperRef}
      >
        <IconButton
          className={
            openImagePanel
              ? "portfolioView-main__carouselContainer__iconButton portfolioView-main__carouselContainer__iconButton__show"
              : "portfolioView-main__carouselContainer__iconButton portfolioView-main__carouselContainer__iconButton__hide"
          }
          onClick={() => setOpenImagePanel(false)}
        >
          <RightArrowIcon
            className={"portfolioView-main__carouselList__iconButton__icon"}
          />
        </IconButton>
        <div
          className={
            portfolioInfo?.photoURLs.length > 5
              ? "portfolioView-main__carouselContainer__listImages"
              : "portfolioView-main__carouselContainer__listImages portfolioView-main__carouselContainer__listImages__center"
          }
        >
          {portfolioInfo &&
            portfolioInfo?.photoURLs.map((url: any, i: number) => (
              <img
                className={
                  openImagePanel
                    ? "portfolioView-main__carouselContainer__listImages__imageStyle" +
                      " portfolioView-main__carouselContainer__listImages__imageStyle__show"
                    : "portfolioView-main__carouselContainer__listImages__imageStyle" +
                      " portfolioView-main__carouselContainer__listImages__imageStyle__hide"
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
      className={"portfolioView-main__noContent"}
      style={{
        backgroundImage:
          state.isLoading !== true && portfolioInfo?.projectInfos?.length === 0
            ? `url(${projectBg2})`
            : "linear-gradient(to bottom, rgba(29, 58, 64, 0.739583),rgba(29, 58, 64, 0.739583) 55%, hsla(12, 8%, 88%, 1) 45%,#dfdfdf)",
      }}
    >
      {state.isLoading !== true && portfolioInfo?.projectInfos?.length === 0 && (
        <>
          <span className={"portfolioView-main__noContent__text"}>
            Lets build something amazing !
          </span>
          <span className={"portfolioView-main__noContent__text1"}>
            Add projects to get started
          </span>
        </>
      )}
    </div>
  );
};

export default PortfolioView;

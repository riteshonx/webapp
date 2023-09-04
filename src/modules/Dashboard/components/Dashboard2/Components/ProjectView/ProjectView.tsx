import axios from "axios";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import {
  setHeaderShown,
  setIsLoading,
  setPreviousRoute,
  setProjectInfo,
  setSelectedMenu,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import PortfolioProjectsCard from "../PortfolioProjectsCard/PortfolioProjectsCard";
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
import ontime from "../../../../../../assets/images/ontrack.svg";
import ahead from "../../../../../../assets/images/ahaead.svg";
import milestoneImg from "../../../../../../assets/images/milestorne1.svg";
import rfiImg from "../../../../../../assets/images/sb1.svg";
import carbonFPImg from "../../../../../../assets/images/carb2.svg";
import constrImg from "../../../../../../assets/images/constr.svg";
import tmrImg from "../../../../../../assets/images/tmr.svg";
import varianceImg from "../../../../../../assets/images/variance.svg";
import carbonDataImg from "../../../../../../assets/images/projectBehind.svg";
import projectBehind from "../../../../../../assets/images/behind2.svg";
import { GET_IMAGES_ON_DASHBOARD } from "src/modules/upload/graphql/graphql";
import { client } from "src/services/graphql";
import { postApi } from "src/services/api";
import { FETCH_PROJECT_BY_ID } from "src/graphhql/queries/projects";
import { useHistory } from "react-router-dom";
import TaskAndNewsCard from "src/modules/Dashboard/shared/TaskAndNewsCard/TaskAndNewsCard";
import TwitterCard from "src/modules/Dashboard/shared/TwitterCard/TwitterCard";
import Dropdown from "src/modules/Dashboard/shared/Dropdown/Dropdown";
import CommonWidget from "src/modules/Dashboard/shared/CommonWidget/CommonWidget";
import EmbodiedCarbonWidget from "src/modules/Dashboard/shared/EmbodiedCarbonWidget/EmbodiedCarbonWidget";
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
  handleYearFilterClick,
  selectedYearIndex,
}: Props): ReactElement => {
  const { dispatch, state }: any = useContext(stateContext);
  const [projectInfo, setProjectDetails]: any = useState(null);
  const projectSliderRef: any = useRef();
  const { innerWidth: width, innerHeight: height } = window;
  const [projectWidgetsInfo, setProjectWidgetsInfo]: any = useState({});
  const [openCarousel, setOpenCarousel] = useState(false);
  const [openImagePanel, setOpenImagePanel] = useState(false);
  const [stateView, setStateView] = useState(sessionStorage.getItem("stateView"));
  const [tmrWidgetData, setTMRWidgetData]: any = useState(0);
  const [ppcWidgetData, setPPCWidgetData]: any = useState(0);
  const [variancesData, setVariancesData]: any = useState(0);
  const [constraintsData, setConstraintsData]: any = useState(0);
  const [flipBack, setFlipBack]: any = useState(false);
  const [embodiedCarbonWidgetData, setEmbodiedCarbonWidgetData]: any =
    useState(null);
  const [embodiedFootprintWidgetData, setEmbodiedFootprintWidgetData]: any =
    useState(null);
  const [displayWidgetScrollIcons, setDisplayWidgetScrollIcons]: any =
    useState(true);
  const [photoUrls, setPhotoUrls]: any = useState([]);
  const widgetScrollRef = useRef<HTMLInputElement>(null);
  const wrapperRef: any = useRef(null);
  const token = getExchangeToken();
  const [projectDataForCurrency, setProjectDataForCurrency]: any = useState();
  const history: any = useHistory();

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
    state.currentProject?.projectId &&
      state.projectWidgetSettings.constraints &&
      getConstraintsData();
  }, [state.currentProject, state.projectWidgetSettings.constraints]);

  useEffect(() => {
    state.currentProject?.projectId &&
      state.projectWidgetSettings.variances &&
      getVariancesData();
  }, [state.currentProject, state.projectWidgetSettings.variances]);

  useEffect(() => {
    state.currentProject?.projectId &&
      state.projectWidgetSettings.carbondata &&
      getEmbodiedCarbonData();
  }, [state.currentProject, state.projectWidgetSettings.carbondata]);

  useEffect(() => {
    state.currentProject?.projectId &&
      state.projectWidgetSettings.carbonfootprint &&
      getEmbodiedCarbonFootPrintData();
  }, [state.currentProject, state.projectWidgetSettings.carbonfootprint]);

  useEffect(() => {
    state.currentProject?.projectId &&
      (state.projectWidgetSettings.budget ||
        state.projectWidgetSettings.status ||
        state.projectWidgetSettings.milestone ||
        state.projectWidgetSettings.rfi) &&
      getProjectWidgetData();
  }, [
    state.currentProject,
    savedValue,
    state.projectWidgetSettings.budget,
    state.projectWidgetSettings.status,
    state.projectWidgetSettings.milestone,
    state.projectWidgetSettings.rfi,
  ]);

  useEffect(() => {
    state.currentProject?.projectId &&
      state.projectWidgetSettings.tmr &&
      getTMRData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.tmr]);

  useEffect(() => {
    state.currentProject?.projectId &&
      state.projectWidgetSettings.ppc &&
      getPPCData();
  }, [state.currentProject, savedValue, state.projectWidgetSettings.ppc]);

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
    ];
    const widgetsLength = 10;
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

  const handleScroll = () => {
    if (window.pageYOffset > 25) {
      dispatch(setHeaderShown(true));
    } else {
      dispatch(setHeaderShown(false));
    }
  };

  useEffect(() => {
    if (projectSliderRef?.current) {
      projectSliderRef?.current?.slickGoTo(0, true);
    }
  }, [state.projectWidgetSettings]);

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

  const handleWidgetScroll = (scrollType: any) => {
    if (widgetScrollRef?.current) {
      widgetScrollRef?.current.scrollTo(
        widgetScrollRef?.current?.scrollLeft + scrollType,
        0
      );
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

  const handleRFIWidgetClick = () => {
    dispatch(setPreviousRoute(history.location.pathname));
    state.currentProject?.projectId &&
      history.push(
        `/base/projects/${Number(state.currentProject?.projectId)}/form/${"2"}`
      );
    dispatch(setSelectedMenu("Forms"));
    sessionStorage.setItem("selectedMenu", "Insights");
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
    <div className="projectView-main">
      <div
        className="projectView-main__nameAndFilterContainer"
        style={{
          maxWidth: stateView !== "fourth" ? width * 0.92 : "100%",
        }}
      >
        <div className="projectView-main__nameAndFilterContainer__projectTitle">
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
      {displayWidgetScrollIcons && (
        <div
          className="projectView-main__widgetsContainer"
          style={{
            maxWidth: stateView !== "fourth" ? width * 0.92 : "100%",
          }}
        >
          <IconButton
            className="projectView-main__widgetsContainer__iconButton projectView-main__widgetsContainer__iconButton__left"
            onClick={() => handleWidgetScroll(-(window.innerWidth * 0.8))}
          >
            <LeftArrowIcon />
          </IconButton>
          <div
            className="projectView-main__widgetsContainer__scrollView"
            ref={widgetScrollRef}
          >
            {state?.projectWidgetSettings?.budget && (
              <div>
                <Widget
                  currency={projectDataForCurrency?.currency}
                  budget={
                    projectWidgetsInfo?.budget ? projectWidgetsInfo?.budget : 0
                  }
                  spend={
                    projectWidgetsInfo?.spend ? projectWidgetsInfo?.spend : 0
                  }
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
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
            {state?.projectWidgetSettings?.rfi && (
              <div>
                <CommonWidget
                  head={"RFI's"}
                  value={
                    projectWidgetsInfo?.numOfRFIs
                      ? projectWidgetsInfo?.numOfRFIs
                      : 0
                  }
                  img={rfiImg}
                  bgClass={"rfiBg"}
                  handleClick={handleRFIWidgetClick}
                  dimensionsClass={"dimensions"}
                />
              </div>
            )}
            {state?.projectWidgetSettings?.milestone && (
              <div>
                <CommonWidget
                  head={"Milestones"}
                  value={
                    projectWidgetsInfo?.numOfMilestones
                      ? projectWidgetsInfo?.numOfMilestones
                      : 0
                  }
                  img={milestoneImg}
                  bgClass={"milestoneBg"}
                  dimensionsClass={"dimensions"}
                  handleClick={handleMilestonesWidgetClick}
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
                  dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
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
                    dimensionsClass={"dimensions"}
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
                  dimensionsClass={"dimensions"}
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
            className="projectView-main__widgetsContainer__iconButton projectView-main__widgetsContainer__iconButton__right"
            onClick={() => handleWidgetScroll(+(window.innerWidth * 0.8))}
          >
            <RightArrowIcon />
          </IconButton>
        </div>
      )}
      <div className="projectView-main__mapAndTaskContainer">
        <div className="projectView-main__mapAndTaskContainer__mapContainer">
          <DashboardMapView info={projectInfo} />
          <PortfolioProjectsCard
            levelType={"project"}
            info={projectInfo?.team}
          />
        </div>
        <div className="projectView-main__mapAndTaskContainer__taskContainer">
          <div
            className={classNames({
              "projectView-main__mapAndTaskContainer__taskContainer__flip-card-inner":
                true,
              "projectView-main__mapAndTaskContainer__taskContainer__flip-card-on-hover":
                flipBack,
            })}
          >
            <div className="projectView-main__mapAndTaskContainer__taskContainer__flip-card-front">
              <div style={{ height: height * 0.5 }}>
                <TwitterCard
                  setFlipBack={setFlipBack}
                  flipBack={flipBack}
                  height={0.52}
                  className={"twitter-feeds"}
                />
              </div>
            </div>
            <div className="projectView-main__mapAndTaskContainer__taskContainer__flip-card-back">
              <div style={{ height: height * 0.5 }}>
                <TaskAndNewsCard
                  height={0.52}
                  setFlipBack={setFlipBack}
                  flipBack={flipBack}
                  className={"taskAndNewsCard"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {!openImagePanel && photoUrls?.length ? (
        <IconButton
          className="projectView-main__carouselIconButton"
          onClick={() => setOpenImagePanel(true)}
        >
          <LeftArrowIcon className="projectView-main__carouselIconButton__icon" />
        </IconButton>
      ) : (
        ""
      )}

      <div
        className={
          openImagePanel
            ? "projectView-main__carouselContainer projectView-main__carouselContainer__show"
            : "projectView-main__carouselContainer projectView-main__carouselContainer__hide"
        }
        ref={wrapperRef}
      >
        <IconButton
          className={
            openImagePanel
              ? "projectView-main__carouselContainer__iconButton projectView-main__carouselContainer__iconButton__show"
              : "projectView-main__carouselContainer__iconButton projectView-main__carouselContainer__iconButton__hide"
          }
          onClick={() => setOpenImagePanel(false)}
        >
          <RightArrowIcon
            className={"projectView-main__carouselList__iconButton__icon"}
          />
        </IconButton>
        <div
          className={
            photoUrls?.length > 5
              ? "projectView-main__carouselContainer__listImages"
              : "projectView-main__carouselContainer__listImages projectView-main__carouselContainer__listImages__center"
          }
        >
          {photoUrls?.length &&
            photoUrls.map((url: any, i: number) => (
              <img
                src={url}
                className={
                  openImagePanel
                    ? "projectView-main__carouselContainer__listImages__imageStyle projectView-main__carouselContainer__listImages__imageStyle__show"
                    : "projectView-main__carouselContainer__listImages__imageStyle projectView-main__carouselContainer__listImages__imageStyle__hide"
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
    <div className={"projectView-main__noContent"}></div>
  );
};

export default ProjectView;

import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { getExchangeToken } from "src/services/authservice";
import axios from "axios";
import moment from "moment";
import VerticalStackBarChart from "../../../Shared/VerticalStackBarChart/VerticalStackBarChart";
import "./Incidents.scss";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

interface Incidents {
  filterType: string;
}

const Incidents = ({ filterType }: Incidents): ReactElement => {
  const chartRef1: any = useRef(null);
  const { state }: any = useContext(stateContext);
  const [incidentsData, setIncidentsData]: any = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt]: any = useState(null);

  useEffect(() => {
    chartRef1.current && chartRef1.current.dispose();
    setIncidentsData(null);
    if (
      state?.currentLevel === "portfolio" &&
      state?.currentPortfolio?.portfolioId
    ) {
      fetchIncidentsByPortfolio();
    } else if (
      state?.currentLevel === "project" &&
      state?.currentProject?.projectId
    ) {
      fetchIncidentsByProject();
    } else {
    }
  }, [state?.currentLevel, filterType]);

  const fetchIncidentsByPortfolio = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v2/getIncidents?portfolioId=${state?.currentPortfolio?.portfolioId}&rollUp=${filterType}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data?.cube?.length) {
        const data = response?.data?.cube?.map((item: any, i: number) => {
          setLastUpdatedAt(response?.data?.latestTS);
          return {
            ...item,
            filterType:
              item?.rollUp === "monthly"
                ? moment(item?.timeDim, "MM").format("MMM") +
                  " " +
                  moment(item?.calYear, "YYYY").format("YY")
                : item?.rollUp === "quarterly"
                ? `Q${item?.timeDim}, ${moment(item?.calYear, "YYYY").format(
                    "YY"
                  )}`
                : `${moment(item?.calYear, "YYYY").format("YYYY")}`,
          };
        });

        setIncidentsData(data?.reverse());
      } else {
        setIncidentsData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchIncidentsByPortfolio err", err);
    }
  };

  const fetchIncidentsByProject = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v2/getIncidents?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}&rollUp=${filterType}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data?.cube?.length) {
        setLastUpdatedAt(response?.data?.latestTS);
        const data = response?.data?.cube?.map((item: any, i: number) => {
          return {
            ...item,
            filterType:
              item?.rollUp === "monthly"
                ? moment(item?.timeDim, "MM").format("MMM") +
                  " " +
                  moment(item?.calYear, "YYYY").format("YY")
                : item?.rollUp === "quarterly"
                ? `Q${item?.timeDim}, ${moment(item?.calYear, "YYYY").format(
                    "YY"
                  )}`
                : `${moment(item?.calYear, "YYYY").format("YYYY")}`,
          };
        });
        setIncidentsData(data?.reverse());
      } else {
        setIncidentsData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchIncidentsByProject err", err);
    }
  };

  return (
    <div className="incidents-main">
      <div className="incidents-main__headerContainer">
        <span className="incidents-main__headerContainer__header">
          Incidents
        </span>
        <span className="incidents-main__headerContainer__legendContainer">
          <span className="incidents-main__headerContainer__legendContainer__legend">
            <div className="incidents-main__headerContainer__legendContainer__legend__circle lightGreen"></div>
            <span>Minor</span>
          </span>
          <span className="incidents-main__headerContainer__legendContainer__legend">
            <div className="incidents-main__headerContainer__legendContainer__legend__circle yellow"></div>
            <span>Lost time 1-7 Days</span>
          </span>
          <span className="incidents-main__headerContainer__legendContainer__legend noMargin">
            <div className="incidents-main__headerContainer__legendContainer__legend__circle darkGreen"></div>
            <span>Major</span>
          </span>
        </span>
      </div>
      <VerticalStackBarChart
        chartRef={chartRef1}
        chartDiv={"chartdiv1"}
        chartData={incidentsData}
        nameValueAndColorList={[
          { value: "majorIncidents", name: "Major", color: "#105C6B" },
          { value: "lostDaysIncidents", name: "Lost Time", color: "#FFA80D" },
          { value: "minorIncidents", name: "Minor", color: "#90B890" },
        ]}
        filterType={filterType}
        yAxisTitle={"No. of Incidents"}
      />
      <span className="incidents-main__updatedDateContainer">
        <span className="incidents-main__updatedDateContainer__head">
          Updated:{" "}
        </span>
        <span className="incidents-main__updatedDateContainer__date">
          {lastUpdatedAt ? moment(lastUpdatedAt).format("MMM DD, YYYY") : "NA"}
        </span>
      </span>
    </div>
  );
};

export default Incidents;

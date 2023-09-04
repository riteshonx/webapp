import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { getExchangeToken } from "src/services/authservice";
import MultilineAreaChart from "../../../Shared/MultilineAreaChart/MultilineAreaChart";
import axios from "axios";
import moment from "moment";
import "./WhosOnsite.scss";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

interface WhosOnsite {
  filterType: string;
}

const WhosOnsite = ({ filterType }: WhosOnsite): ReactElement => {
  const chartRef4: any = useRef(null);
  const { state }: any = useContext(stateContext);
  const [whosOnsiteData, setWhosOnsiteData]: any = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt]: any = useState(null);

  useEffect(() => {
    chartRef4.current && chartRef4.current.dispose();
    setWhosOnsiteData(null);
    if (
      state?.currentLevel === "portfolio" &&
      state?.currentPortfolio?.portfolioId
    ) {
      fetchWhosOnsiteByPortfolio();
    } else if (
      state?.currentLevel === "project" &&
      state?.currentProject?.projectId
    ) {
      fetchWhosOnsiteByProject();
    }
  }, [state?.currentLevel, filterType]);

  const fetchWhosOnsiteByPortfolio = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v2/getOnsiteHrs?portfolioId=${state?.currentPortfolio?.portfolioId}&rollUp=${filterType}`,
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
          return (
            i < 6 && {
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
            }
          );
        });

        setWhosOnsiteData(data?.reverse());
      } else {
        setWhosOnsiteData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchWhosOnsiteByPortfolio err", err);
    }
  };

  const fetchWhosOnsiteByProject = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v2/getOnsiteHrs?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}&rollUp=${filterType}`,
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
          return (
            i < 6 && {
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
            }
          );
        });
        setWhosOnsiteData(data?.reverse());
      } else {
        setWhosOnsiteData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchWhosOnsiteByProject err", err);
    }
  };

  return (
    <div className="whosOnsite-main">
      <div className="whosOnsite-main__headerContainer">
        <span className="whosOnsite-main__headerContainer__header">
          Who is Onsite?
        </span>
        <span className="whosOnsite-main__headerContainer__legendContainer">
          <span className="whosOnsite-main__headerContainer__legendContainer__legend">
            <div className="whosOnsite-main__headerContainer__legendContainer__legend__circle lightGreen"></div>
            <span>Employees</span>
          </span>
          <span className="whosOnsite-main__headerContainer__legendContainer__legend">
            <div className="whosOnsite-main__headerContainer__legendContainer__legend__circle yellow"></div>
            <span>Labour</span>
          </span>
          <span className="whosOnsite-main__headerContainer__legendContainer__legend noMargin">
            <div className="whosOnsite-main__headerContainer__legendContainer__legend__circle darkGreen"></div>
            <span>Trades</span>
          </span>
        </span>
      </div>
      <MultilineAreaChart
        chartRef={chartRef4}
        chartDiv={"chartdiv4"}
        chartData={whosOnsiteData}
        nameValueAndColorList={[
          { value: "trade", name: "Trade", color: "#105C6B" },
          { value: "labor", name: "Labour", color: "#FFA80D" },
          { value: "employees", name: "Employees", color: "#90B890" },
        ]}
        filterType={filterType}
        yAxisTitle={"Hours"}
      />
      <span className="whosOnsite-main__updatedDateContainer">
        <span className="whosOnsite-main__updatedDateContainer__head">
          Updated:{" "}
        </span>
        <span className="whosOnsite-main__updatedDateContainer__date">
          {lastUpdatedAt ? moment(lastUpdatedAt).format("MMM DD, YYYY") : "NA"}
        </span>
      </span>
    </div>
  );
};

export default WhosOnsite;

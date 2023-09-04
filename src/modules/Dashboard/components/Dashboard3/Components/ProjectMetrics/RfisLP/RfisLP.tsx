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
import "./RfisLP.scss";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

interface RfisLP {
  filterType: string;
}

const RfisLP = ({ filterType }: RfisLP): ReactElement => {
  const chartRef2: any = useRef(null);
  const { state }: any = useContext(stateContext);
  const [rfisData, setRfisData]: any = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt]: any = useState(null);

  useEffect(() => {
    chartRef2.current && chartRef2.current.dispose();
    setRfisData(null);
    if (
      state?.currentLevel === "portfolio" &&
      state?.currentPortfolio?.portfolioId
    ) {
      fetchRfisByPortfolio();
    } else if (
      state?.currentLevel === "project" &&
      state?.currentProject?.projectId
    ) {
      fetchRfisByProject();
    }
  }, [state?.currentLevel, filterType]);

  const fetchRfisByPortfolio = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v2/getRfiCountByStatus?portfolioId=${state?.currentPortfolio?.portfolioId}&rollUp=${filterType}`,
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

        setRfisData(data?.reverse());
      } else {
        setRfisData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchRfisByPortfolio err", err);
    }
  };

  const fetchRfisByProject = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v2/getRfiCountByStatus?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}&rollUp=${filterType}`,
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
        setRfisData(data?.reverse());
      } else {
        setRfisData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchRfisByProject err", err);
    }
  };

  return (
    <div className="rfisLP-main">
      <div className="rfisLP-main__headerContainer">
        <span className="rfisLP-main__headerContainer__header">RFIs</span>
        <span className="rfisLP-main__headerContainer__legendContainer">
          <span className="rfisLP-main__headerContainer__legendContainer__legend">
            <div className="rfisLP-main__headerContainer__legendContainer__legend__circle lightGreen"></div>
            <span>Open</span>
          </span>
          <span className="rfisLP-main__headerContainer__legendContainer__legend">
            <div className="rfisLP-main__headerContainer__legendContainer__legend__circle yellow"></div>
            <span>New</span>
          </span>
          <span className="rfisLP-main__headerContainer__legendContainer__legend noMargin">
            <div className="rfisLP-main__headerContainer__legendContainer__legend__circle darkGreen"></div>
            <span>Closed</span>
          </span>
        </span>
      </div>
      <VerticalStackBarChart
        chartRef={chartRef2}
        chartDiv={"chartdiv2"}
        chartData={rfisData}
        nameValueAndColorList={[
          { value: "closedCount", name: "Closed", color: "#105C6B" },
          { value: "newCount", name: "New", color: "#FFA80D" },
          { value: "openCount", name: "Open", color: "#90B890" },
        ]}
        filterType={filterType}
        yAxisTitle={"No. of RFI's"}
      />
      <span className="rfisLP-main__updatedDateContainer">
        <span className="rfisLP-main__updatedDateContainer__head">
          Updated:{" "}
        </span>
        <span className="rfisLP-main__updatedDateContainer__date">
          {lastUpdatedAt ? moment(lastUpdatedAt).format("MMM DD, YYYY") : "NA"}
        </span>
      </span>
    </div>
  );
};

export default RfisLP;

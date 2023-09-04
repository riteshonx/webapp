import axios from "axios";
import moment from "moment";
import "./Financials.scss";
import { getExchangeToken } from "src/services/authservice";
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import ColumnSeriesWithLineChart from "../../../Shared/ColumnSeriesWithLineChart/ColumnSeriesWithLineChart";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

interface Financials {
  filterType: string;
}

const Financials = ({ filterType }: Financials): ReactElement => {
  const chartRef3: any = useRef(null);
  const { state }: any = useContext(stateContext);
  const [financialsData, setFinancialsData]: any = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt]: any = useState(null);

  useEffect(() => {
    chartRef3.current && chartRef3.current.dispose();
    setFinancialsData(null);
    if (
      state?.currentLevel === "portfolio" &&
      state?.currentPortfolio?.portfolioId
    ) {
      fetchFinancialsByPortfolio();
    } else if (
      state?.currentLevel === "project" &&
      state?.currentProject?.projectId
    ) {
      fetchFinancialsByProject();
    }
  }, [state?.currentLevel, filterType]);

  const fetchFinancialsByPortfolio = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getFinancials?portfolioId=${state?.currentPortfolio?.portfolioId}&rollUp=${filterType}`,
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

        setFinancialsData(data?.reverse());
      } else {
        setFinancialsData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchRfisByPortfolio err", err);
    }
  };

  const fetchFinancialsByProject = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getFinancials?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}&rollUp=${filterType}`,
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
        setFinancialsData(data?.reverse());
      } else {
        setFinancialsData(response?.data?.cube);
      }
    } catch (err) {
      console.log("fetchFinancialsByProject err", err);
    }
  };

  return (
    <div className="financials-main">
      <div className="financials-main__headerContainer">
        <span className="financials-main__headerContainer__header">
          Financials
        </span>
        <span className="financials-main__headerContainer__legendContainer">
          <span className="financials-main__headerContainer__legendContainer__legend">
            <div className="financials-main__headerContainer__legendContainer__legend__circle lightGreen"></div>
            <span>Planned Value</span>
          </span>
          <span className="financials-main__headerContainer__legendContainer__legend">
            <div className="financials-main__headerContainer__legendContainer__legend__circle yellow"></div>
            <span>Earned Value</span>
          </span>
          <span className="financials-main__headerContainer__legendContainer__legend noMargin">
            <div className="financials-main__headerContainer__legendContainer__legend__circle darkGreen"></div>
            <span>Actual Cost</span>
          </span>
        </span>
      </div>
      <ColumnSeriesWithLineChart
        chartRef={chartRef3}
        chartDiv={"chartdiv3"}
        chartData={financialsData}
        nameValueAndColorList={[
          { value: "actualCost", name: "Actual Cost", color: "#105C6B" },
          { value: "earnedValue", name: "Earned Value", color: "#FFA80D" },
          { value: "plannedValue", name: "Planned Value", color: "#90B890" },
        ]}
        lineSeriesNameAndValue={{
          name: "CPI",
          value: "cpi",
        }}
        filterType={filterType}
        yAxisTitle={"Spend in GBP (Millions)"}
      />
      <span className="financials-main__cpiLegendContainer">
        <span className="financials-main__cpiLegendContainer__head">CPI: </span>
        <div className="financials-main__cpiLegendContainer__dash"></div>
        <div className="financials-main__cpiLegendContainer__dash"></div>
        <div className="financials-main__cpiLegendContainer__dash"></div>
      </span>
      <span className="financials-main__updatedDateContainer">
        <span className="financials-main__updatedDateContainer__head">
          Updated:{" "}
        </span>
        <span className="financials-main__updatedDateContainer__date">
          {lastUpdatedAt ? moment(lastUpdatedAt).format("MMM DD, YYYY") : "NA"}
        </span>
      </span>
    </div>
  );
};

export default Financials;

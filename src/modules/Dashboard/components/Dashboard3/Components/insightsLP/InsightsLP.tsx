import { CircularProgress } from "@material-ui/core";
import axios from "axios";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { getExchangeToken } from "src/services/authservice";
import "./InsightsLP.scss";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

const InsightsLP = (): ReactElement => {
  const { state }: any = useContext(stateContext);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights]: any = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setInsights(null);
    if (
      state?.currentLevel === "portfolio" &&
      state?.currentPortfolio?.portfolioId
    ) {
      fetchInsightsByPortfolio();
    } else if (
      state?.currentLevel === "project" &&
      state?.currentProject?.projectId
    ) {
      fetchInsightsByProject();
    } else {
      setIsLoading(false);
    }
  }, [state?.currentLevel]);

  const fetchInsightsByPortfolio = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getProjectInsightsWeb?portfolioId=${state?.currentPortfolio?.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInsights(response.data?.scheduleImpact);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log("fetchInsightsByPortfolio err", err);
    }
  };

  const fetchInsightsByProject = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getProjectInsightsWeb?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInsights(response.data?.scheduleImpact);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log("fetchInsightsByProject err", err);
    }
  };

  return (
    <div className="insightsLP-main">
      {!isLoading && insights?.length ? (
        insights?.map((item: any, i: number) =>
          JSON.parse(item.msgs)?.map((msg: string) => (
            <div
              key={i}
              className={
                item?.priority === "High"
                  ? "insightsLP-main__insights highPriority"
                  : "insightsLP-main__insights"
              }
              dangerouslySetInnerHTML={{
                __html: msg,
              }}
            ></div>
          ))
        )
      ) : (
        <div className="insightsLP-main__noDataContainer">
          {insights?.length === 0 && (
            <div className="insightsLP-main__noDataContainer__text">
              No Insights available!
            </div>
          )}

          {insights === null && (
            <CircularProgress className="insightsLP-main__noDataContainer__circularProgress" />
          )}
        </div>
      )}
    </div>
  );
};

export default InsightsLP;

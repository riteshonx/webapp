import React, { useContext, useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { createStyles, makeStyles, Modal } from "@material-ui/core";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import axios from "axios";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import moment from "moment";
import "./BudgetMetrics.scss";
import VerticalStackBarChart from "../../../Dashboard3/Shared/VerticalStackBarChart/VerticalStackBarChart";

const useStyles = makeStyles(() =>
  createStyles({
    modal: {
      minWidth: "80%",
      minHeight: "80%",
      maxWidth: "80%",
      maxHeight: "80%",
    },
  })
);

const BudgetMetrics = ({
  title,
  handleClose,
  open,
}: any): React.ReactElement => {
  const classes: any = useStyles();
  const { state }: any = useContext(stateContext);
  const chartRef1: any = useRef(null);
  const chartRef2: any = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [classCodeData, setClassCodeData] = useState([]);
  const [selectedClassCode, setSelectedClassCode]: any = useState(null);
  const [selectedClassCodeData, setSelectedClassCodeData] = useState([]);
  const token = getExchangeToken();

  useEffect(() => {
    state.currentProject?.projectId && getBudgetMetricsCube();
    state.currentProject?.projectId && getTopBudgetImpactByClassCode();
  }, []);

  useEffect(() => {
    selectedClassCode && getSelectedClassCodeData();
  }, [selectedClassCode]);

  const getSelectedClassCodeData = () => {
    const temp: any = [];
    Object.keys(selectedClassCode).forEach((k) => {
      if (["budget", "changeorder", "exposure"].includes(k)) {
        temp.push({
          [k]: selectedClassCode[k],
          filterType: k,
        });
      }
    });
    setSelectedClassCodeData(temp);
  };

  const getBudgetMetricsCube = async () => {
    const tenantId = Number(decodeExchangeToken().tenantId);
    const userId = decodeExchangeToken().userId;
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v2/getBudgetMetricsCube` +
          `?tenantId=${tenantId}&portfolioId=${state.currentPortfolio.portfolioId}&sessionUserId=${userId}&projectId=${state.currentProject?.projectId}&dateFilterKey=y2023`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        const data = response?.data?.cube?.map((item: any, i: number) => {
          return {
            ...item,
            approvedChangeOrders: item?.approvedChangeOrders
              ? item?.approvedChangeOrders
              : 0,
            budget: item?.budget ? item?.budget : 0,
            exposure: item?.exposure ? item?.exposure : 0,
            filterType:
              moment(item?.timeDim, "MM").format("MMM") +
              " " +
              moment(item?.calYear, "YYYY").format("YY"),
          };
        });
        setChartData(data?.splice(0, 17));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getTopBudgetImpactByClassCode = async () => {
    const tenantId = Number(decodeExchangeToken().tenantId);
    const userId = decodeExchangeToken().userId;
    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v2/TopBudgetImpactByClassCode` +
          `?tenantId=${tenantId}&portfolioId=${state.currentPortfolio.portfolioId}&sessionUserId=${userId}&projectId=${state.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        const data = response?.data?.cube?.map((item: any, i: number) => {
          return {
            ...item,
            filterType: item?.classificationCode,
          };
        });
        const sortedData = data.sort((a: any, b: any) => b.impact - a.impact);
        setClassCodeData(sortedData);
        setSelectedClassCode(data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className={classes.modal}
    >
      <div className="budgetMetrics-main">
        <div className="budgetMetrics-main__headerContainer">
          <div className="budgetMetrics-main__headerContainer__title">
            {title ? title : "Productivity"}
          </div>
          <IconButton
            className="budgetMetrics-main__headerContainer__iconButton"
            onClick={handleClose}
          >
            <CloseIcon className="budgetMetrics-main__headerContainer__iconButton__icon" />
          </IconButton>
        </div>
        <div className="budgetMetrics-main__bodyContainer1">
          <VerticalStackBarChart
            chartRef={chartRef1}
            chartDiv={"chartdiv1"}
            chartData={chartData}
            nameValueAndColorList={[
              { value: "budget", name: "Budget", color: "#105C6B" },
              { value: "exposure", name: "Exposure", color: "#FFA80D" },
              {
                value: "approvedChangeOrders",
                name: "Change Order",
                color: "#90B890",
              },
            ]}
            filterType={"monthly"}
            yAxisTitle={"Financials"}
            titleTextColor={"#f7b047"}
            fontStyles={{
              fontSize: 10,
              color: "#fff",
            }}
            flatBar={true}
          />
        </div>
        <div className="budgetMetrics-main__bodyContainer2">
          <div className="budgetMetrics-main__bodyContainer2__spaceDiv"></div>
          {classCodeData?.length && (
            <div className="budgetMetrics-main__bodyContainer2__classCodeData">
              <div className="budgetMetrics-main__bodyContainer2__classCodeData__container">
                <div className="budgetMetrics-main__bodyContainer2__classCodeData__container__head">
                  Top 5 contributing Cost Codes{" "}
                  <div className="budgetMetrics-main__bodyContainer2__classCodeData__container__head__subHead1">
                    (as of March 2023)
                  </div>
                </div>
                <div className="budgetMetrics-main__bodyContainer2__classCodeData__container__head">
                  Impact{" "}
                  <span className="budgetMetrics-main__bodyContainer2__classCodeData__container__head__subHead2">
                    (%)
                  </span>
                </div>
              </div>
              {classCodeData?.map((item: any, index: number) => (
                <div className="budgetMetrics-main__bodyContainer2__classCodeData__container">
                  <div
                    key={index}
                    className={
                      item?.classificationCode ===
                      selectedClassCode?.classificationCode
                        ? "budgetMetrics-main__bodyContainer2__classCodeData__container__classCodeName budgetMetrics-main__bodyContainer2__classCodeData__container__selected"
                        : "budgetMetrics-main__bodyContainer2__classCodeData__container__classCodeName"
                    }
                    onClick={() => setSelectedClassCode(item)}
                  >
                    {item?.classificationCodeName}
                  </div>

                  <div
                    key={index}
                    className={
                      item?.classificationCode ===
                      selectedClassCode?.classificationCode
                        ? "budgetMetrics-main__bodyContainer2__classCodeData__container__impact budgetMetrics-main__bodyContainer2__classCodeData__container__selected"
                        : "budgetMetrics-main__bodyContainer2__classCodeData__container__impact"
                    }
                  >
                    {item?.impact ? item?.impact : 0}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div
            className={
              selectedClassCodeData && selectedClassCodeData?.length
                ? "budgetMetrics-main__bodyContainer2__chartDiv budgetMetrics-main__bodyContainer2__flex1"
                : "budgetMetrics-main__bodyContainer2__chartDiv budgetMetrics-main__bodyContainer2__flex2"
            }
          >
            <VerticalStackBarChart
              chartRef={chartRef2}
              chartDiv={"chartdiv2"}
              chartData={selectedClassCodeData}
              nameValueAndColorList={[
                { value: "budget", name: "Budget", color: "#105C6B" },
                { value: "exposure", name: "Exposure", color: "#FFA80D" },
                {
                  value: "changeorder",
                  name: "Change Order",
                  color: "#90B890",
                },
              ]}
              filterType={"none"}
              yAxisTitle={"Financials"}
              fontStyles={{
                fontSize: 10,
                color: "#fff",
              }}
              flatBar={true}
              titleTextColor={"#f7b047"}
              valueAxisTextColor={"#f7b047"}
            />
          </div>
          <div className="budgetMetrics-main__bodyContainer2__spaceDiv"></div>
        </div>
      </div>
    </Modal>
  );
};

export default BudgetMetrics;

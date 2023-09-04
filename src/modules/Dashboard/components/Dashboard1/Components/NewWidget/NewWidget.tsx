import {
  ArrowDropUp as ArrowUpIcon,
  ArrowDropDown as ArrowDownIcon,
} from "@material-ui/icons";
import ProgressBar from "../ProgressBar/ProgressBar";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import "./NewWidget.scss";
import { ReactElement } from "react";

interface Props {
  title: string;
  totalProjects?: number;
  averageTitle: string;
  averageCost: any;
  avgTitle?: string;
  avgVal: any;
  prodAvg?: any;
  prodAvgPerc?: any;
  legend?: any;
  data: any;
}

const NewWidget = (props: Props): ReactElement => {
  return (
    <div className="newWidget-main">
      <div className="newWidget-main__titleContainer">
        {props.title}
        {props.totalProjects && (
          <span className="newWidget-main__titleContainer__projectsCount">
            {props.totalProjects - 1}
          </span>
        )}
      </div>
      <div className={"newWidget-main__totalAvgContainer"}>
        <div className={"newWidget-main__totalAvgContainer__avgTitle"}>
          {props?.averageTitle}
        </div>
        <div className={"newWidget-main__avgContainer"}>
          <div
            className={"newWidget-main__avgContainer__avgCostAndTitleContainer"}
          >
            <div
              className={
                "newWidget-main__avgContainer__avgCostAndTitleContainer__avgCost"
              }
            >
              {props.averageCost}
            </div>
            <div
              className={
                "newWidget-main__avgContainer__avgCostAndTitleContainer__avgTitle"
              }
            >
              {props.avgTitle}
            </div>
          </div>
          <div className={"newWidget-main__avgContainer__percContainer"}>
            {props?.avgVal === 0 && <ArrowUpIcon htmlColor="green" />}
            {props?.avgVal > 0 &&
              (props.title === "Health" ||
                props.title === "Who: On-Site" ||
                props.averageTitle === "Cost Performance Index") && (
                <ArrowUpIcon htmlColor="red" />
              )}
            {props?.avgVal < 0 &&
              (props.title === "Health" ||
                props.title === "Who: On-Site" ||
                props.averageTitle === "Cost Performance Index") && (
                <ArrowDownIcon htmlColor="green" />
              )}
            {props.avgVal}%
          </div>
        </div>
      </div>
      {props?.data && props?.data?.length
        ? props.data?.map((item: any, i: number) => (
            <div key={i}>
              <ProgressBar
                widgetName={props.title}
                title={item.title}
                perc={item.pct}
                data={item.chartData}
                total={item.total}
                subTitle = {item?.subTitle ? item?.subTitle:""}
              />
            </div>
          ))
        : ""}

      {props?.title === "Who: On-Site" && (
        <div className="newWidget-main__totalAvgContainer newWidget-main__onsiteAvgContainer">
          <div className="newWidget-main__totalAvgContainer__avgTitle">
            Productivity Average
          </div>
          <div className="newWidget-main__avgContainer">
            <div className="newWidget-main__avgContainer__avgCostAndTitleContainer">
              <div className="newWidget-main__avgContainer__avgCostAndTitleContainer__avgCost">
                {props.prodAvg}
              </div>

              <div className="newWidget-main__avgContainer__avgCostAndTitleContainer__avgTitle">
                {props.avgTitle}
              </div>
            </div>
            <div className="newWidget-main__avgContainer__percContainer">
              {props.prodAvgPerc >= 0 ? (
                <ArrowUpIcon htmlColor="green" />
              ) : (
                <ArrowDownIcon htmlColor="red" />
              )}
              {props.prodAvgPerc}%
            </div>
          </div>
        </div>
      )}

      {props?.legend && props?.legend?.length && props?.data?.length ? (
        props?.title !== "Productivity" && (
          <div className="newWidget-main__legendContainer">
            {props.legend?.map((item: any, i: number) => (
              <span key={i} className="newWidget-main__legendContainer__main">
                <FiberManualRecordIcon
                  className="newWidget-main__legendContainer__main__colorContainer"
                  style={{ color: item?.color }}
                />
                <span className="newWidget-main__legendContainer__main__name">
                  {item.name}
                </span>
              </span>
            ))}
          </div>
        )
      ) : (
        <></>
      )}
    </div>
  );
};

export default NewWidget;

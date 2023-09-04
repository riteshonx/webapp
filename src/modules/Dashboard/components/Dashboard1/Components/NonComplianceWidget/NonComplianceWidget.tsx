import { ReactElement, useState } from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import "./NonComplianceWidget.scss";

interface Props {
  title: string;
  totalProjects?: number;
  data: any;
  headerText?:string;
  nonComplianceData:any;
  category:string;
}

const NonComplianceWidget = (props: Props): ReactElement => {
  const [complianceType, setComplianceType] = useState(true);
  return (
    <div className="nonComplianceWidget-main">
      <div className="nonComplianceWidget-main__titleContainer">
        {props.headerText ? props.headerText : props.title}
        {props.totalProjects && (
          <span className="nonComplianceWidget-main__titleContainer__projectsCount">
            {props.totalProjects - 1}
          </span>
        )}
      </div>
      <div>
        <ProgressBar
          widgetName={props.title}
          title={props?.nonComplianceData?.title}
          perc={props?.nonComplianceData?.pct}
          data={props?.nonComplianceData?.chartData}
          total={props?.nonComplianceData?.total}
        />
      </div>
      <div className="nonComplianceWidget-main__bestAndWorstContainer">
        <div className={"nonComplianceWidget-main__bestAndWorstContainer__categoryType"}>
            {props.category}
        </div>
        <div
          className={
            complianceType
              ? "nonComplianceWidget-main__bestAndWorstContainer__complianceType" +
                " nonComplianceWidget-main__bestAndWorstContainer__complianceType__selected"
              : "nonComplianceWidget-main__bestAndWorstContainer__complianceType"
          }
          onClick={() => setComplianceType(true)}
        >
          Best
        </div>
        <div
          className={
            !complianceType
              ? "nonComplianceWidget-main__bestAndWorstContainer__complianceType" +
                " nonComplianceWidget-main__bestAndWorstContainer__complianceType__selected"
              : "nonComplianceWidget-main__bestAndWorstContainer__complianceType"
          }
          onClick={() => setComplianceType(false)}
        >
          Can Improve
        </div>
      </div>
      {complianceType &&
        props.data?.best?.map((item: any, i: number) => (
          <div
            key={i}
            className={"nonComplianceWidget-main__progressBarContainer"}
          >
            <ProgressBar
              title={item.title}
              perc={item.pct}
              data={item.chartData}
              widgetName={props.title}
            />
          </div>
        ))}
      {!complianceType &&
        props.data?.canImprove?.map((item: any, i: number) => (
          <div
            key={i}
            className={"nonComplianceWidget-main__progressBarContainer"}
          >
            <ProgressBar
              title={item.title}
              perc={item.pct}
              data={item.chartData}
              widgetName={props.title}
            />
          </div>
        ))}
    </div>
  );
};

export default NonComplianceWidget;

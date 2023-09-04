import {
  ArrowDropUp as ArrowUpIcon,
  ArrowDropDown as ArrowDownIcon,
} from "@material-ui/icons";
import { ReactElement } from "react";
import { nFormatter } from "src/modules/Dashboard/utils/util";
import "./SpiWidget.scss";

interface Props {
  title: string;
  averageTitle: string;
  spiData: any;
  totalProjects?: number;
  currentLevel?: string;
}

const SpiWidget = (props: Props): ReactElement => {
  return (
    <div className="spiWidget-main">
      <div className="spiWidget-main__titleContainer">
        {props.title}
        {props.totalProjects && (
          <span className="spiWidget-main__titleContainer__projectsCount">
            {props.totalProjects - 1}
          </span>
        )}
      </div>
      <div className="spiWidget-main__averageTitleContainer">
        <div className="spiWidget-main__averageTitleContainer__averageTitle">
          {props?.averageTitle}
        </div>
        <div className="spiWidget-main__averageTitleContainer__trendContainer">
          <div className="spiWidget-main__averageTitleContainer__trendContainer__spiValContainer">
            <div className="spiWidget-main__averageTitleContainer__trendContainer__spiValContainer__avgSpi">
              {props.spiData?.avgSpi ? nFormatter(props.spiData?.avgSpi, 2) : 0}
            </div>
          </div>
          <div className="spiWidget-main__averageTitleContainer__trendContainer__avgSPITrendContainer">
            {(!props.spiData?.avgSpiTrend ||
              props.spiData?.avgSpiTrend === 0) && (
              <ArrowUpIcon htmlColor="green" />
            )}
            {props.spiData?.avgSpiTrend > 0 && (
              <ArrowUpIcon htmlColor="green" />
            )}
            {props.spiData?.avgSpiTrend < 0 && (
              <ArrowDownIcon htmlColor="red" />
            )}
            {props.spiData?.avgSpiTrend
              ? nFormatter(props.spiData?.avgSpiTrend, 2)
              : 0}
            %
          </div>
        </div>
      </div>
      <div className="spiWidget-main__projectContainer">
        {props?.currentLevel === "portfolio" &&
          props.spiData?.list?.map((item: any, i: number) => (
            <div key={i} className="spiWidget-main__projectContainer__main">
              <div className="spiWidget-main__projectContainer__main__projectName">
                {item.projectName?.length > 20
                  ? `${item.projectName.slice(0, 20)}...`
                  : item.projectName}{" "}
              </div>
              <div className="spiWidget-main__projectContainer__main__avgContainer">
                <div className="spiWidget-main__projectContainer__main__avgContainer__spiVal">
                  {item.spi ? nFormatter(item.spi, 2) : 0}
                </div>
                <div className="spiWidget-main__projectContainer__main__avgContainer__spiTrend">
                  {(!item.spiTrend || item.spiTrend === 0) && (
                    <ArrowUpIcon htmlColor="green" />
                  )}
                  {item.spiTrend > 0 && <ArrowUpIcon htmlColor="green" />}
                  {item.spiTrend < 0 && <ArrowDownIcon htmlColor="red" />}
                  {item.spiTrend ? nFormatter(item.spiTrend, 2) : 0}%
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SpiWidget;

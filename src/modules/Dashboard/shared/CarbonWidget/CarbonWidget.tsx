import { Card, CardContent, CardHeader, makeStyles } from "@material-ui/core";
import { useEffect, useState } from "react";
import StackBarChart from "../StackBarChart/StackBarChart";
import "./CarbonWidget.scss";
import { Flip as FlipIcon } from "@material-ui/icons";
import classNames from "classnames";

const useStyles = makeStyles({
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: "bolder",
    textAlign: "center",
    color: "#17353C",
  },
});

interface Props {
  head: string;
  subHead1: string;
  subHead2: string;
  data: any;
  isWidgetLoading: boolean;
  dimensionsClass: string;
  stackBarDim: any;
}

const CarbonWidget = (props: Props): any => {
  const classes = useStyles();

  const [topChartData, setTopChartData]: any = useState(null);
  const [bottomChartData, setBottomChartData]: any = useState(null);
  const [flipBack, setFlipBack]: any = useState(false);

  //converting api data to chart data format
  useEffect(() => {
    if (props.data?.top?.length || props.data?.bottom?.length) {
      const formattedTopChartData = [
        {
          data: props.data?.top.map((item: any) => {
            return {
              target: { id: item?.projectId, name: item?.projectName },
              count: item?.baselineEC ? item?.baselineEC : 0,
            };
          }),
          source: props.subHead1,
        },
        {
          data: props.data.top.map((item: any) => {
            return {
              target: { id: item?.projectId, name: item?.projectName },
              count: item?.designEC ? item?.designEC : 0,
            };
          }),
          source: props.subHead2,
        },
      ];

      const formattedBottomChartData = [
        {
          data: props.data?.bottom.map((item: any) => {
            return {
              target: { id: item?.projectId, name: item?.projectName },
              count: item?.baselineEC ? item?.baselineEC : 0,
            };
          }),
          source: props.subHead1,
        },
        {
          data: props.data?.bottom.map((item: any) => {
            return {
              target: { id: item?.projectId, name: item?.projectName },
              count: item?.designEC ? item?.designEC : 0,
            };
          }),
          source: props.subHead2,
        },
      ];
      setTopChartData(formattedTopChartData);
      setBottomChartData(formattedBottomChartData);
    } else {
      setTopChartData(null);
      setBottomChartData(null);
    }
  }, [props.data]);

  return (
    <div
      className={`carbon-widget-main carbon-widget-main__flip-card carbon-widget-main__${props.dimensionsClass}`}
    >
      <div
        className={classNames({
          "carbon-widget-main__flip-card-inner": true,
          "carbon-widget-main__flip-card-on-hover": flipBack,
        })}
      >
        <Card className="carbon-widget-main carbon-widget-main__flip-card-front">
          <FlipIcon
            className="carbon-widget-main__flip-icon"
            onClick={() => {
              setFlipBack(!flipBack);
            }}
          />
          <CardHeader
            className="carbon-widget-main__header"
            title={props.head}
            classes={{
              title: classes.headerTitle,
            }}
          />
          <CardContent
            className={classNames({
              "carbon-widget__content": true,
              "carbon-widget-main__noContent":
                !topChartData && !props?.isWidgetLoading,
            })}
          >
            <div className="carbon-widget-main__subTitle">Best Performing</div>
            {topChartData?.length > 0 && props?.isWidgetLoading === false && (
              <StackBarChart
                chartData={topChartData}
                isTop={"top"}
                barDimensions={props.stackBarDim}
              />
            )}
            {props?.isWidgetLoading === true && (
              <div className="carbon-widget-main__content__loading">
                Loading...
              </div>
            )}
            {!topChartData && props?.isWidgetLoading === false && (
              <>No data available</>
            )}
          </CardContent>
        </Card>
        <Card className="carbon-widget-main carbon-widget-main__flip-card-back">
          <FlipIcon
            className="carbon-widget-main__flip-icon"
            onClick={() => {
              setFlipBack(!flipBack);
            }}
          />
          <CardHeader
            className="carbon-widget-main__header"
            title={props.head}
            classes={{
              title: classes.headerTitle,
            }}
          />
          <CardContent
            className={classNames({
              "carbon-widget__content": true,
              "carbon-widget-main__noContent":
                !bottomChartData && !props?.isWidgetLoading,
            })}
          >
            <div className="carbon-widget-main__subTitle">Worst Performing</div>
            {bottomChartData && !props?.isWidgetLoading && (
              <StackBarChart
                chartData={bottomChartData}
                isTop={"bottom"}
                barDimensions={props.stackBarDim}
              />
            )}
            {props?.isWidgetLoading === true && (
              <div className="carbon-widget-main__content__loading">
                Loading...
              </div>
            )}
            {!topChartData && props?.isWidgetLoading === false && (
              <>No data available</>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CarbonWidget;

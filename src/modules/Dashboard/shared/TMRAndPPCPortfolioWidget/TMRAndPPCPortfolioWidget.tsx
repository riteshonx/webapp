import {
  Card,
  CardContent,
  CardHeader,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { ReactElement } from "react";
import "./TMRAndPPCPortfolioWidget.scss";

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
  value: any;
  img: any;
  dimensionsClass: string;
}

const TMRAndPPCPortfolioWidget = (props: Props): ReactElement => {
  const classes = useStyles();
  return (
    <Card
      className={`tmrAndPpcPortfolioWidget-main tmrAndPpcPortfolioWidget-main__${props.dimensionsClass}`}
    >
      {props.head === "TMR" && (
        <Tooltip title="Tasks Made Ready (Top 3)" placement="top">
          <div>
            <CardHeader
              className="tmrAndPpcPortfolioWidget__header"
              title={props.head}
              classes={{
                title: classes.headerTitle,
              }}
            />
          </div>
        </Tooltip>
      )}
      {props.head === "PPC" && (
        <Tooltip title="Percent Project Complete (Top 3)" placement="top">
          <div>
            <CardHeader
              className="tmrAndPpcPortfolioWidget__header"
              title={props.head}
              classes={{
                title: classes.headerTitle,
              }}
            />
          </div>
        </Tooltip>
      )}

      <CardContent
        className={`tmrAndPpcPortfolioWidget-main__content tmrAndPpcPortfolioWidget-main__${props.dimensionsClass}__bg`}
        style={{
          backgroundImage: `url(${props.img})`,
        }}
      >
        {props.head === "TMR" &&
          (props.value?.length
            ? props.value?.map((item: any) => (
                <div
                  key={item.projectId}
                  className="tmrAndPpcPortfolioWidget-main__content__val"
                >
                  <Tooltip title={item.projectName} placement="top">
                    <div className="tmrAndPpcPortfolioWidget-main__content__val__projectName">
                      {item.projectName?.trim()?.length > 20
                        ? item.projectName.trim().slice(0, 20).trim() + "..."
                        : item.projectName}
                    </div>
                  </Tooltip>
                  <div className="tmrAndPpcPortfolioWidget-main__content__val__dataContainer">
                    <Tooltip title={"TMR Value"} placement="top">
                      <span className="tmrAndPpcPortfolioWidget-main__content__val__dataContainer__value">
                        {item.tmr}%
                      </span>
                    </Tooltip>
                  </div>
                </div>
              ))
            : "No data available")}
        {props.head === "PPC" &&
          (props.value?.length
            ? props.value?.map((item: any) => (
                <div
                  key={item.projectId}
                  className="tmrAndPpcPortfolioWidget-main__content__val"
                >
                  <Tooltip title={item.projectName} placement="top">
                    <div className="tmrAndPpcPortfolioWidget-main__content__val__projectName">
                      {item.projectName?.trim()?.length > 20
                        ? item.projectName.trim().slice(0, 20).trim() + "..."
                        : item.projectName}
                    </div>
                  </Tooltip>
                  <div className="tmrAndPpcPortfolioWidget-main__content__val__dataContainer">
                    <Tooltip title={"PPC Value"} placement="top">
                      <span className="tmrAndPpcPortfolioWidget-main__content__val__dataContainer__value">
                        {item.ppc}%
                      </span>
                    </Tooltip>
                  </div>
                </div>
              ))
            : "No data available")}
      </CardContent>
    </Card>
  );
};

export default TMRAndPPCPortfolioWidget;

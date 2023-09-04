import { Card, CardContent, CardHeader, makeStyles } from "@material-ui/core";
import { ReactElement } from "react";
import { nFormatter } from "src/modules/Dashboard/utils/util";
import "./EmbodiedCarbonWidget.scss";

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
  value1: number;
  value2: number;
  bgClass: string;
  img: any;
  dimensionsClass: string;
}

function EmbodiedCarbonWidget(props: Props): ReactElement {
  const classes = useStyles();
  return (
    <Card
      className={`embodiedCarbonWidget-main embodiedCarbonWidget-main__${props.dimensionsClass}`}
    >
      <CardHeader
        className="embodiedCarbonWidget__header"
        title={props.head}
        classes={{
          title: classes.headerTitle,
        }}
      />
      <CardContent
        className={`embodiedCarbonWidget-main__content embodiedCarbonWidget-main__${props.dimensionsClass}__${props.bgClass}`}
        style={{
          backgroundImage: `url(${props.img})`,
        }}
      >
        <div className="embodiedCarbonWidget-main__content__val">
          <span className="embodiedCarbonWidget-main__content__val__headStyle">
            {props.subHead1}
          </span>
          <span>{nFormatter(props.value1)}</span>
        </div>
        <div className="embodiedCarbonWidget-main__content__val">
          <span className="embodiedCarbonWidget-main__content__val__headStyle">
            {props.subHead2}
          </span>
          <span>{nFormatter(props.value2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmbodiedCarbonWidget;

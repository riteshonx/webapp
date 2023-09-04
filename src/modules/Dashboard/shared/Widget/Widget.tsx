import { Card, CardContent, CardHeader, makeStyles } from "@material-ui/core";
import { ReactElement } from "react";
import { nFormatter } from "../../utils/util";
import "./Widget.scss";

const useStyles = makeStyles({
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: "bolder",
    textAlign: "center",
    color: "#17353C",
  },
});

interface Props {
  budget: any;
  spend: any;
  currency: any;
  dimensionsClass: string;
}

function Widget({
  budget,
  spend,
  currency,
  dimensionsClass,
}: Props): ReactElement {
  const classes = useStyles();

  return (
    <Card className={`widget-main widget-main__${dimensionsClass}`}>
      <CardHeader
        classes={{
          title: classes.headerTitle,
        }}
        className="widget-main__header"
        title="Budget"
      />
      <CardContent
        className={`widget-main__content widget-main__${dimensionsClass}__bg`}
      >
        <div className="widget-main__content__allocated">
          <span>Allocated:</span>
          <span className={"widget-main__content__allocated__value"}>
            {currency == "GBP"
              ? "£"
              : currency == "INR"
              ? "₹"
              : currency == "USD"
              ? "$"
              : "£"}
            {budget ? nFormatter(budget, 2) : 0}
          </span>
        </div>
        <div className="widget-main__content__spend">
          <span>Spent:</span>
          <span className="widget-main__content__spend__value">
            {currency == "GBP"
              ? "£"
              : currency == "INR"
              ? "₹"
              : currency == "USD"
              ? "$"
              : "£"}
            {spend ? nFormatter(spend, 2) : 0}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default Widget;

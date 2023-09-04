import {
  Card,
  CardContent,
  CardHeader,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { ReactElement } from "react";
import "./CommonWidget.scss";

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
  value?: any;
  img: any;
  bgClass: string;
  handleClick?: any;
  statusCount?: any;
  dimensionsClass: string;
}

function CommonWidget(props: Props): ReactElement {
  const classes = useStyles();
  return (
    <Card
      className={
        (props.handleClick && props?.value) ||
        (props?.head === "Milestones" &&
          props.handleClick &&
          (props?.value ||
            (props?.statusCount &&
              props?.statusCount[0]?.count +
                props?.statusCount[1]?.count +
                props?.statusCount[2]?.count)))
          ? `commonWidget-main commonWidget-main__pointer commonWidget-main__${props.dimensionsClass}`
          : `commonWidget-main commonWidget-main__${props.dimensionsClass}`
      }
      onClick={() =>
        (props.handleClick && props?.value) ||
        (props?.head === "Milestones" &&
          props.handleClick &&
          (props?.value ||
            (props?.statusCount &&
              props?.statusCount[0]?.count +
                props?.statusCount[1]?.count +
                props?.statusCount[2]?.count)))
          ? props.handleClick()
          : ""
      }
    >
      {props.head !== "TMR" && props.head !== "PPC" && props.head !== "RFI's" && (
        <CardHeader
          className="commonWidget__header"
          title={props.head}
          classes={{
            title: classes.headerTitle,
          }}
        />
      )}
      {props.head === "TMR" && (
        <Tooltip title="Tasks Made Ready" placement="top">
          <div>
            <CardHeader
              className="commonWidget__header"
              title={props.head}
              classes={{
                title: classes.headerTitle,
              }}
            />
          </div>
        </Tooltip>
      )}
      {props.head === "PPC" && (
        <Tooltip title="Percent Project Complete" placement="top">
          <div>
            <CardHeader
              className="commonWidget__header"
              title={props.head}
              classes={{
                title: classes.headerTitle,
              }}
            />
          </div>
        </Tooltip>
      )}
      {props.head === "RFI's" && (
        <Tooltip title="Request for Information" placement="top">
          <div>
            <CardHeader
              className="commonWidget__header"
              title={props.head}
              classes={{
                title: classes.headerTitle,
              }}
            />
          </div>
        </Tooltip>
      )}
      <CardContent
        className={`commonWidget-main__content commonWidget-main__${props.dimensionsClass}__${props.bgClass}`}
        style={{
          backgroundImage: `url(${props.img})`,
        }}
      >
        <div className="commonWidget-main__content__val">
          {((props.head !== "RFI's" && props.head !== "Milestones") ||
            !props?.statusCount) &&
            props.value}
          {(props.head === "RFI's" || props.head === "Milestones") &&
            (props.statusCount?.length
              ? props.statusCount[0]?.count +
                props.statusCount[1]?.count +
                props.statusCount[2]?.count
              : "")}

          {(props.head === "TMR" || props.head === "PPC") && "%"}
          {props.head === "RFI's" && (
            <div className="commonWidget-main__content__rfiMilestoneStatusContainer">
              {props.statusCount?.length
                ? props.statusCount?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className={
                        props.handleClick &&
                        item?.count &&
                        props?.head !== "Milestones"
                          ? "commonWidget-main__content__rfiMilestoneStatusContainer__val" +
                            " commonWidget-main__content__rfiMilestoneStatusContainer__val__bgColor"
                          : "commonWidget-main__content__rfiMilestoneStatusContainer__val"
                      }
                      onClick={() =>
                        props.handleClick &&
                        item?.count &&
                        props?.head !== "Milestones"
                          ? props.handleClick(item.status?.toLowerCase())
                          : ""
                      }
                    >
                      {item.status}
                      <div>{item.count}</div>
                    </div>
                  ))
                : ""}
            </div>
          )}
          {props.head === "Milestones" && (
            <div className="commonWidget-main__content__rfiMilestoneStatusContainer">
              {props.statusCount?.length
                ? props.statusCount?.map(
                    (item: any, i: number) =>
                      item.status !== "In-Progress" && (
                        <div
                          key={i}
                          className={
                            "commonWidget-main__content__rfiMilestoneStatusContainer__val"
                          }
                        >
                          {item.status}
                          <div>{item.count}</div>
                        </div>
                      )
                  )
                : ""}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CommonWidget;

import {
  ArrowDropUp as ArrowUpIcon,
  ArrowDropDown as ArrowDownIcon,
} from "@material-ui/icons";
import HSBar from "react-horizontal-stacked-bar-chart";
import "./ProgressBar.scss";
import { Tooltip } from "@material-ui/core";
import { ReactElement } from "react";

interface Props {
  widgetName: string;
  title: string;
  perc: any;
  data: any;
  total?: any;
  subTitle?:string;
}

const ProgressBar = (props: Props): ReactElement => {
  return (
    <div
      className={
        !props.data?.length
          ? "progressBar-main progressBar-main__zeroValue"
          : props.widgetName === "Health"
          ? "progressBar-main progressBar-main__nonZeroValue"
          : "progressBar-main progressBar-main__productivityValue"
      }
    >
      {props?.subTitle ?
      <div className={"progressBar-main__subTitle_container"}>
          <Tooltip title={props.subTitle}>
            <div className={"progressBar-main__subTitle_container__subTitle"}>
            {props?.subTitle}
            </div>
          </Tooltip>
            <Tooltip title={props.title} placement={"top"}>
            <div
              className={
                !props.data?.length
                  ? "progressBar-main__subStackBarTitle"
                  : "progressBar-main__subStackBarTitle progressBar-main__stackBarTitle__padding"
              }
            >
              {props.title?.length > 9
                ? `${props.title.slice(0, 7)}...`
                : props.title}
            </div>
          </Tooltip>
        </div>
      :<>
        <Tooltip title={props.title} placement={"top"}>
        <div
          className={
            !props.data?.length
              ? "progressBar-main__stackBarTitle"
              : "progressBar-main__stackBarTitle progressBar-main__stackBarTitle__padding"
          }
        >
          {props.title?.length > 9
            ? `${props.title.slice(0, 7)}...`
            : props.title}
        </div>
      </Tooltip>
      </>
      }

      <div
        className={
          props.data?.length
            ? "progressBar-main__stackBarContainer"
            : "progressBar-main__stackBarContainer progressBar-main__stackBarContainer__zeroValue"
        }
      >
        {props.data?.length ? (
          <HSBar showTextIn id="hsbarExample" height={25} data={props?.data} />
        ) : (
          <div className="progressBar-main__stackBarContainer__noContent">
            0
          </div>
        )}

        {props.widgetName === "Health" && (
          <div
            className={
              props.total
                ? "progressBar-main__stackBarContainer__totalValue progressBar-main__stackBarContainer__totalValue__show"
                : "progressBar-main__stackBarContainer__totalValue"
            }
          >
            Total: {props.total}
          </div>
        )}
      </div>
      {typeof props?.perc === "number" && (
        <div className="progressBar-main__trendContainer">
          {props?.perc === 0 && <ArrowUpIcon htmlColor="green" />}
          {props?.perc > 0 &&
            (props.widgetName === "Non-Compliance" ||
              props.widgetName === "Health" ||
              props.widgetName === "Who: On-Site" ||
              props.title === "Non-Compliance" ||
              props.title === "Spend") && <ArrowUpIcon htmlColor="red" />}
          {props?.perc < 0 &&
            (props.widgetName === "Non-Compliance" ||
              props.widgetName === "Health" ||
              props.widgetName === "Who: On-Site" ||
              props.title === "Non-Compliance" ||
              props.title === "Spend") && <ArrowDownIcon htmlColor="green" />}
          {props?.perc > 0 &&
            (props.title === "Revenue" || props.title === "Budget") && (
              <ArrowUpIcon htmlColor="green" />
            )}
          {props?.perc < 0 &&
            (props.title === "Revenue" || props.title === "Budget") && (
              <ArrowDownIcon htmlColor="red" />
            )}
          {props?.perc}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

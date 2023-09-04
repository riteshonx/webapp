import { useState, ReactElement, useEffect } from "react";
import DonutChart from "react-donut-chart";
import "./TimeAndStatus.scss";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

interface Props {
  title: any;
  totalProjects?: any;
  workpackagesData: any;
}

const TimeAndStatus = (props: Props): ReactElement => {
  const [status, setStatus] = useState("To-Do");
  const [chartData, setChartData]: any = useState([
    {
      label: "To-Do",
      value: 0,
      isEmpty: true,
    },
    {
      label: "In-progress",
      value: 0,
      isEmpty: true,
    },
    {
      label: "Complete",
      value: 0,
      isEmpty: true,
    },
  ]);

  useEffect(() => {
    if (
      props?.workpackagesData &&
      props?.workpackagesData?.length &&
      props?.workpackagesData[0]?.count +
        props?.workpackagesData[1]?.count +
        props?.workpackagesData[2]?.count >
        0
    ) {
      const data: any = [
        {
          label: "To-Do",
          value: Number(
            props?.workpackagesData.find((item: any) => item.status === "To-Do")
              ?.count
          ),
        },
        {
          label: "In-Progress",
          value: Number(
            props?.workpackagesData.find(
              (item: any) => item.status === "In-Progress"
            )?.count
          ),
        },
        {
          label: "Complete",
          value: Number(
            props?.workpackagesData.find(
              (item: any) => item.status === "Complete"
            )?.count
          ),
        },
      ];
      setChartData(data);
    } else {
      setChartData([
        {
          label: "To-Do",
          value: 0,
          isEmpty: true,
        },
        {
          label: "In-progress",
          value: 0,
          isEmpty: true,
        },
        {
          label: "Complete",
          value: 0,
          isEmpty: true,
        },
      ]);
    }
  }, [props?.workpackagesData]);
  return (
    <div className="timeandstatus-container">
      <div className="timeandstatus-container__heading">
        {props.title}
        {props.totalProjects && (
          <span className="timeandstatus-container__heading__count">
            {props.totalProjects - 1}
          </span>
        )}
      </div>
      {props?.workpackagesData && (
        <>
          <div className="timeandstatus-container__chart-container">
            <div className="timeandstatus-container__chart-container__donut">
              <DonutChart
                data={chartData}
                width={120}
                height={420}
                outerRadius={0.98}
                selectedOffset={0}
                legend={false}
                clickToggle={false}
                colors={["#105C6B","#EEC644", "#EF7753"]}
                onClick={(item: any) => {
                  setStatus(item?.label);
                }}
              />
              <div className="timeandstatus-container__chart-container__donut__wp-total">
                {props.workpackagesData[0]?.count +
                props.workpackagesData[1]?.count +
                props.workpackagesData[2]?.count
                  ? props.workpackagesData[0]?.count +
                    props.workpackagesData[1]?.count +
                    props.workpackagesData[2]?.count +
                    " "
                  : 0 + " "}
                Work <br />
                Packages <br /> Total
              </div>
              {status === "To-Do" &&
                props?.workpackagesData.find(
                  (item: any) => item.status === "To-Do"
                )?.count !== 0 && (
                  <div className="timeandstatus-container__chart-container__donut__todo">
                    <div className="timeandstatus-container__chart-container__donut__val">
                      {props?.workpackagesData?.length > 0
                        ? props?.workpackagesData.find(
                            (item: any) => item.status === "To-Do"
                          )?.count
                        : 0}
                    </div>
                    <div className="timeandstatus-container__chart-container__donut__key">
                      To-Do
                    </div>
                  </div>
                )}
              {status === "In-Progress" &&
                props?.workpackagesData.find(
                  (item: any) => item.status === "In-Progress"
                )?.count !== 0 && (
                  <div className="timeandstatus-container__chart-container__donut__inprogress">
                    <div className="timeandstatus-container__chart-container__donut__val">
                      {props?.workpackagesData?.length > 0
                        ? props?.workpackagesData.find(
                            (item: any) => item.status === "In-Progress"
                          )?.count
                        : 0}
                    </div>
                    <div className="timeandstatus-container__chart-container__donut__key">
                      In-Progress
                    </div>
                  </div>
                )}
              {status === "Complete" &&
                props?.workpackagesData.find(
                  (item: any) => item.status === "Complete"
                )?.count !== 0 && (
                  <div className="timeandstatus-container__chart-container__donut__complete">
                    <div className="timeandstatus-container__chart-container__donut__val">
                      {props?.workpackagesData?.length > 0
                        ? props?.workpackagesData.find(
                            (item: any) => item.status === "Complete"
                          )?.count
                        : 0}
                    </div>
                    <div className="timeandstatus-container__chart-container__donut__key">
                      Completed
                    </div>
                  </div>
                )}
            </div>
          </div>
          {chartData[0]?.value + chartData[1]?.value + chartData[2]?.value >
          0 ? (
            <div className="timeandstatus-container__legend-container">
              <FiberManualRecordIcon className="timeandstatus-container__legend-container__todo" />
              <span className="timeandstatus-container__legend-container__text">
                To-Do
              </span>
              <FiberManualRecordIcon className="timeandstatus-container__legend-container__inprogress" />
              <span className="timeandstatus-container__legend-container__text">
                In-Progress
              </span>

              <FiberManualRecordIcon className="timeandstatus-container__legend-container__complete" />
              <span className="timeandstatus-container__legend-container__text">
                Completed
              </span>
            </div>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default TimeAndStatus;

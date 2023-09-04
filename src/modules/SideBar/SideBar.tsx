import React, { useState } from "react";
import HorizontalProgressBar from "../Dashboard/components/Dashboard3/Shared/HorizontalProgressBar/HorizontalProgressBar";
import "./SideBar.scss";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

const progressData = [
  "30%",
  "60%",
  "80%",
  "20%",
  "0%",
  "50%",
  "90%",
  "10%",
  "85%",
  "45%",
  "100%",
  "0%",
  "0%",
  "60%",
];

const SideBar = () => {
  const [hover1, setHover1] = useState(false);
  const [hover2, setHover2] = useState(false);

  return (
    <div
      className="sidebar-menu-main"
      style={{
        display: "flex",
        flex: 1,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 2,
          backgroundColor: "#171d25",
          padding: "2rem 5rem",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-start",
            opacity: "0.5",
            fontSize: "12px",
            transition: "all 300ms ease",
          }}
        >
          <span
            style={{
              color: "#495269",
              display: "block",
              fontSize: "22px",
              lineHeight: "12px",
              float: "left",
              //   margin: "0 0 0 22px",
              paddingRight: "0.5rem",
            }}
          >
            {"<"}
          </span>
          <span
            style={{
              fontSize: "18px",

              // font: '0/18px "DINWeb","Lucida Grande",verdana,sans-serif',
              color: "#fff",
            }}
          >
            SLATE 2.0
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "2rem",
            color: "#00bff3",
            font: "22px 'DINWeb','Lucida Grande',verdana,sans-serif",
            letterSpacing: "3px",
            textTransform: "uppercase",
            verticalAlign: "middle",
          }}
        >
          HOME{" "}
          <span className="icon" style={{ paddingLeft: "1rem" }}>
            <span className="bar one"></span>
            <span className="bar two"></span>
            <span className="bar three"></span>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            marginBottom: "8rem",
            padding: "0 4rem",
          }}
        >
          <div style={{ margin: "1rem 0 1rem 0" }}>
            <span
              style={{
                color: "#a3afbc",
                display: "block",
                font: "11px/1 1DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "0 0 9px 0",
                letterSpacing: "0.1em",
                // textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Flooring
            </span>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                // border: "0.5px solid lightgray",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: "40%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  //   border: border ? border : "",
                }}
              ></div>
            </div>
          </div>
          <div style={{ margin: "1rem 0 1rem 0" }}>
            <span
              style={{
                color: "#a3afbc",
                display: "block",
                font: "11px/1 1DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "0 0 9px 0",
                letterSpacing: "0.1em",
                // textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Windows
            </span>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                // border: "0.5px solid lightgray",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: "30%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  //   border: border ? border : "",
                }}
              ></div>
            </div>
          </div>
          <div style={{ margin: "1rem 0 1rem 0" }}>
            <span
              style={{
                color: "#a3afbc",
                display: "block",
                font: "11px/1 1DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "0 0 9px 0",
                letterSpacing: "0.1em",
                // textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Basement
            </span>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                // border: "0.5px solid lightgray",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: "90%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  //   border: border ? border : "",
                }}
              ></div>
            </div>
          </div>
          <div style={{ margin: "1rem 0 1rem 0" }}>
            <span
              style={{
                color: "#a3afbc",
                display: "block",
                font: "11px/1 1DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "0 0 9px 0",
                letterSpacing: "0.1em",
                // textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Plumbing
            </span>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                // border: "0.5px solid lightgray",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: "85%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  //   border: border ? border : "",
                }}
              ></div>
            </div>
          </div>
          <div style={{ margin: "1rem 0 1rem 0" }}>
            <span
              style={{
                color: "#a3afbc",
                display: "block",
                font: "11px/1 1DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "0 0 9px 0",
                letterSpacing: "0.1em",
                // textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Fittings
            </span>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                // border: "0.5px solid lightgray",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: "50%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  //   border: border ? border : "",
                }}
              ></div>
            </div>
          </div>
          <div style={{ margin: "1rem 0 1rem 0" }}>
            <span
              style={{
                color: "#a3afbc",
                display: "block",
                font: "11px/1 1DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "0 0 9px 0",
                letterSpacing: "0.1em",
                // textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Piping
            </span>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                // border: "0.5px solid lightgray",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: `80%`,
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  //   border: border ? border : "",
                }}
              ></div>
            </div>
          </div>
          <div style={{ margin: "1rem 0 1rem 0" }}>
            <span
              style={{
                color: "#a3afbc",
                display: "block",
                font: "11px/1 1DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "0 0 9px 0",
                letterSpacing: "0.1em",
                // textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Ceiling
            </span>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                // border: "0.5px solid lightgray",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: "70%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  //   border: border ? border : "",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 2,
          backgroundColor: "#1d242e",
          height: "100%",
          justifyContent: "center",
          flexDirection: "column",
          paddingTop: "3rem",
          //   padding: "0 4rem",
        }}
      >
        <div
          className="hoverDisplay"
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "row",
            // backgroundColor: "#212935",
            marginLeft: "2rem",
            position: "absolute",
            // boxShadow: "1px 2px 12px rgb(0 0 0 / 32%)",
            borderRadius: "4px",
            transition: "all 0s ease-in-out",
            top: "32%",

            // alignItems: "center",
          }}
          // onMouseOver={() => setHover1(true)}
          // onMouseOut={() => setHover1(false)}
        >
          <span
            style={{
              //   padding: "0 5rem 0 0",
              padding: "1rem 5rem 1rem 2rem",

              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              //   padding: "1rem 0.5rem 0 2rem",
              //   backgroundColor: "#212935",
              //   marginLeft: "2rem",
            }}
          >
            <span
              style={{
                color: "#788b94",
                //   display: "inline-block",
                font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",

                textTransform: "uppercase",
              }}
            >
              COST
            </span>
            <div
              style={{
                color: "#c3d7ef",
                display: "block",
                font: "500 21px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
                letterSpacing: "-0.05em",

                position: "relative",
                fontWeight: "bold",
                fontSize: "28px",
              }}
            >
              4343{" "}
              <span
                style={{
                  display: "inline-block",
                  font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
                  margin: "8px 0 0 0",
                  textTransform: "uppercase",
                }}
              >
                m
              </span>
            </div>
          </span>
          <span
            style={{
              //   display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#6d7f8a",
              padding: "1rem 3rem",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              font: '500 12px/1.3 "DINWeb","Lucida Grande",verdana,sans-serif',
              margin: "1.5rem 1rem",
            }}
            className="hideDisplayBar"
          >
            <span>Last Computed</span>
            <span>6 hours ago</span>
          </span>
          <span
            className="hideDisplayBar"
            style={{
              //   display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: "#d60d0d",
              color: "#fff",
              padding: "0.5rem 2rem",
              //   height: "100%",
              //   flex: 1,
              //   padding: "0 8px",
              //   verticalAlign: "middle",
            }}
          >
            <span
              style={{
                font: '500 21px/1.1 "DINWeb","Lucida Grande",verdana,sans-serif',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.4rem",
                marginLeft: "-0.8rem",
              }}
            >
              <ArrowDropDownIcon /> 6
            </span>
            <span
              style={{
                font: '600 10px/1 "DINWeb","Lucida Grande",verdana,sans-serif',
                color: "rgba(255,255,255,0.65)",
              }}
            >
              In 147
            </span>
            <span
              style={{
                font: '600 10px/1 "DINWeb","Lucida Grande",verdana,sans-serif',
                color: "rgba(255,255,255,0.65)",
              }}
            >
              days
            </span>
          </span>
          {/* <span> */}
          <div className="hideDisplayBar" style={{ backgroundColor: "#fff" }}>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                height: "100%",
                width: "100%",
                padding: "0 0.2rem",
              }}
            >
              {progressData?.map((item: any, i: number) => (
                <div
                  style={{
                    height: "100%",
                    background:
                      "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    // border: "0.5px solid lightgray",
                    borderRadius: "4px",
                    marginRight: "0.1rem",
                  }}
                >
                  <div
                    style={{
                      width: "3px",
                      height: item,
                      // background:
                      //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                      backgroundColor: "lightgray",

                      //   border: border ? border : "",
                    }}
                  ></div>
                </div>
              ))}

              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "70%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "30%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "80%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "60%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "50%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "row",
            // backgroundColor: "#212935",
            marginLeft: "2rem",
            position: "absolute",
            // boxShadow: "1px 2px 12px rgb(0 0 0 / 32%)",
            borderRadius: "4px",
            transition: "all 0s ease-in-out",
            top: "43%",
            // alignItems: "center",
          }}
          className="hoverDisplay1"
        >
          <span
            style={{
              //   padding: "0 5rem 0 0",
              padding: "1rem 5rem 1rem 2rem",
              //   display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              //   padding: "1rem 0.5rem 0 2rem",
              //   backgroundColor: "#212935",
              //   marginLeft: "2rem",
            }}
          >
            <span
              style={{
                color: "#788b94",
                //   display: "inline-block",
                font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",

                textTransform: "uppercase",
              }}
            >
              PROGRESS
            </span>
            <div
              style={{
                color: "#c3d7ef",
                display: "block",
                font: "500 21px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
                letterSpacing: "-0.05em",

                position: "relative",
                fontWeight: "bold",
                fontSize: "28px",
              }}
            >
              154.4{" "}
              <span
                style={{
                  display: "inline-block",
                  font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
                  margin: "8px 0 0 0",
                  textTransform: "uppercase",
                }}
              >
                hrs
              </span>
            </div>
          </span>
          <span
            style={{
              //   display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#6d7f8a",
              padding: "1rem 3rem",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              font: '500 12px/1.3 "DINWeb","Lucida Grande",verdana,sans-serif',
              margin: "1.5rem 1rem",
            }}
            className="hideDisplayBar1"
          >
            <span>Last Computed</span>
            <span>1 hour ago</span>
          </span>
          <span
            style={{
              //   display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: "#3fb211",
              color: "#fff",
              padding: "0.5rem 2rem",
              //   height: "100%",
              //   flex: 1,
              //   padding: "0 8px",
              //   verticalAlign: "middle",
            }}
            className="hideDisplayBar1"
          >
            <span
              style={{
                font: '500 21px/1.1 "DINWeb","Lucida Grande",verdana,sans-serif',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.4rem",
                marginLeft: "-0.8rem",
              }}
            >
              <ArrowDropUpIcon /> 0.35
            </span>
            <span
              style={{
                font: '600 10px/1 "DINWeb","Lucida Grande",verdana,sans-serif',
                color: "rgba(255,255,255,0.65)",
              }}
            >
              In 5
            </span>
            <span
              style={{
                font: '600 10px/1 "DINWeb","Lucida Grande",verdana,sans-serif',
                color: "rgba(255,255,255,0.65)",
              }}
            >
              hours
            </span>
          </span>
          {/* <span> */}
          <div style={{ backgroundColor: "#fff" }} className="hideDisplayBar1">
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                height: "100%",
                width: "100%",
                padding: "0 0.2rem",
                transition: "all 1s ease-in-out",
              }}
            >
              {progressData?.map((item: any, i: number) => (
                <div
                  style={{
                    height: "100%",
                    background:
                      "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    // border: "0.5px solid lightgray",
                    borderRadius: "4px",
                    marginRight: "0.1rem",
                    transition: "all 1s ease-in-out",
                  }}
                >
                  <div
                    style={{
                      width: "3px",
                      height: item,
                      // background:
                      //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                      backgroundColor: "lightgray",

                      //   border: border ? border : "",
                    }}
                  ></div>
                </div>
              ))}

              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "70%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "30%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "80%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "60%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
              <div
                style={{
                  height: "100%",
                  background: "-webkit-linear-gradient(left, #005f79, #00bff3)",
                  // border: "0.5px solid lightgray",
                  borderRadius: "4px",
                  marginRight: "0.1rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "50%",
                    // background:
                    //   "-webkit-linear-gradient(left, #005f79, #00bff3)",
                    backgroundColor: "lightgray",

                    //   border: border ? border : "",
                  }}
                ></div>
              </div>
            </div>
          </div>
          {/* <div className="graph">
            <div className="items">
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/20</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "72.76%;" }}>
                  <span className="date">11/19</span>
                  <span className="value">154.10</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/18</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/17</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "76.16%" }}>
                  <span className="date">11/16</span>
                  <span className="value">154.52</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/15</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "71.04%" }}>
                  <span className="date">11/14</span>
                  <span className="value">153.88</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/13</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "60.0%" }}>
                  <span className="date">11/12</span>
                  <span className="value">152.50</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/11</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "53.6%" }}>
                  <span className="date">11/10</span>
                  <span className="value">151.70</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "66.04%" }}>
                  <span className="date">11/9</span>
                  <span className="value">153.26</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "67.84%" }}>
                  <span className="date">11/8</span>
                  <span className="value">153.48</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/7</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "41.76%" }}>
                  <span className="date">11/6</span>
                  <span className="value">150.22</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "48.8%" }}>
                  <span className="date">11/5</span>
                  <span className="value">151.10</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "50.08%" }}>
                  <span className="date">11/4</span>
                  <span className="value">151.26</span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "0%" }}>
                  <span className="date">11/3</span>
                  <span className="value"></span>
                </span>
              </div>
              <div className="item">
                <span className="fill" style={{ height: "67.6266666667%" }}>
                  <span className="date">11/2</span>
                  <span className="value">153.45</span>
                </span>
              </div>

              <div className="legend">
                <span className="max">158</span>
                <span className="med">151</span>
                <span className="min">145</span>
              </div>
            </div>
          </div> */}
          {/* </span> */}
        </div>
        {/* <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            padding: "0.5rem 4rem",
          }}
        >
          <span
            style={{
              color: "#788b94",
              display: "inline-block",
              font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
              margin: "8px 0 0 0",
              textTransform: "uppercase",
            }}
          >
            PROGRESS
          </span>
          <div
            style={{
              color: "#c3d7ef",
              display: "block",
              font: "500 21px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
              letterSpacing: "-0.05em",
              margin: "0 0 8px 0",
              position: "relative",
              fontWeight: "bold",
              fontSize: "28px",
            }}
          >
            154.4{" "}
            <span
              style={{
                display: "inline-block",
                font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "8px 0 0 0",
                textTransform: "uppercase",
              }}
            >
              hrs
            </span>
          </div>
        </div> */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            padding: "0.5rem 4rem",
            position: "absolute",
            borderRadius: "4px",
            transition: "all 180ms ease-out",
            top: "53.5%",
          }}
        >
          <span
            style={{
              color: "#788b94",
              display: "inline-block",
              font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
              margin: "8px 0 0 0",
              textTransform: "uppercase",
            }}
          >
            EFFICIENCY
          </span>
          <div
            style={{
              color: "#c3d7ef",
              display: "block",
              font: "500 21px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
              letterSpacing: "-0.05em",
              margin: "0 0 8px 0",
              position: "relative",
              fontWeight: "bold",
              fontSize: "28px",
            }}
          >
            70.7{" "}
            <span
              style={{
                display: "inline-block",
                font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "8px 0 0 0",
                textTransform: "uppercase",
              }}
            >
              %
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            padding: "0.5rem 4rem",
            position: "absolute",
            borderRadius: "4px",
            transition: "all 180ms ease-out",
            top: "63%",
          }}
        >
          <span
            style={{
              color: "#788b94",
              display: "inline-block",
              font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
              margin: "8px 0 0 0",
              textTransform: "uppercase",
            }}
          >
            CARBON
          </span>
          <div
            style={{
              color: "#c3d7ef",
              display: "block",
              font: "500 21px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
              letterSpacing: "-0.05em",
              margin: "0 0 8px 0",
              position: "relative",
              fontWeight: "bold",
              fontSize: "28px",
            }}
          >
            24{" "}
            <span
              style={{
                display: "inline-block",
                font: "500 12px/1.4 'DINWeb','Lucida Grande',verdana,sans-serif",
                margin: "8px 0 0 0",
                textTransform: "uppercase",
              }}
            >
              .641753486
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flex: 7.6 }}></div>
    </div>
  );
};

export default SideBar;

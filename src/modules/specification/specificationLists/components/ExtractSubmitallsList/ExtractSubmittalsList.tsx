import React, { ReactElement, useContext, useState, useEffect } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import WarningIcon from "@material-ui/icons/Warning";
import { postApi } from "../../../../../services/api";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { defaultCategory } from "../../../utils/SpecificationConstants";
import { Select, MenuItem } from "@material-ui/core";
import { PUBLISH_SUBMITTAL_INFO_REVIEWED } from "../../graphql/queries/specification";
import { client } from "src/services/graphql";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import "./SpecificationSection.scss";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import { setSectionPageNum } from "../../context/SpecificationLibDetailsAction";
import InfiniteScroll from "react-infinite-scroll-component";

const divisionsLists = [];

export default function ExtractSubmittals(props: any): ReactElement {
  const [totalSectionsData, setTotalSectionsData]: any = useState<Array<any>>(
    []
  );

  const [sectionsData, setSectionsData]: any = useState<Array<any>>([]);
  const { dispatch, state }: any = useContext(stateContext);
  const [submittalTypes, setSubmittalTypes] = useState<Array<any>>([]);
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const [viewed, setViewed] = useState<Array<any>>([]);
  const [radioValue, setRadioValue] = useState("show-all");
  const [disablePublish, setDisablePublish] = useState(false);
  const [accordionToExpand, setAccordionToExpand]: any = useState(null);
  const [submittalsInfinite, setSubmittalsInfinite] = useState<Array<any>>([]);

  useEffect(() => {
    if (props?.submittalInfoReviewed?.submittals?.length > 0) {
      const tempSubmittals = props.submittalInfoReviewed.submittals;
      const tempInfinite: any = [];
      // push 20 items for maintaing scrollable infinite list
      for (let i = 0; i < props.submittalInfoReviewed.submittals.length; i++) {
        if (i < 20) {
          tempInfinite.push(props.submittalInfoReviewed.submittals[i]);
        }
      }
      setSectionsData(tempInfinite);
      setTotalSectionsData(props?.submittalInfoReviewed?.submittals);
      setSubmittalTypes(props?.submittalInfoReviewed?.submittalTypes);
    }
  }, [props.submittalInfoReviewed?.submittals?.length]);

  const handleSelectSubmittalType = (item: any, type: any, index: number) => {
    const tempSectionsTotal: any = [...totalSectionsData];
    for (let i = 0; i < tempSectionsTotal.length; i++) {
      if (tempSectionsTotal[i].uniqueId === item.uniqueId) {
        tempSectionsTotal.splice(i, 1, {
          ...tempSectionsTotal[i],
          submittal_type: type.nodeName,
          review:
            tempSectionsTotal[i].submittal_type == "" ||
            tempSectionsTotal[i].line_text == ""
              ? true
              : false,
        });
      }
    }

    const tempSections: any = [...sectionsData];

    for (let i = 0; i < tempSections.length; i++) {
      if (tempSections[i].uniqueId === item.uniqueId) {
        tempSections.splice(i, 1, {
          ...tempSections[i],
          submittal_type: type.nodeName,
          review:
            tempSections[i].submittal_type == "" ||
            tempSections[i].line_text == ""
              ? true
              : false,
        });
      }
    }
    setSectionsData(tempSections);
    setTotalSectionsData(tempSectionsTotal);
    const dataToPublish = sortFunction(tempSectionsTotal);
    props.publish(dataToPublish);
  };

  const handleRemoveSubmittal = (data: any) => {
    const tempSections = [...sectionsData];

    const tempTotalData = [...totalSectionsData];

    for (let i = 0; i < tempSections.length; i++) {
      if (tempSections[i].uniqueId == data.uniqueId) {
        tempSections.splice(i, 1, {
          ...tempSections[i],
          notASubmittal: tempSections[i]?.notASubmittal ? false : true,
          review: tempSections[i].review ? false : true,
        });
      }
    }
    for (let i = 0; i < tempTotalData.length; i++) {
      if (tempTotalData[i].uniqueId == data.uniqueId) {
        tempTotalData.splice(i, 1, {
          ...tempTotalData[i],
          notASubmittal: tempTotalData[i].notASubmittal ? false : true,
          review: tempTotalData[i].review ? false : true,
        });
      }
    }
    setTotalSectionsData(tempTotalData);
    setSectionsData(tempSections);

    const dataToPublish = sortFunction(tempTotalData);
    props.publish(dataToPublish);
  };

  const handleViewed = (data: any, index: number) => {
    SpecificationLibDetailsDispatch(setSectionPageNum(data.page));
    const tempViewed = [...viewed];
    if (tempViewed.indexOf(data.uniqueId) === -1) {
      tempViewed.push(data.uniqueId);
      setViewed(tempViewed);
    }
    const tempData = [...sectionsData];
    for (let i = 0; i < tempData.length; i++) {
      if (tempData[i].uniqueId === data.uniqueId) {
        tempData.splice(i, 1, {
          ...tempData[i],
          viewed: true,
          review:
            (tempData[i].submittal_type == "Others" ||
              tempData[i].submittal_type == "" ||
              tempData[i].line_text == "") &&
            !tempData[i].notASubmittal
              ? true
              : false,
        });
      }
    }
    const tempTotalData = [...totalSectionsData];
    for (let i = 0; i < tempTotalData.length; i++) {
      if (tempTotalData[i].uniqueId === data.uniqueId) {
        tempTotalData.splice(i, 1, {
          ...tempTotalData[i],
          viewed: true,
          review:
            (tempTotalData[i].submittal_type == "Others" ||
              tempTotalData[i].submittal_type == "" ||
              tempTotalData[i].line_text == "") &&
            !tempTotalData[i].notASubmittal
              ? true
              : false,
        });
      }
    }
    setTotalSectionsData(tempTotalData);
    setSectionsData(tempData);

    if (accordionToExpand === data.uniqueId) {
      setAccordionToExpand(null);
    } else {
      setAccordionToExpand(data.uniqueId);
    }
  };

  const handleRadio = (value: string) => {
    setRadioValue(value);
  };

  function sortFunction(data: any) {
    data.sort(function (a: any, b: any) {
      return a.uniqueId - b.uniqueId;
    });
    return data;
  }

  useEffect(() => {
    let tempData: any = [];
    if (radioValue == "not-viewed") {
      const tempNotViewed: any = [];
      const tempViewed: any = [];

      for (let i = 0; i < sectionsData.length; i++) {
        if (!sectionsData[i].viewed) {
          tempNotViewed.push(sectionsData[i]);
        } else {
          tempViewed.push(sectionsData[i]);
        }
      }
      tempData = tempNotViewed.concat(tempViewed);
      setSectionsData(tempData);
    }
    if (radioValue == "show-all") {
      tempData = sortFunction(totalSectionsData);
      const newIssuesInfiniteData: any = [];
      for (let i = 0; i < tempData.length; i++) {
        if (i < 20) {
          newIssuesInfiniteData.push(tempData[i]);
        }
      }
      setTotalSectionsData(tempData);
      setSectionsData(newIssuesInfiniteData);
    }
    if (radioValue === "issues") {
      const tempIssues: any = [];
      const tempNonIssues: any = [];
      // .division_name == "" || totalSectionsData[i].submittal_type == "" || totalSectionsData[i].section_number === ""
      for (let i = 0; i < totalSectionsData.length; i++) {
        if (totalSectionsData[i].review == true) {
          tempIssues.push(totalSectionsData[i]);
        } else {
          tempNonIssues.push(totalSectionsData[i]);
        }
      }
      tempData = tempIssues.concat(tempNonIssues);
      // reset infinite Scroll
      const newIssuesInfiniteData: any = [];
      for (let i = 0; i < tempData.length; i++) {
        if (i < 20) {
          newIssuesInfiniteData.push(tempData[i]);
        }
      }
      setTotalSectionsData(tempData);
      setSectionsData(newIssuesInfiniteData);
    }
  }, [radioValue.length]);

  const fetchData = () => {
    // for every scroll add 20 more items
    const tempInfinite: any = [...sectionsData];
    const infiniteCurrentLength = tempInfinite.length;

    for (let i = 0; i < totalSectionsData.length; i++) {
      if (i > infiniteCurrentLength - 1 && i < infiniteCurrentLength + 20) {
        tempInfinite.push(totalSectionsData[i]);
      }
    }
    setSectionsData(tempInfinite);
  };

  const handleDescriptionChange = (event: any, item: any, index: number) => {
    const totalTempData: any = [...totalSectionsData];
    const tempSectionsData: any = [...sectionsData];
    // add the changing text to sectionsData for rendering  in ui
    const text = event.target.value;
    tempSectionsData[index] = {
      ...tempSectionsData[index],
      line_text: text,
    };

    // add the changing text to total sectionsData for updating the original array with new text/description

    for (let i = 0; i < totalTempData.length; i++) {
      if (item.uniqueId == totalTempData[i].uniqueId) {
        totalTempData.splice(i, 1, {
          ...tempSectionsData[index],
        });
      }
    }

    setTotalSectionsData(totalTempData);
    setSectionsData(tempSectionsData);
  };

  return (
    <div className="sections">
      <div className="sections__sort">
        <InputLabel required={false}>Sort by </InputLabel>
        <div className="sections__sort__radio-grouping">
          <RadioGroup
            aria-label="sort-filter"
            name="catefories"
            value={radioValue}
          >
            <FormControlLabel
              value="show-all"
              control={
                <Radio
                  onClick={() => handleRadio("show-all")}
                  color={"primary"}
                />
              }
              label="Show All"
            />
            <FormControlLabel
              value="not-viewed"
              control={
                <Radio
                  onClick={() => handleRadio("not-viewed")}
                  color={"primary"}
                />
              }
              label="Not Viewed"
            />
            <FormControlLabel
              value="issues"
              control={
                <Radio
                  onClick={() => handleRadio("issues")}
                  color={"primary"}
                />
              }
              label="Issues"
            />
          </RadioGroup>
        </div>
      </div>
      <div id="scrollable_list" className="sections__lists">
        <InfiniteScroll
          dataLength={sectionsData.length} //This is important field to render the next data
          next={() => fetchData()}
          hasMore={true}
          loader={sectionsData.length === totalSectionsData.length ? "" : <h4>Loading...</h4>}
          scrollableTarget="scrollable_list"
        >
          {sectionsData?.map((item: any, index: number) => (
            <div
              key={`${index}${item.uniqueId}a`}
              className="sections__lists__item"
            >
              <Accordion
                TransitionProps={{ unmountOnExit: true }}
                expanded={item.uniqueId == accordionToExpand ? true : false}
                className="sections__accordion"
              >
                <AccordionSummary
                  onClick={() => handleViewed(item, index)}
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel-header"
                  id={`panel-header-${index}`}
                >
                  {/* <Typography className={classes.heading}> */}
                  <div className="sections__lists__item__name">
                    <div>
                      {" "}
                      <span className="sections__lists__item__index">
                        {index + 1}. &nbsp;
                      </span>{" "}
                      {/* <Tooltip title={`${item?.section_name}`} aria-label="delete category"> */}
                      <label>
                        {item?.section_name && item?.section_name.length > 35
                          ? `${item?.section_number} ${item?.section_name.slice(
                              0,
                              32
                            )} . . .`
                          : `${item?.section_number} ${item?.section_name}`}
                      </label>
                      {/* </Tooltip> */}
                    </div>
                    <div className="sections__lists__item__name__action">
                      <>
                        {
                          //  item.division_name == "" || item.submittal_type == "" || item.section_number === ""
                          item.review && (
                            <Tooltip
                              title={"Invalid"}
                              aria-label="delete division"
                            >
                              <label>
                                <WarningIcon className="error" />
                              </label>
                            </Tooltip>
                          )
                        }
                      </>
                    </div>
                    <div className="sections__lists__item__name__action">
                      <>
                        {item?.viewed && (
                          <Tooltip
                            title={"Viewed"}
                            aria-label="delete division"
                          >
                            <label>Viewed</label>
                          </Tooltip>
                        )}
                      </>
                    </div>
                  </div>
                  {/* </Typography> */}
                </AccordionSummary>
                <AccordionDetails>
                  <div className="sections__lists__item__details">
                    <form className="sections__lists__item__details__form">
                      <div className="sections__lists__item__details__form__field">
                        <InputLabel>Type</InputLabel>
                        {accordionToExpand === item.uniqueId && (
                          <div>
                            <Select
                              // defaultValue=""
                              variant="outlined"
                              MenuProps={{
                                anchorOrigin: {
                                  vertical: "bottom",
                                  horizontal: "left",
                                },
                                transformOrigin: {
                                  vertical: "top",
                                  horizontal: "left",
                                },
                                getContentAnchorEl: null,
                              }}
                              // id="custom-dropdown"
                              fullWidth
                              // input={<Input id="select-multiple-chip" />}
                              value={item.submittal_type || ""}
                            >
                              {props.submittalTypes.length !== 0 &&
                                props.submittalTypes.map(
                                  (type: any, i: number) => (
                                    <MenuItem
                                      onClick={() =>
                                        handleSelectSubmittalType(
                                          item,
                                          type,
                                          index
                                        )
                                      }
                                      key={i}
                                      value={type.nodeName}
                                    >
                                      {type?.nodeName}
                                    </MenuItem>
                                  )
                                )}
                            </Select>

                            {/* <div className="sections__lists__item__details__form__field__error-wrap">
                                     {
                                      item.section_number && item.isInvalidSpecNo && (
                                         <p className="sections__lists__item__details__form__field__error-wrap__message">
                                             Section No already exists in other section
                                         </p>
                                       )
                                     }
                             </div> */}
                          </div>
                        )}
                      </div>

                      <div className="sections__lists__item__details__form__field">
                        <InputLabel>Description </InputLabel>
                        <div className="sections__lists__item__details__form__field__input-field">
                          <TextField
                            type="text"
                            fullWidth
                            autoComplete="search"
                            placeholder="Enter set title"
                            variant="outlined"
                            multiline
                            value={item.line_text}
                            onChange={(e) =>
                              handleDescriptionChange(e, item, index)
                            }
                            // onChange={(e) => handleChangeSectionName(e, index)}
                          />
                          {/* <div className="sections__lists__item__details__form__field__error-wrap">
                                 {
                                      item.section_name && item.isInvalidsection_name && (
                                         <p className="sections__lists__item__details__form__field__error-wrap__message">
                                             Drawing Name already exists in other sheet
                                         </p>
                                       )
                                     }
                             </div> */}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flex: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          // type="submit"
                          data-testid={"submit-version-review"}
                          variant="outlined"
                          className="btn-primary"
                          onClick={() => handleRemoveSubmittal(item)}

                          // disabled={isDisableCreateBtn || companyDetailsState.companyValidation ||
                          // companyDetailsState.companyIDValidation}
                          // onClick={() => handleNotSpecificationBtn(index, false)}
                        >
                          {!item?.notASubmittal
                            ? `Remove submittal`
                            : `This is a submittal`}
                        </Button>
                      </div>
                    </form>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}

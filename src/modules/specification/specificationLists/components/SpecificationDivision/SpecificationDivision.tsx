import React, { ReactElement, useContext, useEffect, useState } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Popover from "@material-ui/core/Popover";
import "./SpecificationDivision.scss";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import Tooltip from "@material-ui/core/Tooltip";
import WarningIcon from "@material-ui/icons/Warning";
import {
  setSpecificationSectionsDetails,
  setIsAutoUpdate,
  setSpecificationDivisionsDetails,
  setDivisionsTabStatus,
  setSectionsTabStatus,
  setSectionPageNum,
} from "../../context/SpecificationLibDetailsAction";
import { postApi } from "../../../../../services/api";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { defaultCategory } from "../../../utils/SpecificationConstants";

// const categories: any = [];
export default function SpecificationSections(): ReactElement {
  const [filterValue, setFilterValue] = useState("show-all");
  const [divisionsData, setDivisionsData] = useState<Array<any>>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [newDivisionName, setNewDivisionName] = useState("");
  const [newDivisionNumber, setNewDivisionNumber] = useState("");
  const [updateDivisionData, setUpdateDivisionData] = useState<any>({});
  //const [divisionsArray, setDivisionsArray] = useState<Array<any>>([]);
  const [trimDivisionName, setTrimDivisionName] = useState("");
  const [trimDivisionNumber, setTrimDivisionNumber] = useState("");
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const [expandedPanel, setExpandedPanel] = React.useState<string | false>(
    false
  );
  const [expandableHover, setExpandableHover] = useState<string | false>(false);

  useEffect(() => {
    if (
      SpecificationLibDetailsState?.specificationDivisionDetails &&
      SpecificationLibDetailsState?.specificationDivisionDetails?.length > 0
    ) {
      const filteredData =
        SpecificationLibDetailsState?.specificationDivisionDetails?.filter(
          (item: any) =>
            item.division_number !== "99" &&
            item.division_name !== "Not a specification"
        );
      const list: any = [];
      filteredData.forEach((division: any, index: number) => {
        if (!division.division_name || !division.division_number) {
          division.review = true;
        } else {
          division.review = false;
        }

        division.id = index + 1;
        list.push({ ...division });
      });
      // list.push('NOT A SPECIFICATION')
      if (filterValue === "show-all") {
        const divisionsList = [...list];
        // const sortDivisionsList = divisionsList?.sort((a: any, b: any) => (a.division_number > b.division_number) ? 1 : ((b.division_number > a.division_number) ? -1 : 0))
        // console.log(list,'list')
        divisionDisplay(list);
        setDivisionsData(list);
      } else {
        setDivisionsData(list);
      }
      // validateSectionsDivision();
    }
  }, [SpecificationLibDetailsState?.specificationDivisionDetails]);

  //  useEffect(() => {
  //     if(SpecificationLibDetailsState?.specificationDivisionDetails?.length > 0 ){
  //         filterdivisionsLists(SpecificationLibDetailsState?.specificationDivisionDetails)
  //         validateSectionsDivision();
  //     }
  // }, [SpecificationLibDetailsState?.specificationDivisionDetails])

  // validate if user update the division lists
  // const validateSectionsDivision = () => {
  //     if(SpecificationLibDetailsState?.specificationSectionsDetails?.length > 0){
  //         const sectionsArray = [...SpecificationLibDetailsState?.specificationSectionsDetails]
  //        // const divisionArray = [...SpecificationLibDetailsState?.specificationDivisionDetails]
  //         if(sectionsArray.length > 0){
  //             sectionsArray.forEach((item: any) => {
  //                // const count = divisionArray.filter((list: any) => list.section_desc === item.division )
  //                 if(!item.section_desc || !item.section_name){
  //                     item.review = true
  //                 }else{
  //                     item.review = false
  //                 }
  //             });
  //         }

  //         //sort the sections based on pagenum
  //         if(filterValue === 'show-all'){
  //             const sectionsList = [...sectionsArray];
  //             const sortSectionsList = sectionsList?.sort((a: any, b: any) => (a.start_pages > b.start_pages) ? 1 : ((b.start_pages > a.start_pages) ? -1 : 0))
  //             uniqueSectionValue(sortSectionsList);
  //         }else{
  //             uniqueSectionValue(sectionsArray);
  //         }
  //     }
  // }

  //     const filterdivisionsLists = (data: any) => {
  //         // const res = data.filter((item: any) => item.status === 'viewed');
  //         const res = data;
  //        console.log(data,'data')
  //        console.log(res,'res')
  //         const sortCategory = res?.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
  //         console.log(sortCategory,'sortCategory')
  // //         const division = divisionDetails.filter((item: any)=>{
  // // item.division === sortCategory.division
  // //         })
  // //         console.log(division,'division')
  //         setdivisionsLists(sortCategory)
  //     }

  // const handleSortingChange = (event: any) => {
  //     setFilterValue(event.target.value);
  //     if(event.target.value === 'show-all'){
  //         const divisionsList = [...divisionsData];
  //         console.log(divisionsData,'divisionsData')
  //         // const sortDivisionsList = divisionsList?.sort((a: any, b: any) => (a.start_pages > b.start_pages) ? 1 : ((b.start_pages > a.start_pages) ? -1 : 0))
  //         setDivisionsData(divisionsList);
  //     }
  //     if(event.target.value === 'not-viewed'){
  //         const divisionsList = [...divisionsData];

  //         // const filter1 = divisionsList.filter((item: any) => item.status !== 'viewed');
  //         // const sortFilter1 = filter1?.sort((a: any, b: any) => (a.start_pages > b.start_pages) ? 1 : ((b.start_pages > a.start_pages) ? -1 : 0))
  //         // const filter2 = divisionsList.filter((item: any) => item.status === 'viewed');
  //         // const sortFilter2 = filter2?.sort((a: any, b: any) => (a.start_pages > b.start_pages) ? 1 : ((b.start_pages > a.start_pages) ? -1 : 0))

  //         // const res = [...sortFilter1, ...sortFilter2];
  //         setDivisionsData(divisionsList);
  //     }
  //     if(event.target.value === 'issues'){
  //         const divisionsList = [...divisionsData];

  //         // const filter1 = divisionsList.filter((item: any) => item.review || item.isInvalidDivNo);
  //         // const sortFilter1 = filter1?.sort((a: any, b: any) => (a.start_pages > b.start_pages) ? 1 : ((b.start_pages > a.pagenum) ? -1 : 0))

  //         // const filter2 = divisionsList.filter((item: any) => !item.review && !item.isInvalidDivNo);
  //         // const sortFilter2 = filter2?.sort((a: any, b: any) => (a.start_pages > b.start_pages) ? 1 : ((b.start_pages > a.start_pages) ? -1 : 0))

  //         // const res = [...sortFilter1, ...sortFilter2];
  //         setDivisionsData(divisionsList);
  //     }
  // }
  const divisionDisplay = (data: any) => {
    const removeEmptyData = data.filter(
      (category: any) => category.division_name.trim() !== ""
    );
    const defaultDivisionList = removeEmptyData.filter(
      (category: any) => category.division_name.trim() === "NOT A SPECIFICATION"
    );
    const nonDefaultDivisionList = removeEmptyData.filter(
      (category: any) => category.division_name.trim() !== "NOT A SPECIFICATION"
    );
    setDivisionsData([...nonDefaultDivisionList, ...defaultDivisionList]);
  };

  const handlePopOver = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  //close popover
  const handleClose = () => {
    setNewDivisionName("");
    setNewDivisionNumber("");
    setTrimDivisionName("");
    setTrimDivisionNumber("");
    setAnchorEl(null);
  };
  const handleChangeDivisionNo = (e: any, argIndex: number) => {
    setUpdateDivisionData({
      ...updateDivisionData,
      division_number: e.target.value,
    });
  };

  const handleChangeDivisionName = (e: any, argIndex: number) => {
    setUpdateDivisionData({
      ...updateDivisionData,
      division_name: e.target.value,
    });
  };

  // const handleChangeSpecificationDivision = (e: any, argIndex: number) => {
  //     sectionsData[argIndex].division = e.target.value;
  //     setsectionsData([...sectionsData]);
  //     updateSectionsDetails()
  // }

  //onblur update save the data to context
  const updateValue = (argIndex: number) => {
    let divisionArray: any;
    const oldDivisionName = divisionsData[argIndex].division_name;
    const oldDivisionNumber = divisionsData[argIndex].division_number;
    divisionsData[argIndex].division_name = updateDivisionData.division_name;
    divisionsData[argIndex].division_number =
      updateDivisionData.division_number;
    setDivisionsData([...divisionsData]);
    if (
      SpecificationLibDetailsState?.specificationSectionsDetails?.length > 0
    ) {
      divisionArray = [
        ...SpecificationLibDetailsState.specificationSectionsDetails,
      ];
    }
    divisionArray.map((section: any) => {
      if (
        section.division_name_for_section === oldDivisionName &&
        section.division_number_for_section === oldDivisionNumber
      ) {
        section.division_name_for_section = updateDivisionData.division_name;
        section.division_number_for_section =
          updateDivisionData.division_number;
      }
    });
    SpecificationLibDetailsDispatch(
      setSpecificationSectionsDetails(divisionArray)
    );
    updateDivisionsDetails();
  };

  const handleViewed = (
    e: any,
    expanded: boolean,
    index: number,
    division: any
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (expanded) {
      setExpandedPanel(division?.id);
      setUpdateDivisionData(division);
      if (division.status !== "viewed") {
        const divisionsList = [...divisionsData];
        divisionsList[index].status = "viewed";
        setDivisionsData(divisionsList);
        updateDivisionsDetails();
      }
      if (division?.start_pages !== -999) {
        SpecificationLibDetailsDispatch(
          setSectionPageNum(division.start_pages)
        );
      } else {
        SpecificationLibDetailsDispatch(
          setSectionPageNum(division.division_number)
        );
      }
      // avoid extra API call
      //    if(SpecificationLibDetailsState?.parsedFileUrl?.s3Key !== section.pdfs3key){
      //         fetchSectionUrl(section);
      //    }
    } else {
      setExpandedPanel(false);
    }
  };

  const fetchSectionUrl = (file: any) => {
    const payload = [
      {
        // fileName: `${file.pagenum}.pdf`,
        // key: file.pdfs3key,
        // expiresIn: 1000,
        // processed: true
      },
    ];

    getSectionUrl(payload);
  };

  const getSectionUrl = async (payload: any) => {
    try {
      // dispatch(setIsLoading(true));
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      if (fileUploadResponse.success) {
        const fileData = {
          s3Key: payload[0].key,
          url: fileUploadResponse.success[0].url,
        };
        //SpecificationLibDetailsDispatch(setParsedFileUrl(fileData));
      }
      // dispatch(setIsLoading(false));
    } catch (error) {
      Notification.sendNotification(error, AlertTypes.warn);
      // dispatch(setIsLoading(false));
    }
  };

  const handleNotDivisionBtn = (argIndex: number, isNotADivision: boolean) => {
    const divisionList = [...divisionsData];
    // sheetList.splice(argIndex, 1);
    if (isNotADivision) {
      divisionList[argIndex].division_name = "";
      divisionList[argIndex].division_number = "-999";
    } else {
      divisionList[argIndex].division_name = "";
    }
    setDivisionsData(divisionList);
    SpecificationLibDetailsDispatch(
      setSpecificationDivisionsDetails(divisionList)
    );
    SpecificationLibDetailsDispatch(setIsAutoUpdate(true));
  };

  const updateDivisionsDetails = () => {
    SpecificationLibDetailsDispatch(
      setSpecificationDivisionsDetails(divisionsData)
    );
    SpecificationLibDetailsDispatch(setIsAutoUpdate(true));
    updateTabStatus();
  };
  const updateTabStatus = () => {
    if (divisionsData?.length > 0) {
      const filteredData = divisionsData?.filter((item: any) => item.review);
      if (filteredData.length > 0) {
        SpecificationLibDetailsDispatch(setDivisionsTabStatus(false));
      } else {
        SpecificationLibDetailsDispatch(setDivisionsTabStatus(true));
        SpecificationLibDetailsDispatch(setSectionsTabStatus(true));
      }
    }
  };
  // add new category: input changes
  const handleDivisionNameChange = (e: any) => {
    setTrimDivisionName(e.target.value.trim());
    setNewDivisionName(e.target.value);
  };
  const handleDivisionNumChange = (e: any) => {
    setTrimDivisionNumber(e.target.value.trim());
    setNewDivisionNumber(e.target.value);
  };
  // add new category to the list
  const addNewDivision = () => {
    let newData: any = {
      division_name: trimDivisionName.trim(),
      division_number: trimDivisionNumber.trim(),
      status: "viewed",
    };
    let divisionList = [...divisionsData];
    const res = divisionList.filter(
      (item: any) =>
        item.division_name?.toLowerCase() ===
        trimDivisionName?.toLowerCase()?.trim()
    );
    const resNum = divisionList.filter(
      (item: any) =>
        item.division_number?.toLowerCase() ===
        trimDivisionNumber?.toLowerCase()?.trim()
    );
    if (res.length > 0) {
      Notification.sendNotification(
        `Division name '${trimDivisionName.trim()}' is already exist in the list`,
        AlertTypes.warn
      );
    } else if (resNum.length > 0) {
      Notification.sendNotification(
        `Division name '${trimDivisionNumber.trim()}' is already exist in the list`,
        AlertTypes.warn
      );
    } else {
      // setOldCategoryValue( trimCategoryValue.trim());
      // updateSheetsCategory(trimCategoryValue.trim());
      divisionList.push(newData);
      setDivisionsData(divisionList);
      SpecificationLibDetailsDispatch(
        setSpecificationDivisionsDetails(divisionList)
      );
      SpecificationLibDetailsDispatch(setIsAutoUpdate(true));
      if (divisionList.length > 2) {
        setNewDivisionName("");
        setTrimDivisionName("");
        setNewDivisionNumber("");
        setTrimDivisionNumber("");
        divisionList = [];
        newData = null;
      } else {
        //  console.log(divisionsArray,'divisionList in else')
        handleClose();
        setNewDivisionName("");
        setTrimDivisionName("");
        setNewDivisionNumber("");
        setTrimDivisionNumber("");
        divisionList = [];
        newData = null;
      }
    }
  };
  // unique section_num and section_name validation
  const uniqueDivisionValue = (data: any) => {
    data.forEach((division: any) => {
      const sectionNoCount = data.filter(
        (item: any) =>
          division.division_number &&
          item.division_number === division.division_number
      );
      //    const section_nameCount =  data.filter((item: any) => sheet.section_name && item.section_name === sheet.section_name);

      sectionNoCount.length > 1
        ? (division.isInvalidSpecNo = true)
        : (division.isInvalidSpecNo = false);
      //    section_nameCount.length > 1 ?  sheet.isInvalidsection_name = true :  sheet.isInvalidsection_name = false;
    });

    setDivisionsData(data);
  };

  return (
    <div className="divisions">
      {/* <div className="sections__sort">
                <InputLabel required={false}>Sort by </InputLabel>
                <div className="sections__sort__radio-grouping">
                    <RadioGroup aria-label="sort-filter" name="catefories" value={filterValue}>
                        <FormControlLabel value="show-all" control={<Radio color={'primary'} />} label="Show All" />
                        <FormControlLabel value="not-viewed" control={<Radio color={'primary'} />} label="Not Viewed" />
                        <FormControlLabel value="issues" control={<Radio color={'primary'} />} label="Issues" />
                    </RadioGroup>
                </div>
            </div> */}
      <div className="divisions__lists">
        <>
          {divisionsData?.length > 0 ? (
            <>
              <div className="divisions__lists__header">
                <div className="divisions__lists__header__text">Item</div>
                <div
                  className="divisions__lists__header__add"
                  onClick={(e: any) => handlePopOver(e)}
                >
                  +Add Item
                </div>
              </div>
              {divisionsData?.length > 0 &&
                divisionsData?.map((item: any, index: number) => (
                  <div
                    className="divisions__lists__item"
                    key={`${item.pdfs3key}-${index}`}
                  >
                    <Accordion
                      TransitionProps={{ unmountOnExit: true }}
                      expanded={expandedPanel === item.id}
                      onChange={(e: any, expanded: any) =>
                        handleViewed(e, expanded, index, item)
                      }
                    >
                      <AccordionSummary
                        expandIcon={
                          expandableHover === item.id ? (
                            <ExpandMoreIcon className="sections__lists__item__expandIcon" />
                          ) : (
                            ""
                          )
                        }
                        onMouseOver={() => setExpandableHover(item.id)}
                        aria-controls="panel-header"
                        id={`panel-header-${index}`}
                      >
                        {/* <Typography className={classes.heading}> */}
                        <div className="divisions__lists__item__name">
                          <div>
                            <span className="divisions__lists__item__index">
                              {index + 1}. &nbsp;
                            </span>
                            {/* <Tooltip title={`${item?.section_name}`} aria-label="delete category"> */}
                            <label>
                              {item?.division_name &&
                              item?.division_name.length > 35
                                ? `${
                                    item?.division_number
                                  } - ${item?.division_name.slice(0, 32)} . . .`
                                : `${item?.division_number} - ${item?.division_name}`}
                            </label>
                            {/* </Tooltip> */}
                          </div>
                          <div className="divisions__lists__item__name__action">
                            <>
                              {(item.review || item.isInvalidDivNo) && (
                                <Tooltip
                                  title={"Invalid"}
                                  aria-label="delete category"
                                >
                                  <label>
                                    <WarningIcon className="error" />
                                  </label>
                                </Tooltip>
                              )}
                            </>
                            <>
                              {item.status === "viewed" ? (
                                <span className="text">{item.status}</span>
                              ) : (
                                // <Tooltip title={'Mark as viewed'} aria-label="delete category">
                                //     <label>
                                //         <VisibilityOffIcon className="view" onClick={(e: any) => handleViewed(e, index)}/>
                                //     </label>
                                // </Tooltip>
                                ""
                              )}
                            </>
                          </div>
                        </div>
                        {/* </Typography> */}
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="divisions__lists__item__details">
                          <form className="divisions__lists__item__details__form">
                            <div className="divisions__lists__item__details__form__field">
                              <InputLabel required={true}>
                                Division number{" "}
                              </InputLabel>
                              <div className="divisions__lists__item__details__form__field__input-field">
                                <TextField
                                  type="text"
                                  fullWidth
                                  autoComplete="search"
                                  placeholder="Enter set title"
                                  variant="outlined"
                                  value={updateDivisionData.division_number}
                                  onChange={(e) =>
                                    handleChangeDivisionNo(e, index)
                                  }
                                  onBlur={() => updateValue(index)}
                                />
                                <div className="divisions__lists__item__details__form__field__error-wrap">
                                  {item.division_number &&
                                    item.isInvalidSpecNo && (
                                      <p className="divisions__lists__item__details__form__field__error-wrap__message">
                                        Division No already exists in other
                                        division
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>

                            <div className="divisions__lists__item__details__form__field">
                              <InputLabel required={true}>
                                Division Name{" "}
                              </InputLabel>
                              <div className="divisions__lists__item__details__form__field__input-field">
                                <TextField
                                  type="text"
                                  fullWidth
                                  autoComplete="search"
                                  placeholder="Enter set title"
                                  variant="outlined"
                                  value={updateDivisionData.division_name}
                                  onChange={(e) =>
                                    handleChangeDivisionName(e, index)
                                  }
                                  onBlur={() => updateValue(index)}
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

                            {/* <div className="sections__lists__item__details__form__field">
                                                <InputLabel required={true}>Division </InputLabel>
                                                <div className="sections__lists__item__details__form__field__input-field">
                                                    <Select
                                                        id={`category-${index}`}
                                                        fullWidth
                                                        autoComplete="search"
                                                        variant="outlined"
                                                        placeholder="select a value"
                                                        value={item.division}
                                                        defaultValue=""
                                                        onChange={(e: any) => handleChangeSpecificationDivision(e, index)}
                                                        disabled={item.division === defaultCategory.NOT_A_SEPECIFICATION}
                                                    >
                                                        {
                                                            divisionsLists?.map((category: any, categoryIndex: number) => (
                                                                <MenuItem key={`${category.section_desc}-${categoryIndex}`} value={category.section_desc}>
                                                                    {category.section_desc}
                                                                </MenuItem>
                                                            ))
                                                        }
                                                            <MenuItem value={defaultCategory.NOT_A_SPECIFICATION} disabled={true}>
                                                                {defaultCategory.NOT_A_SPECIFICATION}
                                                            </MenuItem>
                                                    </Select>
                                                    <div className="sections__lists__item__details__form__field__error-wrap">
                                                            <p className="createCompany__error-wrap__message">
                                                            </p>
                                                    </div>
                                                </div>
                                            </div> */}

                            {/* <div className="sections__lists__item__details__form__action">
                                                {
                                                    item.division === defaultCategory.NOT_A_SPECIFICATION ? (
                                                        <Button 
                                                                // type="submit" 
                                                                data-testid={'submit-version-review'} 
                                                                variant="outlined"
                                                                className="btn-primary"
                                                                // disabled={isDisableCreateBtn || companyDetailsState.companyValidation ||
                                                                // companyDetailsState.companyIDValidation}
                                                                onClick={() => handleNotDivisionBtn(index, false)}
                                                                >
                                                                This is a Division
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            // type="submit" 
                                                            data-testid={'submit-version-review'} 
                                                            variant="outlined"
                                                            className="btn-primary"
                                                            // disabled={isDisableCreateBtn || companyDetailsState.companyValidation ||
                                                            // companyDetailsState.companyIDValidation}
                                                            onClick={() => handleNotDivisionBtn(index, true)}
                                                            >
                                                            This is not a Division 
                                                        </Button>
                                                    )
                                                }
                                            </div>                 */}
                          </form>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                ))}
            </>
          ) : (
            <div className="categories__lists__no-data">
              <div className="categories__lists__no-data__message">
                Please add the specification divisions that you would like to
                use to group the specification sheets.
              </div>
              <div className="categories__lists__no-data__add">
                <Button
                  type="submit"
                  data-testid={"add-category"}
                  variant="outlined"
                  className="btn-primary"
                  onClick={(e: any) => handlePopOver(e)}
                >
                  Add Division
                </Button>
              </div>
            </div>
          )}
        </>
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="add-division">
          <InputLabel required={false}>Division Number </InputLabel>
          <TextField
            type="text"
            fullWidth
            autoComplete="search"
            placeholder="Type Here"
            variant="outlined"
            value={newDivisionNumber}
            onChange={(e) => handleDivisionNumChange(e)}
          />
          <InputLabel required={false}>Division Name </InputLabel>
          <TextField
            type="text"
            fullWidth
            autoComplete="search"
            placeholder="Type Here"
            variant="outlined"
            value={newDivisionName}
            onChange={(e) => handleDivisionNameChange(e)}
          />
          {/* <FormControlLabel
                    className="add-category__checkbox"
                    value={newCategoryStatus}
                    control={<Checkbox color="primary" checked={newCategoryStatus} onChange={(e: any) => handleViewChange(e)}/>}
                    label="Mark as viewed"
                    labelPlacement="end"
                /> */}
          <div className="add-division__action">
            <div className="add-division__action__cancel" onClick={handleClose}>
              Cancel
            </div>
            <Button
              type="submit"
              data-testid={"add-division"}
              variant="outlined"
              className="btn-primary"
              onClick={addNewDivision}
              size={"small"}
              disabled={!newDivisionName || !newDivisionNumber}
            >
              Add
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}


import React, { ReactElement, useContext, useEffect, useState } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import "./DrawingSheetInfoTable.scss";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { DrawingLibDetailsContext } from "../../context/DrawingLibDetailsContext";
import Tooltip from "@material-ui/core/Tooltip";
import WarningIcon from "@material-ui/icons/Warning";
import EditIcon from "@material-ui/icons/Edit";
import Popover from "@material-ui/core/Popover";
import DeleteIcon from "@material-ui/icons/Delete";

import {
  setDrawingCategoryDetails,
  setDrawingPageNumber,
  setDrawingSheetsDetails,
  setIsAutoUpdate,
  setLastAutoGenNum,
  setIsPublishEnabled
} from "../../context/DrawingLibDetailsAction";
import {
  defaultCategory,
  templateFormatId,
} from "../../../utils/drawingsConstant";
import { UPDATE_DRAWING } from "../../graphql/queries/drawingSheets";
import { client } from "src/services/graphql";
import { projectFeatureAllowedRoles } from "src/utils/role";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  UPDATE_DRAWING_LIBRARY_STATUS,
  UPDATE_DRAWING_SHEET_CATEGORY,
} from "../../graphql/queries/drawing";
import { match, useRouteMatch } from "react-router-dom";

export interface Params {
  projectId: string;
  documentId: string;
}
function DrawingSheetInfoTable(props: any): ReactElement {
  const { state }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const [filterValue, setFilterValue] = useState("show-all");
  const [sheetsData, setsheetsData] = useState<Array<any>>([]);
  const [uniqueSheetsData, setUniqueSheetsData] = useState<Array<any>>([]);
  const [duplicateIndexValue, setDuplicateIndexValue] = useState<any>();
  const { DrawingLibDetailsState, DrawingLibDetailsDispatch }: any = useContext(
    DrawingLibDetailsContext
  );
  const [categoryLists, setCategoryLists] = useState<Array<any>>([]);
  const [expandedPanel, setExpandedPanel] = React.useState<string | false>(
    false
  );
  const [updtateSheetData, setUpdtateSheetData] = useState<any>({});
  const [sheetInfoFields, setsheetInfoFields] = useState<Array<any>>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoriesArray, setCategoriesArray] = useState<Array<any>>([]);
  const [trimCategoryValue, setTrimCategoryValue] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const [oldCategoryValue, setOldCategoryValue] = useState("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(-1);
  const [drawingNumberLists, setDrawingNumberLists] = useState <Array<any>>([]);
  useEffect(()=>{
    if(DrawingLibDetailsState?.drawingNumberLists && DrawingLibDetailsState?.drawingNumberLists.length>0){
        setDrawingNumberLists(DrawingLibDetailsState?.drawingNumberLists)
    }
  },[DrawingLibDetailsState?.drawingNumberLists])
  useEffect(()=>{

    if(sheetsData && sheetsData.length>0  ){
  const updatedSheetDrawingNumbers = ()=>{
    const drawingNumberLists = DrawingLibDetailsState?.drawingNumberLists;
    const dWNos = {} as any;

    const updatedSheet = sheetsData.map((sheet,index)=> {
      const drawingNo = sheet['dwgnum'];
      if(drawingNo && dWNos[drawingNo]) {
       sheet['dwgnum'] = sheet['dwgnum'] + '-' + sheet.drawingSequence ;
     }

     dWNos[sheet['dwgnum']] = true;

     return sheet;
    })
  }
  updatedSheetDrawingNumbers()
    }
  },[sheetsData])
  
  useEffect(()=>{
    if(sheetsData && sheetsData.length>0){
     validateSheetData(sheetsData)
    }
   },[sheetsData])
  useEffect(() => {
    if (DrawingLibDetailsState?.drawingCategoryDetails?.length > 0) {
      if (
        typeof DrawingLibDetailsState?.drawingCategoryDetails[0] === "string"
      ) {
        mapCategory(DrawingLibDetailsState?.drawingCategoryDetails);
      } else {
        if (filterValue === "show-all") {
          sortCategoryByName(DrawingLibDetailsState?.drawingCategoryDetails);
        }
      }
    }
  }, [DrawingLibDetailsState?.drawingCategoryDetails]);

  //convert category: array of strings to array of objects
  const mapCategory = (data: any) => {
    const res = data.reduce((s: any, a: any) => {
      s.push({ name: a, status: "" });
      return s;
    }, []);
    DrawingLibDetailsDispatch(setDrawingCategoryDetails(res));
  };

  // sort category list: order by asc name
  const sortCategoryByName = (data: any) => {
    const res = data?.sort((a: any, b: any) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );
    const removeEmptyData = res.filter(
      (category: any) => category.name.trim() !== ""
    );
    const defaultCategoryList = removeEmptyData.filter(
      (category: any) => category.name.trim() === "NOT A DRAWING"
    );
    const nonDefaultCategpryList = removeEmptyData.filter(
      (category: any) => category.name.trim() !== "NOT A DRAWING"
    );
    setCategoryLists([...nonDefaultCategpryList, ...defaultCategoryList]);
    setCategoriesArray([...nonDefaultCategpryList, ...defaultCategoryList]);
  };

  useEffect(() => {
    if (props?.sheetInfoFieldLists?.length > 0) {
      setsheetInfoFields(props?.sheetInfoFieldLists);
    }
  }, [props.sheetInfoFieldLists]);

  useEffect(() => {
    if (
      DrawingLibDetailsState?.drawingSheetsDetails &&
      DrawingLibDetailsState?.drawingSheetsDetails?.length > 0
    ) {
      const list: any = [];
      DrawingLibDetailsState?.drawingSheetsDetails.forEach((sheet: any) => {
        if (props?.templateId === templateFormatId.US_CANADA) {
          if (
            sheet.category !== "NOT A DRAWING" &&
            (!sheet.dwgnum || !sheet.dwgname)
          ) {
            sheet.revisionInfo.review = true;
          } else {
            sheet.revisionInfo.review = false;
          }
        } else if (props?.templateId === templateFormatId.BS1192_UK) {
          if (sheet.category !== "NOT A DRAWING" && !sheet.dwgname) {
            sheet.revisionInfo.review = true;
          } else {
            sheet.revisionInfo.review = false;
          }
        } else {
          if (sheet.category !== "NOT A DRAWING" && !sheet.dwgnum) {
            sheet.revisionInfo.review = true;
          } else {
            sheet.revisionInfo.review = false;
          }
        }
        list.push({ ...sheet });
        // if(sheet.pdfs3key === DrawingLibDetailsState?.firstSheetKey ){
        //     sheet.revisionInfo.autoGenNum =  DrawingLibDetailsState?.autogenNum;
        // }
      });
      if (filterValue === "show-all") {
        const sheetsList = [...list];
        const sortSheetsList = sheetsList?.sort((a: any, b: any) =>
          a.drawingSequence > b.drawingSequence
            ? 1
            : b.drawingSequence > a.drawingSequence
            ? -1
            : 0
        );
        setsheetsData(sortSheetsList);
      } else {
        setsheetsData(list);
      }
      if (DrawingLibDetailsState?.drawingCategoryDetails?.length > 0) {
        validateSheetsCategory();
      }
      if (props?.templateId !== templateFormatId.US_CANADA) {
        const sheetsArray = [...DrawingLibDetailsState?.drawingSheetsDetails];
        uniqueSheetValue(sheetsArray);
      }
    }
  }, [DrawingLibDetailsState?.drawingSheetsDetails]);

  useEffect(() => {
    if (DrawingLibDetailsState?.drawingCategoryDetails?.length > 0) {
      validateSheetsCategory();
    }
  }, [DrawingLibDetailsState?.drawingCategoryDetails]);

  // validate if user update the category lists
  const validateSheetsCategory = () => {
    if (DrawingLibDetailsState?.drawingSheetsDetails?.length > 0) {
      const sheetsArray = [...DrawingLibDetailsState?.drawingSheetsDetails];
      if (sheetsArray.length > 0) {
        sheetsArray.forEach((item: any) => {
          if (
            item.category !== "NOT A DRAWING" &&
            (!item.dwgnum || !item.dwgname)
          ) {
            item.revisionInfo.review = true;
          } else {
            item.revisionInfo.review = false;
          }
        });
      }

      //sort the sheets based on pagenum
      if (filterValue === "show-all") {
        const sheetsList = [...sheetsArray];
        const sortSheetsList = sheetsList?.sort((a: any, b: any) =>
          a.drawingSequence > b.drawingSequence
            ? 1
            : b.drawingSequence > a.drawingSequence
            ? -1
            : 0
        );
        uniqueSheetValue(sortSheetsList);
      } else {
        uniqueSheetValue(sheetsArray);
      }
    }
  };

  const handleSortingChange = (event: any) => {
    setFilterValue(event.target.value);
    if (event.target.value === "show-all") {
      const sheetsList = [...sheetsData];
      const sortSheetsList = sheetsList?.sort((a: any, b: any) =>
        a.drawingSequence > b.drawingSequence
          ? 1
          : b.drawingSequence > a.drawingSequence
          ? -1
          : 0
      );
      setsheetsData(sortSheetsList);
    }
    if (event.target.value === "not-viewed") {
      const sheetsList = [...sheetsData];

      const filter1 = sheetsList.filter(
        (item: any) => item?.revisionInfo?.status !== "viewed"
      );
      const sortFilter1 = filter1?.sort((a: any, b: any) =>
        a.drawingSequence > b.drawingSequence
          ? 1
          : b.drawingSequence > a.drawingSequence
          ? -1
          : 0
      );
      const filter2 = sheetsList.filter(
        (item: any) => item?.revisionInfo?.status === "viewed"
      );
      const sortFilter2 = filter2?.sort((a: any, b: any) =>
        a.drawingSequence > b.drawingSequence
          ? 1
          : b.drawingSequence > a.drawingSequence
          ? -1
          : 0
      );

      const res = [...sortFilter1, ...sortFilter2];
      setsheetsData(res);
    }
    if (event.target.value === "issues") {
      const sheetsList = [...sheetsData];

      const filter1 = sheetsList.filter(
        (item: any) =>
          item.revisionInfo.review || item?.revisionInfo?.isInvalidDwgNo
      );
      const sortFilter1 = filter1?.sort((a: any, b: any) =>
        a.drawingSequence > b.drawingSequence
          ? 1
          : b.drawingSequence > a.drawingSequence
          ? -1
          : 0
      );

      const filter2 = sheetsList.filter(
        (item: any) =>
          !item.revisionInfo.review && !item?.revisionInfo?.isInvalidDwgNo
      );
      const sortFilter2 = filter2?.sort((a: any, b: any) =>
        a.drawingSequence > b.drawingSequence
          ? 1
          : b.drawingSequence > a.drawingSequence
          ? -1
          : 0
      );

      const res = [...sortFilter1, ...sortFilter2];
      setsheetsData(res);
    }
  };

  const handleChangeDrawingNo = (e: any, argIndex: number) => {
    let userInputDrawingNumber = e.target.value;
    const duplicateDrawingNumbers = [];
       let drawingInfo
    for (let i = 0; i < drawingNumberLists.length; i++) {
         drawingInfo = drawingNumberLists[i];
        
        if (drawingInfo.dwgnum === userInputDrawingNumber) {
            // If a match is found, add the object to the list of duplicates
            duplicateDrawingNumbers.push(drawingInfo);
          }
        }

        // Check if any duplicates were found
if (duplicateDrawingNumbers.length === 0) {
    sheetsData[argIndex].dwgnum = e.target.value;
    setsheetsData([...sheetsData]);
    setUpdtateSheetData({ ...updtateSheetData, dwgnum: e?.target?.value});
  } else {
    const currentDate = new Date();
    const currentMiliSecond = currentDate.getMilliseconds();
    userInputDrawingNumber = userInputDrawingNumber + currentMiliSecond
    sheetsData[argIndex].dwgnum = userInputDrawingNumber;
    setsheetsData([...sheetsData]);
    setUpdtateSheetData({ ...updtateSheetData, dwgnum: userInputDrawingNumber});
  }

  };

  const handleChangeOtherFields = (
    e: any,
    argIndex: number,
    fieldData: any
  ) => {
    const filedName: any =
      fieldData.name === "Drawing_Name" ? "dwgname" : fieldData.name;
    sheetsData[argIndex][filedName] = e.target.value;
    setsheetsData([...sheetsData]);
    setUpdtateSheetData({ ...updtateSheetData, [filedName]: e?.target?.value });
  };

  const handleChangeDrawingCategory = (
    e: any,
    argIndex: number,
    sheet: any
  ) => {
    sheetsData[argIndex].category = e.target.value;
    setsheetsData([...sheetsData]);
    setUpdtateSheetData({ ...updtateSheetData, category: e?.target?.value });
    updateSheetsDetails(sheet);
    setCurrentCategoryIndex(argIndex);
  };

  const handleViewed = (
    e: any,
    expanded: boolean,
    index: number,
    sheet: any
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (expanded) {
      setExpandedPanel(sheet?.drawingSequence);
      setUpdtateSheetData(sheetsData[index]);
      if (sheet?.revisionInfo?.status !== "viewed") {
        const sheetList = [...sheetsData];
        sheetList[index].revisionInfo.status = "viewed";
        setsheetsData(sheetList);
        updateSheetsDetails(sheet);
      }
      DrawingLibDetailsDispatch(setDrawingPageNumber(sheet?.drawingSequence));
      //    if(DrawingLibDetailsState?.parsedFileUrl?.s3Key !== sheet.pdfs3key){
      //        const pagenum = sheet?.drawingSequence ? sheet?.drawingSequence : 1;
      //         DrawingLibDetailsDispatch(setDrawingPageNumber(sheet?.drawingSequence));
      //    }
    } else {
      setExpandedPanel(false);
    }
  };

  const handleNotDrawingBtn = (
    argIndex: number,
    isNotADrawing: boolean,
    sheet: any
  ) => {
    const sheetList = [...sheetsData];
    setUpdtateSheetData(sheetsData[argIndex]);
    // sheetList.splice(argIndex, 1);
    if (props?.templateId === templateFormatId.US_CANADA) {
      if (isNotADrawing) {
        sheetList[argIndex].category = defaultCategory.NOT_A_DRAWING;
          if (!sheetList[argIndex].dwgnum) {

          const autoGeneratedDwgNo = DrawingLibDetailsState?.autogenNum + 1;
          sheetList[argIndex].dwgnum = autoGeneratedDwgNo
            .toString()
            .padStart(4, "0")
            .padStart(6, "NA");
          sheetList[argIndex].revisionInfo.autoGenNum =
            DrawingLibDetailsState?.autogenNum + 1;
          DrawingLibDetailsDispatch(
            setLastAutoGenNum(DrawingLibDetailsState?.autogenNum + 1)
          );
        }
        if (!sheetList[argIndex].dwgname) {
          sheetList[argIndex].dwgname = "Not a drawing";
        }
        setsheetsData(sheetList);
      } else {
        sheetList[argIndex].category = "";
      }
    } else if (props?.templateId === templateFormatId.BS1192_UK) {
      if (isNotADrawing) {
        sheetList[argIndex].category = defaultCategory.NOT_A_DRAWING;
        if (!sheetList[argIndex].dwgname) {
          sheetList[argIndex].dwgname = "Not a drawing";
        }
        setsheetsData(sheetList);
      } else {
        sheetList[argIndex].dwgname =
          sheetList[argIndex].dwgname === "Not a drawing"
            ? ""
            : sheetList[argIndex].dwgname;
        sheetList[argIndex].category = "";
      }
    } else {
      if (isNotADrawing) {
        sheetList[argIndex].category = defaultCategory.NOT_A_DRAWING;
        if (!sheetList[argIndex].dwgnum) {
          const autoGeneratedDwgNo = DrawingLibDetailsState?.autogenNum + 1;
          sheetList[argIndex].dwgnum = autoGeneratedDwgNo
            .toString()
            .padStart(5, "0");
          sheetList[argIndex].revisionInfo.autoGenNum =
            DrawingLibDetailsState?.autogenNum + 1;
          DrawingLibDetailsDispatch(
            setLastAutoGenNum(DrawingLibDetailsState?.autogenNum + 1)
          );
        }
        if (!sheetList[argIndex].dwgname) {
          sheetList[argIndex].dwgname = "Not a drawing";
        }
        setsheetsData(sheetList);
      } else {
        sheetList[argIndex].dwgname =
          sheetList[argIndex].dwgname === "Not a drawing"
            ? ""
            : sheetList[argIndex].dwgname;
        sheetList[argIndex].category = "";
      }
    }
    setsheetsData(sheetList);
    // DrawingLibDetailsDispatch(setDrawingSheetsDetails(sheetList));
    // DrawingLibDetailsDispatch(setIsAutoUpdate(true));
    updateSheetsDetails(sheet);
  };

  const updateSheetsDetails = async (sheet: any) => {
    await DrawingLibDetailsDispatch(setDrawingSheetsDetails(sheetsData));
    await DrawingLibDetailsDispatch(setIsAutoUpdate(true));
    const sheetData = await [...sheetsData];
    const selectedSheet = await sheetData.filter(
      (item: any) => item.id === sheet.id
    );
    await updateSheetDataPayload(selectedSheet[0]);
  };

  const updateSheetDataPayload = (sheet: any) => {
    let reviewInfo: any = {};
    reviewInfo = sheet?.revisionInfo;
    reviewInfo.autoGenNum = sheet?.revisionInfo?.autoGenNum
      ? sheet?.revisionInfo?.autoGenNum
      : 0;
    const payload: any = {
      id: sheet.id,
      drawingName: sheet.dwgname,
      drawingNumber: sheet.dwgnum,
      dwgClassification: sheet.drawing_classification,
      dwgLevel: sheet.drawing_level,
      dwgOriginator: sheet.drawing_originator,
      dwgProjectNumber: sheet.drawing_project_number,
      dwgRevision: sheet.drawing_revision,
      dwgRole: sheet.drawing_role,
      dwgSheetNumber: sheet.drawing_sheet_number,
      dwgStatus: sheet.drawing_status,
      dwgSuitability: sheet.drawing_suitability,
      dwgType: sheet.drawing_type,
      dwgVolume: sheet.drawing_volume,
      revisionInfo: reviewInfo,
      drawingCategory:
        props?.templateId === templateFormatId.US_CANADA
          ? sheet.category
          : sheet.category, //cross check with the Product team
      dwgZone: sheet.drawing_zone,
    };
    updateSheetDetailsMutation(payload);
    if (DrawingLibDetailsState?.drawingLibDetails[0].status === "PARSED") {
      // const data = [...DrawingLibDetailsState?.drawingLibDetails]
      // data[0].status = 'REVIEWING'
      // DrawingLibDetailsDispatch(setDrawingLibDetails([...data]));
      updateDrawingLibraryStatus();
    }
  };

  const updateSheetDetailsMutation = async (payload: any) => {
    try {
      await client.mutate({
        mutation: UPDATE_DRAWING,
        variables: {
          id: payload.id,
          drawingName: payload.drawingName,
          drawingNumber: payload.drawingNumber,
          dwgClassification: payload.dwgClassification || "",
          dwgLevel: payload.dwgLevel || "",
          dwgOriginator: payload.dwgOriginator || "",
          dwgProjectNumber: payload.dwgProjectNumber || "",
          dwgRevision: payload.dwgRevision || "",
          dwgRole: payload.dwgRole || "",
          dwgSheetNumber: payload.dwgSheetNumber || "",
          dwgStatus: payload.dwgStatus || "",
          dwgSuitability: payload.dwgSuitability || "",
          dwgType: payload.dwgType || "",
          dwgVolume: payload.dwgVolume || "",
          revisionInfo: payload?.revisionInfo || "",
          drawingCategory: payload.drawingCategory || "",
          dwgZone: payload.dwgZone || "",
        },
        context: {
          role: projectFeatureAllowedRoles.uploadDrawings,
          token: state.selectedProjectToken,
        },
      });
    } catch (err: any) {
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  const updateDrawingLibraryStatus = async () => {
    try {
      await client.mutate({
        mutation: UPDATE_DRAWING_LIBRARY_STATUS,
        variables: {
          id: pathMatch.params.documentId,
          status: "REVIEWING",
        },
        context: {
          role: projectFeatureAllowedRoles.uploadDrawings,
          token: state.selectedProjectToken,
        },
      });
    } catch (err: any) {
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  // unique dwgNo and dwgName validation
  const uniqueSheetValue = (data: any) => {
    if (props?.templateId !== templateFormatId.BS1192_UK) {
      data.forEach((sheet: any) => {
        const dwgNoCount = data.filter(
          (item: any) =>
            sheet.dwgnum &&
            sheet?.category !== "NOT A DRAWING" &&
            item.dwgnum === sheet.dwgnum
        );
        dwgNoCount.length > 1
          ? (sheet.revisionInfo.isInvalidDwgNo = true)
          : (sheet.revisionInfo.isInvalidDwgNo = false);
      });
    }

    setsheetsData(data);
  };

  const updateSheetData = async (
    fieldName: string,
    argIndex: number,
    item: any
  ) => {
    switch (fieldName) {
      case "drawing_number":
        if (sheetsData[argIndex].dwgnum !== updtateSheetData.dwgnum) {
          sheetsData[argIndex].dwgnum = updtateSheetData.dwgnum;
          setsheetsData([...sheetsData]);
        }
        break;

      case "Drawing_Name":
      case "drawing_status":
      case "drawing_revision":
      case "drawing_role":
      case "drawing_project_number":
      case "drawing_originator":
      case "drawing_volume":
      case "drawing_type":
      case "drawing_classification":
      case "drawing_suitability":
      case "drawing_sheet_number":
      case "drawing_level":
      case "drawing_zone":
        const filedNameValue: string =
          fieldName === "Drawing_Name" ? "dwgname" : fieldName;
        if (
          sheetsData[argIndex][filedNameValue] !==
          updtateSheetData[filedNameValue]
        ) {
          sheetsData[argIndex][filedNameValue] =
            updtateSheetData[filedNameValue];
          setsheetsData([...sheetsData]);
        }
        break;

      default:
        return "";
    }
    // if(sheetsData[argIndex].dwgname !== updtateSheetData.dwgname ||
    //     sheetsData[argIndex].dwgnum !== updtateSheetData.dwgnum ) {
    //     sheetsData[argIndex].dwgname = updtateSheetData.dwgname;
    //     sheetsData[argIndex].dwgnum =updtateSheetData.dwgnum;
    //     setsheetsData([...sheetsData]);
    //     // updateValue()
    //     // update all the fields based on template fields
    // }
    await uniqueSheetValue([...sheetsData]);
    await updateSheetsDetails(item);
  };

  const renderWarningIcon = (item: any) => {
    switch (props?.templateId) {
      case templateFormatId.US_CANADA:
        return (
          <>
            {item.category !== "NOT A DRAWING" &&
              (item?.revisionInfo?.review ||
                item?.revisionInfo?.isInvalidDwgNo) && (
                <Tooltip title={"Invalid"} aria-label="delete category">
                  <label>
                    <WarningIcon className="error" />
                  </label>
                </Tooltip>
              )}
          </>
        );

      default:
        return (
          <>
            {(item?.revisionInfo?.review ||
              item?.revisionInfo?.isInvalidDwgNo) && (
              <Tooltip title={"Invalid"} aria-label="delete category">
                <label>
                  <WarningIcon className="error" />
                </label>
              </Tooltip>
            )}
          </>
        );
    }
  };

  //for add category
  const handlePopOver = (event: any, index: number) => {
    const anchorEle: any = document.getElementById(`category-${index}`);
    setEditMode(false);
    setAnchorEl(anchorEle);
  };

  //for edit category
  const handleEdit = (
    e: any,
    categoryName: string,
    categoryIndex: number,
    index: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const anchorEle: any = document.getElementById(`category-${index}`);
    setAnchorEl(anchorEle);
    setEditMode(true);
    setCurrentCategoryIndex(categoryIndex);
    setNewCategoryName(categoryName);
    setOldCategoryValue(categoryName);
  };

  //for delete category
  const handleDelete = (
    e: any,
    categoryName: string,
    categoryIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setOldCategoryValue(categoryName);
    setNewCategoryName("");
    const category = [...categoryLists];
    // const category = [...categoriesArray];
    category.splice(categoryIndex, 1);
    setCategoriesArray([...category]);
    DrawingLibDetailsDispatch(setDrawingCategoryDetails([...category]));
    // DrawingLibDetailsDispatch(setIsAutoUpdate(true));
    updateDrawingSheetCategory(categoryName, "");
  };
  // add new category to the list
  const addNewCategory = () => {
    let newData: any = {
      name: trimCategoryValue.trim(),
      status: "viewed",
    };
    let categoryList = [...categoriesArray];
    const res = categoryList.filter(
      (item: any) =>
        item.name?.toLowerCase() === trimCategoryValue?.toLowerCase()?.trim()
    );
    if (res.length > 0) {
      Notification.sendNotification(
        `Category name '${trimCategoryValue.trim()}' is already exist in the list`,
        AlertTypes.warn
      );
    } else {
      categoryList.push(newData);
      // setCategoriesArray(categoryList);
      sortCategoryByName(categoryList);
      DrawingLibDetailsDispatch(setDrawingCategoryDetails(categoryList));
      DrawingLibDetailsDispatch(setIsAutoUpdate(true));

      setNewCategoryName("");
      setTrimCategoryValue("");
      categoryList = [];
      newData = null;
    }
  };

  // update category name: onchange
  const handleDrawingCategory = (e: any, argIndex: number) => {
    if (editMode) {
      setNewCategoryName(e.target.value);
    } else {
      setTrimCategoryValue(e.target.value.trim());
      setNewCategoryName(e.target.value);
    }
  };
  //close popover
  const handleClose = () => {
    setNewCategoryName("");
    setTrimCategoryValue("");
    setAnchorEl(null);
    setCurrentCategoryIndex(-1);
  };
  // update category name to context
  const updateCategoryName = (e: any, argIndex: number) => {
    const category = [...categoriesArray];
    //validate duplicate catagory for edit
    const duplicateCount = category.filter(
      (item: any) =>
        item.name?.toLowerCase().trim() ===
        newCategoryName?.toLowerCase()?.trim()
    );
    if (duplicateCount?.length > 1) {
      Notification.sendNotification(
        `Category name '${newCategoryName?.trim()}' is already exist in the list`,
        AlertTypes.warn
      );
      updateSheetsCategory(oldCategoryValue);
      category[argIndex].name = oldCategoryValue;
      const removeEmptyData = category.filter(
        (item: any) => item.name.trim() !== ""
      );
      setCategoriesArray([...removeEmptyData]);
      DrawingLibDetailsDispatch(setDrawingCategoryDetails(removeEmptyData));
      DrawingLibDetailsDispatch(setIsAutoUpdate(true));
      setOldCategoryValue("");
    } else {
      // updateSheetsCategory(e.target.value.trim())
      updateSheetsCategory(newCategoryName?.trim());
      category[argIndex].name = newCategoryName?.trim();
      const removeEmptyData = category.filter(
        (item: any) => item.name.trim() !== ""
      );
      sortCategoryByName(removeEmptyData);
      // setCategoriesArray([...removeEmptyData]);
      DrawingLibDetailsDispatch(setDrawingCategoryDetails(removeEmptyData));
      DrawingLibDetailsDispatch(setIsAutoUpdate(true));
      setOldCategoryValue("");
      updateDrawingSheetCategory(oldCategoryValue, newCategoryName.trim());
    }
    // handleViewed(argIndex);

    setEditMode(!editMode);
    handleClose();
  };

  const updateDrawingSheetCategory = async (
    oldValue: string,
    newValue: string
  ) => {
    try {
      await client.mutate({
        mutation: UPDATE_DRAWING_SHEET_CATEGORY,
        variables: {
          sourceId: pathMatch.params.documentId,
          oldDrawingCategory: oldValue,
          newDrawingCategory: newValue,
        },
        context: {
          role: projectFeatureAllowedRoles.uploadDrawings,
          token: state.selectedProjectToken,
        },
      });
    } catch (err: any) {
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  const updateSheetsCategory = (newValue: string) => {
    let sheetsArray: any;
    if (DrawingLibDetailsState?.drawingSheetsDetails?.length > 0) {
      sheetsArray = [...DrawingLibDetailsState?.drawingSheetsDetails];
    }
    sheetsArray?.map((sheet: any) => {
      if (sheet.category) {
        sheet.category = newValue;
      }
    });
    DrawingLibDetailsDispatch(setDrawingSheetsDetails(sheetsArray));
    DrawingLibDetailsDispatch(setIsAutoUpdate(true));
  };

    // validate sheet data for publish
    const validateSheetData = (data: Array<any>):void => {
      const invalidCount =  data.filter((item: any) => (item?.revisionInfo?.isInvalidDwgNo || item?.revisionInfo?.review)); 
      invalidCount.length > 0 ?  DrawingLibDetailsDispatch(setIsPublishEnabled(true))  :  DrawingLibDetailsDispatch(setIsPublishEnabled(false));
    }
  const renderSheetInfoFields = (item: any, index: any, fieldData: any) => {
    switch (fieldData.name) {
      case "drawing_number":
        return (
          <>
            {props?.templateId !== templateFormatId.BS1192_UK ? (
              <div className="sheets__lists__item__details__form__field">
                {/* <InputLabel required={item?.category === 'NOT A DRAWING' ? false : fieldData.isMandatory}>
                                        {fieldData.label}
                                    </InputLabel> */}
                <div className="sheets__lists__item__details__form__field__input-field">
                  <TextField
                    type="text"
                    fullWidth
                    placeholder={`Enter ${fieldData.label}`}
                    variant="outlined"
                    value={updtateSheetData.dwgnum}
                    //  value={item.dwgnum}
                    onChange={(e) => handleChangeDrawingNo(e, index)}
                    onBlur={() => updateSheetData(fieldData.name, index, item)}
                  />
                  <div className="sheets__lists__item__details__form__field__error-wrap">
                    {item.dwgnum && item?.revisionInfo?.isInvalidDwgNo && (
                      <p className="sheets__lists__item__details__form__field__error-wrap__message">
                        Error: Drawing Number already exists in other sheet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // <div className="sheets__lists__item__details__form__field">
              //     <InputLabel required={false}>
              //         {fieldData.label}
              //     </InputLabel>
              //     <div className="sheets__lists__item__details__form__field__input-field">
              //         <TextField
              //             type="text"
              //             fullWidth
              //             placeholder={`Enter ${fieldData.label}`}
              //             variant='outlined'
              //             value={updtateSheetData.dwgnum}
              //             onChange={(e) => handleChangeDrawingNo(e, index)}
              //             onBlur={() => updateSheetData(fieldData.name, index, item)}
              //         />
              //         <div className="sheets__lists__item__details__form__field__error-wrap">
              //                 {
              //                     item.dwgnum && item?.revisionInfo?.isInvalidDwgNo && (
              //                         <p className="sheets__lists__item__details__form__field__error-wrap__message">
              //                             Error: Drawing Number already exists in other sheet
              //                         </p>
              //                     )
              //                 }
              //         </div>
              //     </div>
              // </div>
              ""
            )}
          </>
        );

      case "Drawing_Category":
        return (
          <div className="sheets__lists__item__details__form__field">
            <div className="sheets__lists__item__details__form__field__input-field">
              <Select
                id={`category-${index}`}
                fullWidth
                variant="outlined"
                placeholder="select a value"
                value={item.category}
                defaultValue=""
                onChange={(e: any) =>
                  handleChangeDrawingCategory(e, index, item)
                }
                disabled={item.category === defaultCategory.NOT_A_DRAWING}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
              >
                {categoryLists?.map((category: any, categoryIndex: number) => (
                  // categoriesArray?.map((category: any, categoryIndex: number) => (
                  <MenuItem
                    key={`category-${categoryIndex}`}
                    value={category.name}
                    selected={categoryIndex === currentCategoryIndex}
                    disabled={category.name === defaultCategory.NOT_A_DRAWING}
                  >
                    {
                      //    category.name !== defaultCategory.NOT_A_DRAWING && (
                      <div className="sheets__lists__item__details__form__field__category-field">
                        <div className="sheets__lists__item__details__form__field__category-field__item-name">
                          {" "}
                          {category.name}
                        </div>
                        {isOpen && (
                          <div className="sheets__lists__item__details__form__field__category-field__item-name">
                            <EditIcon
                              onClick={(e: any) =>
                                handleEdit(
                                  e,
                                  category.name,
                                  categoryIndex,
                                  index
                                )
                              }
                            >
                              {" "}
                              Edit
                            </EditIcon>
                            <DeleteIcon
                              onClick={(e: any) =>
                                handleDelete(e, category.name, categoryIndex)
                              }
                            >
                              Delete
                            </DeleteIcon>
                          </div>
                        )}
                      </div>
                      //    )
                    }
                  </MenuItem>
                ))}
                {props?.templateId === templateFormatId.US_CANADA && (
                  <div
                    className="sheets__lists__item__details__form__field__add-category"
                    onClick={(e: any) => handlePopOver(e, index)}
                  >
                    +Add Category
                  </div>
                )}
              </Select>
            </div>
          </div>
        );

      case "Drawing_Name":
      case "drawing_status":
      case "drawing_revision":
      case "drawing_role":
      case "drawing_project_number":
      case "drawing_originator":
      case "drawing_volume":
      case "drawing_type":
      case "drawing_classification":
      case "drawing_suitability":
      case "drawing_sheet_number":
      case "drawing_level":
      case "drawing_zone":
        return (
          <div className="sheets__lists__item__details__form__field">
            {/* {
                            fieldData.name === 'Drawing_Name' ? (
                                <>
                                    {
                                        props?.templateId === templateFormatId.BS1192_UK ||props?.templateId === templateFormatId.US_CANADA ? (
                                            <InputLabel required={item?.category === 'NOT A DRAWING' ? false : fieldData.isMandatory}>
                                                Drawing Name 
                                            </InputLabel>
                                        ):(
                                            <InputLabel required={false}>Drawing Name </InputLabel> 
                                        )

                                    }
                                </>
                            ): (
                                <InputLabel required={fieldData.isMandatory}>
                                    {fieldData.label}
                                </InputLabel>
                            )
                        } */}

            <div className="sheets__lists__item__details__form__field__input-field">
              <TextField
                type="text"
                fullWidth
                placeholder={`Enter ${fieldData.label}`}
                variant="outlined"
                value={
                  fieldData.name === "Drawing_Name"
                    ? updtateSheetData.dwgname
                    : updtateSheetData[fieldData.name]
                }
                onChange={(e) => handleChangeOtherFields(e, index, fieldData)}
                onBlur={() => updateSheetData(fieldData.name, index, item)}
              />
            </div>
          </div>
        );

      default:
        return "";
    }
  };

  const renderSheetInfoLabel = (item: any, index: number, fieldData: any) => {
    switch (fieldData.name) {
      case "drawing_number":
        return (
          <>
            {props?.templateId !== templateFormatId.BS1192_UK ? (
              <div className="sheets__lists__item__details__form__field">
                <InputLabel
                  required={
                    item?.category === "NOT A DRAWING"
                      ? false
                      : fieldData.isMandatory
                  }
                >
                  {fieldData.label}
                </InputLabel>
              </div>
            ) : (
              // <div className="sheets__lists__item__details__form__field">
              //     <InputLabel required={false}>
              //         {fieldData.label}
              //     </InputLabel>
              //     <div className="sheets__lists__item__details__form__field__input-field">
              //         <TextField
              //             type="text"
              //             fullWidth
              //             placeholder={`Enter ${fieldData.label}`}
              //             variant='outlined'
              //             value={updtateSheetData.dwgnum}
              //             onChange={(e) => handleChangeDrawingNo(e, index)}
              //             onBlur={() => updateSheetData(fieldData.name, index, item)}
              //         />
              //         <div className="sheets__lists__item__details__form__field__error-wrap">
              //                 {
              //                     item.dwgnum && item?.revisionInfo?.isInvalidDwgNo && (
              //                         <p className="sheets__lists__item__details__form__field__error-wrap__message">
              //                             Error: Drawing Number already exists in other sheet
              //                         </p>
              //                     )
              //                 }
              //         </div>
              //     </div>
              // </div>
              ""
            )}
          </>
        );

      case "Drawing_Category":
        return (
          <div className="sheets__lists__item__details__form__field">
            <InputLabel required={fieldData.isMandatory}>
              {fieldData.label}{" "}
            </InputLabel>
          </div>
        );

      case "Drawing_Name":
      case "drawing_status":
      case "drawing_revision":
      case "drawing_role":
      case "drawing_project_number":
      case "drawing_originator":
      case "drawing_volume":
      case "drawing_type":
      case "drawing_classification":
      case "drawing_suitability":
      case "drawing_sheet_number":
      case "drawing_level":
      case "drawing_zone":
        return (
          <div className="sheets__lists__item__details__form__field">
            {fieldData.name === "Drawing_Name" ? (
              <>
                {props?.templateId === templateFormatId.BS1192_UK ||
                props?.templateId === templateFormatId.US_CANADA ? (
                  <InputLabel
                    required={
                      item?.category === "NOT A DRAWING"
                        ? false
                        : fieldData.isMandatory
                    }
                  >
                    Drawing Name
                  </InputLabel>
                ) : (
                  <InputLabel required={false}>Drawing Name </InputLabel>
                )}
              </>
            ) : (
              <InputLabel required={fieldData.isMandatory}>
                {fieldData.label}
              </InputLabel>
            )}
          </div>
        );

      default:
        return "";
    }
  };

  return (
    <div className="sheets">
      <div className="sheets__action">
        <div className="sheets__sort">
          <InputLabel required={false}>Sort by </InputLabel>
          <div className="sheets__sort__radio-grouping">
            <RadioGroup
              aria-label="sort-filter"
              name="catefories"
              value={filterValue}
              onChange={handleSortingChange}
            >
              <FormControlLabel
                value="show-all"
                control={<Radio color={"primary"} />}
                label="Show All"
              />
              <FormControlLabel
                value="not-viewed"
                control={<Radio color={"primary"} />}
                label="Not Viewed"
              />
              <FormControlLabel
                value="issues"
                control={<Radio color={"primary"} />}
                label="Issues"
              />
            </RadioGroup>
          </div>
        </div>
      </div>
      {/* {uniqueSheetsData?.length > 0 &&
          uniqueSheetsData?.map((item: any, index: number) => ( */}
      
      <div className="sheets__lists">
        {sheetsData?.length > 0 &&
          sheetsData?.map((item: any, index: number) => (
    
            <div
              className="sheets__lists__item"
              key={`${item.pdfs3key}-${index}`}
            >
              <Accordion
                expanded={expandedPanel === item.drawingSequence}
                onChange={(e: any, expanded: any) =>
                  handleViewed(e, expanded, index, item)
                }
                TransitionProps={{ unmountOnExit: true }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel-header"
                  id={`panel-header-${index}`}
                >
                  <div className="sheets__lists__item__name">
                    <div>
                      <span className="sheets__lists__item__index">
                        Page No - {item?.drawingSequence}. &nbsp;
                      </span>
                      {/* <Tooltip title={`${item?.dwgname}`} aria-label="delete category"> */}
                      <label>
                        {item?.dwgname && item?.dwgname.length > 35
                          ? `${item?.dwgnum} ${
                              item?.dwgnum && item?.dwgname ? "-" : ""
                            } 
                                                    ${item?.dwgname.slice(
                                                      0,
                                                      32
                                                    )} . . .`
                          : `${item?.dwgnum}  
                                                    ${
                                                      item?.dwgnum &&
                                                      item?.dwgname
                                                        ? "-"
                                                        : ""
                                                    } ${item?.dwgname}`}
                      </label>
                      {/* </Tooltip> */}
                    </div>
                    <div className="sheets__lists__item__name__action">
                      {renderWarningIcon(item)}
                      <>
                        {item?.revisionInfo?.status === "viewed" ? (
                          <span className="text">
                            {item?.revisionInfo?.status}
                          </span>
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
                </AccordionSummary>
                <AccordionDetails>
                  <div className="sheets__lists__item__details">
                    <form className="sheets__lists__item__details__form">
                      <div className="responsive">
                        <table className="sheets__lists__item__details__form__table">
                          <tbody className="sheets__lists__item__details__form__table__tableBody">
                            <tr className="sheets__lists__item__details__form__table__tableBody__label">
                              {sheetInfoFields?.map((fieldData: any) => (
                                <td
                                  key={fieldData.drawingTemplateField.name}
                                  className={`${
                                    props?.templateId ===
                                      templateFormatId.BS1192_UK &&
                                    fieldData?.drawingTemplateField.name ===
                                      "drawing_number"
                                      ? "sheets__lists__item__details__form__table__hide"
                                      : ""
                                  }`}
                                >
                                  {renderSheetInfoLabel(
                                    item,
                                    index,
                                    fieldData?.drawingTemplateField
                                  )}
                                </td>
                              ))}
                            </tr>
                            <tr className="sheets__lists__item__details__form__table__tableBody__fields">
                              {sheetInfoFields?.map((fieldData: any) => (
                                <td
                                  key={fieldData.drawingTemplateField.name}
                                  className={`${
                                    props?.templateId ===
                                      templateFormatId.BS1192_UK &&
                                    fieldData?.drawingTemplateField.name ===
                                      "drawing_number"
                                      ? "sheets__lists__item__details__form__table__hide"
                                      : ""
                                  }`}
                                >
                                  {renderSheetInfoFields(
                                    item,
                                    index,
                                    fieldData?.drawingTemplateField
                                  )}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="sheets__lists__item__details__form__action">
                        {props?.templateId !== templateFormatId.US_CANADA && (
                          <div className="sheets__lists__item__details__form__action__text">
                            {item.category}
                          </div>
                        )}
                        {item.category === defaultCategory.NOT_A_DRAWING ? (
                          <Button
                            data-testid={"submit-version-review"}
                            variant="outlined"
                            className="btn-primary"
                            onClick={() =>
                              handleNotDrawingBtn(index, false, item)
                            }
                          >
                            This is a drawing
                          </Button>
                        ) : (
                          <Button
                            data-testid={"submit-version-review"}
                            variant="outlined"
                            className="btn-primary"
                            onClick={() =>
                              handleNotDrawingBtn(index, true, item)
                            }
                          >
                            This is not a drawing
                          </Button>
                        )}
                      </div>
                      {/* {
                                                sheetInfoFields?.map((fieldData: any) => (
                                                    <div key={fieldData.drawingTemplateField.name}>
                                                        {renderSheetInfoFields(item, index, fieldData?.drawingTemplateField)}
                                                    </div>
                                                ))
                                            } */}
                    </form>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
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
        <div className="add-category">
          <InputLabel required={false}>Categories </InputLabel>
          <TextField
            type="text"
            fullWidth
            autoComplete="search"
            placeholder="Enter set title"
            variant="outlined"
            value={newCategoryName}
            onChange={(e: any) =>
              handleDrawingCategory(e, currentCategoryIndex)
            }
          />
          <div className="add-category__action">
            <div className="add-category__action__cancel" onClick={handleClose}>
              Cancel
            </div>
            <Button
              type="submit"
              data-testid={"add-category"}
              variant="outlined"
              className="btn-primary"
              onClick={
                editMode
                  ? (e: any) => {
                      updateCategoryName(e, currentCategoryIndex);
                    }
                  : addNewCategory
              }
              size={"small"}
              disabled={!newCategoryName}
            >
              {editMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}

export default React.memo(DrawingSheetInfoTable);

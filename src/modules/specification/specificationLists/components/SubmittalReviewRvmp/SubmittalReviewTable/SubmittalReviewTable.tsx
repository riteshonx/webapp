
import React, { ReactElement, useEffect, useState, useContext } from "react";
import { SpecificationLibDetailsContext } from '../../../context/SpecificationLibDetailsContext';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import "./SubmittalReviewTable.scss";
import WarningIcon from "@material-ui/icons/Warning";
import InfiniteScroll from "react-infinite-scroll-component";
import Popover from '@mui/material/Popover';
import TextField from '@material-ui/core/TextField';
import Tooltip from "@material-ui/core/Tooltip";
import { setSubmittalList} from "../../../context/SpecificationLibDetailsAction";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import SubmittalReviewToast from '../SubmittalReviewToast/SubmittalReviewToast';
import { setSectionPageNum } from "../../../context/SpecificationLibDetailsAction";

export default function SubmittalReviewTable(props: any): ReactElement {

    const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
    const [elementList, setElementList] = useState<any>({});
    const [elementStyle, setElementStyle] = useState<any>({});
    const [descAnchorEl, setDescAnchorEl] = React.useState<HTMLElement | null>(null);
    const [descText, setDescText] = React.useState<string | null>('');
    const [typeAnchorEl, setTypeAnchorEl] = React.useState<HTMLElement | null>(null);
    const [contextMenu, setContextMenu] = React.useState<{mouseX: number; mouseY: number;} | null>(null);
    const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
    const [deleteMessage, setDeleteMessage] = useState<string>('');
    const [lastDeleteIndex, setLastDeleteIndex] = useState<number>(0);
    const [pageNum, setPageNum] = useState(0);
    
    useEffect(() => {
        setPageNum(0);
        fetchQuery()
        return (()=> {setElementList([]); setPageNum(0)})
    }, [props.dataInfo])

    async function fetchQuery(pageNo = 0, offset = 0, limit = 5) {
        const newList = Object.keys(props.dataInfo).slice(offset, offset + limit).reduce((result: any, key: any) => {
            result[key] = props.dataInfo[key];
            return result;
        }, {} as any);
        pageNo == 0 ? setElementList({...newList}) : setElementList({...elementList, ...newList});
        setPageNum(pageNo);
    }

    function updateSubmittal(submittal: any) {
        SpecificationLibDetailsDispatch(setSubmittalList([
            ...SpecificationLibDetailsState.submittalList.slice(0, selectedIndex), 
            {
                ...submittal,
                review: (submittal.submittal_type == "" || submittal.line_text == "") 
            },
            ...SpecificationLibDetailsState.submittalList.slice(selectedIndex + 1)
        ]));
    }

    const showDescriptionTextBox = (event: React.MouseEvent<HTMLElement>, selIndex: number) => {
        event.stopPropagation();
        setElementStyle(event.currentTarget.getBoundingClientRect());
        setSelectedIndex(selIndex);
        setDescAnchorEl(event.currentTarget);
        setDescText(SpecificationLibDetailsState.submittalList[selIndex].line_text);
    };

    const closeDescriptionTextBox = () => {
        if(descAnchorEl && descText != SpecificationLibDetailsState.submittalList[selectedIndex].line_text) {
            updateSubmittal({
                ...SpecificationLibDetailsState.submittalList[selectedIndex], 
                line_text: descText
            })
        }
        setDescAnchorEl(null);
    };

    function handleDescChange(event: any) {
        setDescText(event.target.value)
    }

    const open = Boolean(descAnchorEl);

    const showTypeTextBox = (event: React.MouseEvent<HTMLElement>, selIndex: number) => {
        event.stopPropagation();
        setElementStyle(event.currentTarget.getBoundingClientRect());
        setSelectedIndex(selIndex);
        setTypeAnchorEl(event.currentTarget);
        setDescText(SpecificationLibDetailsState.submittalList[selIndex].line_text);
        SpecificationLibDetailsDispatch(setSectionPageNum(SpecificationLibDetailsState.submittalList[selIndex].page));
    };

    const closeTypeTextBox = (newType = null) => {
        if(newType && newType != SpecificationLibDetailsState.submittalList[selectedIndex].submittal_type) {
            updateSubmittal({
                ...SpecificationLibDetailsState.submittalList[selectedIndex], 
                submittal_type: newType,
            })
        }
        setTypeAnchorEl(null);
    };

    const openSubType = Boolean(typeAnchorEl);

    const addSubmittal = (duplicate = false) => {
        const newSubmtal = duplicate ?  {...SpecificationLibDetailsState.submittalList[selectedIndex]}: 
            {...SpecificationLibDetailsState.submittalList[selectedIndex], submittal_type: null, line_text: '', review: true}; 
        SpecificationLibDetailsDispatch(setSubmittalList([...SpecificationLibDetailsState.submittalList.slice(0, selectedIndex + 1), newSubmtal, ...SpecificationLibDetailsState.submittalList.slice(selectedIndex + 1)]));
        setContextMenu(null);
    };

    const deleteSubmittal = (duplicate = false) => {
        updateSubmittal({
            ...SpecificationLibDetailsState.submittalList[selectedIndex], 
            notASubmittal: true,
        })
        setLastDeleteIndex(selectedIndex);
        setDeleteMessage(`Item ‘${SpecificationLibDetailsState.submittalList[selectedIndex].section_number}-${SpecificationLibDetailsState.submittalList[selectedIndex].submittal_type}’  has been moved to deleted items`)
        setContextMenu(null);
    };

    const restoreSubmittal = (index: number) => {
        updateSubmittal({
            ...SpecificationLibDetailsState.submittalList[selectedIndex], 
            notASubmittal: false,
        })
        setDeleteMessage('')
        setContextMenu(null);
    };

    const showOperMenu = (event: React.MouseEvent<HTMLElement>, selIndex: number) => {
        if (event.type === 'contextmenu') {
            SpecificationLibDetailsDispatch(setSectionPageNum(SpecificationLibDetailsState.submittalList[selIndex].page));
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(selIndex);
            setContextMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
        } else {
            setSelectedIndex(selIndex);
            SpecificationLibDetailsDispatch(setSectionPageNum(SpecificationLibDetailsState.submittalList[selIndex].page));
        }
    };

    const closeAllMenu = () => {
        closeDescriptionTextBox(); 
        closeTypeTextBox(); 
        setContextMenu(null);
    };

    return (
        <div className="submittal-review-table" id="scrollable_list">
            <InfiniteScroll
                dataLength={Object.keys(elementList).length}
                next={() => fetchQuery(pageNum + 1, 5 * (pageNum + 1))}
                hasMore={true}
                loader={Object.keys(elementList).length === Object.keys(props.dataInfo).length ? "" : <h4>Loading...</h4>}
                scrollableTarget="scrollable_list"
            >
                <table className="submittalTable" onClick={closeAllMenu} onContextMenu={closeAllMenu} >
                    <thead>
                        <tr className="submittalTableHead type1" key="submittalTableHead">
                            <th className="idDetails">ID</th>
                            <th className="typeDetails">Type</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(elementList).map((key: any, index: number) => {
                            return (
                                elementList[key][0] && <React.Fragment key={key}>
                                    <tr className="type1" key={key + 'div'}>
                                        <td colSpan={3}>{elementList[key][0].division_number + '-' + elementList[key][0].division_name}</td>
                                    </tr>
                                    <tr className="type2"  key={key + 'spec'}>
                                        <td className="idDetails">{elementList[key][0].section_number}</td>
                                        <td colSpan={2}>{elementList[key][0].section_name}</td>
                                    </tr>
                                    {elementList[key].map((submittal: any, index: number) => {
                                        return (
                                            <tr onClick={(e) => showOperMenu(e, submittal.uniqueIndex)} 
                                                onContextMenu={(e) => showOperMenu(e, submittal.uniqueIndex)} 
                                                style={selectedIndex ===  submittal.uniqueIndex ? {border: '1.5px solid #000000'} : {}}
                                                className={submittal.review && 'invalidRow type3' || 'type3'} key={key + index} 
                                            >
                                                <td className="idDetails">{submittal.review && 
                                                <Tooltip title={"Fix submittal type"} aria-label="delete category">
                                                    <WarningIcon className="error" />
                                                    </Tooltip>}</td>
                                                <td onClick={(e) => showTypeTextBox(e, submittal.uniqueIndex)} className="typeDetails" >
                                                    <div className="dropDown">
                                                        {submittal.submittal_type} 
                                                        <ArrowDropDownIcon fontSize={'small'} />
                                                    </div>
                                                </td>
                                                <td onDoubleClick={(e) => showDescriptionTextBox(e, submittal.uniqueIndex)}>{submittal.line_text}</td>
                                            </tr>
                                        )
                                    })}
                                </React.Fragment>
                            )
                        })}
                        {(Object.keys(elementList).length === 0) && <tr><td colSpan={3}>{props.isErrorType ? 'No issues found.' :'No sections found.'}</td></tr>}
                    </tbody>
                </table>
            </InfiniteScroll>
            <Popover
                open={open}
                anchorEl={descAnchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                onClose={closeDescriptionTextBox}
                PaperProps={{style: { width: elementStyle?.width , height: elementStyle?.height},}}
            >
                <TextField
                    onKeyDown={(e: any) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                            closeDescriptionTextBox();
                        }
                    }}
                    onChange={handleDescChange}
                    size={"small"}
                    value={descText}
                    required={true} fullWidth={true} variant="outlined"
                    multiline
                />
            </Popover>
            <Menu
                id="basic-menu"
                anchorEl={typeAnchorEl}
                open={openSubType}
                onClose={() => closeTypeTextBox()}
                MenuListProps={{
                'aria-labelledby': 'basic-button',
                }}
                PaperProps={{
                    style: {
                      maxHeight: 200,
                      width: elementStyle?.width,
                      overflowX: 'auto'
                    },
                }}
            >
                {props.submittalTypes.map((item: any, index: number) => {
                   return  <MenuItem key={item.id} className={"submitalMenuText"} style= {{width: elementStyle?.width}} onClick={() =>closeTypeTextBox(item.nodeName)}>{item.nodeName}</MenuItem>
                })}
            </Menu>
            <Menu
                open={contextMenu !== null}
                id="operation-menu"
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                onClose={() => setContextMenu(null)}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem key={"add"} className={"submitalOprText"}  onClick={() =>addSubmittal()}>Add Item Below</MenuItem>
                <MenuItem key={"duplicate"} className={"submitalOprText"}  onClick={() =>addSubmittal(true)}>Duplicate</MenuItem>
                <MenuItem key={"delete"} className={"submitalOprText"}  onClick={() =>deleteSubmittal()}>Delete</MenuItem>
            </Menu>
            <SubmittalReviewToast linkText="Undo" linkFunction={restoreSubmittal} paramter={lastDeleteIndex} message={deleteMessage}/>
        </div>
    );
}

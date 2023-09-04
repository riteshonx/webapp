import React, { useContext, useState, useEffect } from 'react';
import './SheetForm.scss'
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { bimContext } from '../../../../contextAPI/bimContext';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import { setActiveGeometryName } from '../../../../contextAPI/action';

interface GeometryInfo {
  name: string;
  database: string;
  default: boolean;
  geometry: [string]
}

export default function SheetForm(props: any) {
    const { dispatch, state }:any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [sheetList, setSheetList] = useState<GeometryInfo[]>([]);
    const [seltdSheet, setSeltdSheet] = useState('');
    const [focusedSheetIndx, setFocusedSheetIndx] = useState(0);

    useEffect(() => {
        setSeltdSheet(context.state.activeGeometryName);
        const shtLst = context.state.geometryInfo.filter((info: any) => info.name.includes('Sheet'))
        setSheetList(shtLst)
        selectSheet(shtLst[0].name, 0)
    }, [])

    const selectSheet = (name: string, index: number) => {
        setSeltdSheet(name);
        setFocusedSheetIndx(index);
        context.dispatch(setActiveGeometryName(name))
        document.getElementById('sheetbdy')?.focus();
    }

    const updateSheetName = (name: string) => {
        return name.replace('Sheets\\','')
    }

    const onKeyPressed = (e: any) => {
        if (e.keyCode == '38') {
            focusedSheetIndx > 0 && setFocusedSheetIndx(focusedSheetIndx - 1)
        } else if (e.keyCode == '40') {
            focusedSheetIndx < sheetList.length - 1 && setFocusedSheetIndx(focusedSheetIndx + 1)
        }  else if (e.keyCode == '13') {
            selectSheet(sheetList[focusedSheetIndx].name, focusedSheetIndx)
        }
    }   

    return (
      <div className="bimSheetFormContainer">
        <div className="bimSheetForm">
          <div className="sheetBody" onKeyDown={(e) =>onKeyPressed(e)}>
            <div className="heading blodText1">
              <Tooltip title="Back to Views" aria-label="Back to Views">
                <span
                  className="backButton"
                  onClick={() => props.showSheetWindw(false)}
                >
                  Views
                </span>
              </Tooltip>
              <ArrowForwardIosIcon
                viewBox={'-4 0 24 24'}
                fontSize={'small'}
                className="menuButton"
              />
              By Sheet
            </div>
            <List component="nav" className="sheetList" tabIndex={0} id='sheetbdy'>
              {sheetList.map((sheet: any, index: number) => {
                return (
                  <ListItem
                    key={sheet.name}
                    selected={seltdSheet === sheet.name}
                    onClick={() => selectSheet(sheet.name, index)}
                    className={`${focusedSheetIndx === index && 'focused'}`}
                    onMouseOver={() => setFocusedSheetIndx(index)}
                  >
                    <ListItemText primary={updateSheetName(sheet.name)} />
                  </ListItem>
                );
              })}
            </List>
          </div>
        </div>
      </div>
    );
}

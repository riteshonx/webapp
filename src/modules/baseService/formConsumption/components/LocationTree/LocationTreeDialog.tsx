import { Button, Checkbox, Dialog, DialogActions, DialogContent, IconButton } from '@material-ui/core';
import React, { ReactElement, useCallback } from 'react'
import { LocationNode } from '../../../projectSettings/models/location';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import './LocationTree.scss'; 
import LocationSubTree from '../LocationSubTree/LocationSubTree';

function LocationTreeDialog(props: any): ReactElement {
    
    const renderChildNodes=useCallback(() => {
        return(
        props.locationItemList.map((item: LocationNode, itemindex: number)=>
            <div key={item.id}>
                <div className="LocationTree__dialog__body__item">
                {item.childNodes.length>0?(
                    item.isOpen?(<IconButton className="LocationTree__dialog__body__item__btn" onClick={()=>props.toggleChildView(itemindex)}>
                    <ExpandMoreIcon/>
                </IconButton>):((<IconButton className="LocationTree__dialog__body__item__btn" onClick={()=>props.toggleChildView(itemindex)}>
                    <ChevronRightIcon/>
                </IconButton>))
                ):("")}
                    <Checkbox
                            color="default"
                            checked={item.id=== props.currentValue}
                            onChange={()=>props.handleChange(item.id)}
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                    <div className="LocationTree__dialog__body__item__label">
                            {item.nodeName}
                    </div>
                </div>
                {item.isOpen && (
                    <LocationSubTree index={itemindex} item={item}/>      
                )}
            </div>))
        },
        [props.locationItemList, props.currentValue],
    )

    return (
        <Dialog className="LocationTree__dialog"
            fullWidth={true}
            maxWidth={"md"}
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="max-width-dialog-title"
        >
            <div className="LocationTree__dialog__title" id="max-width-dialog-title">Select your list item</div>
            <DialogContent className="LocationTree__dialog__body">
            {props.open?renderChildNodes():""}
            </DialogContent>
            <DialogActions className="LocationTree__dialog__action">
                <Button onClick={props.handleClose} className="btn-secondary">
                    Cancel
                </Button>
                <Button onClick={props.saveChanges} className="btn-primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default LocationTreeDialog

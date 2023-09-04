import { Button, Dialog, DialogActions, DialogContent, TextField } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react'
import './CustomIndexCell.scss';

interface Props {
    indexCaption: string;
    isEditOpen: boolean;
    cancel:()=> void;
    save:(argPayload: any)=> void;
}

export interface Params {
    id: string;
}

function CustomIndexCell({indexCaption, isEditOpen, cancel, save}: Props): ReactElement {
    const [caption, setCaption] = useState('');
    const [isCaptionRequired, setIsCaptionRequired] = useState(false);
   
    useEffect(() => {
       if(indexCaption){
        setCaption(indexCaption);
       }
    }, [indexCaption])


    const handleClose=()=>{
        cancel();
    }

    const saveChanges=()=>{
       save({caption: caption.trim()});
    }

    const changeInCaption=(e: any)=>{
        setCaption(e.target.value);
        if(!e.target.value.trim()){
            setIsCaptionRequired(true);
        } else{
            setIsCaptionRequired(false);
        }
    }

    const onCaptionInputBlur=(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setIsCaptionRequired(true);
        } else{
            setIsCaptionRequired(false);
        }
    }


    return (
        <div className="CustomIndexCell">
            <Dialog className="CustomIndexCell__dialog"
                    fullWidth={true}
                    maxWidth={"xs"}
                    open={isEditOpen}
                    onClose={handleClose}
                    aria-labelledby="max-width-dialog-title"
                >
                    {/* <div className="CustomIndexCell__dialog__title" id="max-width-dialog-title">Select your list item</div> */}
                    <DialogContent className="CustomIndexCell__dialog__body">
                        <div className="CustomIndexCell__dialog__body__item">
                            <label className="CustomIndexCell__dialog__body__item__label">Caption</label>
                            <TextField id="outlined-basic"  variant="outlined" value={caption} 
                                placeholder="Caption"
                                autoFocus={true}
                                onBlur={(e)=>onCaptionInputBlur(e)}
                                onChange={(e:any)=>changeInCaption(e)} />
                           {isCaptionRequired?<label className="CustomIndexCell__dialog__body__item__error">
                                Caption is required</label>:("")}
                        </div>
                    </DialogContent>
                    <DialogActions className="CustomIndexCell__dialog__action">
                        <Button onClick={handleClose} className="btn-secondary">
                            Cancel
                        </Button>
                        <Button onClick={saveChanges} className="btn-primary" disabled={isCaptionRequired}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
        </div>
    )
}

export default CustomIndexCell;

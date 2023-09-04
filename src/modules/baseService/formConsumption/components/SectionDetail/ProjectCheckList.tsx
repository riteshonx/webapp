import React,{useState} from "react";
import Tooltip from '@mui/material/Tooltip';
import Button from "@material-ui/core/Button";
import {Questionaire} from './Questionaire'
import './ProjectCheckList.scss';


interface Props{
    checkListItem:checkListItemDetail
}

interface checkListItemDetail{
    id:number;
    title:string;
    questions:QuestionDetail[]
}

interface QuestionDetail{
    id: number,
    question: string,
    answers: string,
    selectedAnswer: string|null
}

export const ProjectCheckList = (props:Props):React.ReactElement =>{
    const [open, setOpen] = useState<boolean>(false)
    const handleClose = ()=>{
        setOpen(false)
    }

    const handlDetailClick = ()=>{
        setOpen(true)
    }
    return(
        <React.Fragment>
       <div className = "project__checklist">
        <Tooltip placement="top" title={props?.checkListItem?.title}>
        <p  className="project__checklist__title">{props?.checkListItem?.title.length > 40 ? props?.checkListItem?.title.slice(0, 40) + '...' : props?.checkListItem?.title}</p>
        </Tooltip>
        <Button
        variant="outlined"
        className="btn-primary project__checklist__detailsButton"
        onClick = {handlDetailClick}
        >
        Details
        </Button>
       </div>
       {
            open && <Questionaire 
                     open={open} 
                     id={props?.checkListItem?.id} 
                     questionDetail={props?.checkListItem?.questions} 
                     handleClose={handleClose}
                     sectionTitle={props?.checkListItem?.title}
                     />
        }
        </React.Fragment>
    )
}
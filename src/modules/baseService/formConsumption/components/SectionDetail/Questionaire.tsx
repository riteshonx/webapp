import React from "react";
import { Dialog, DialogContent } from "@material-ui/core";
import Radio from "@mui/material/Radio";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import CloseIcon from "@mui/icons-material/Close";
import "./Questionaire.scss";
import moment from "moment";

interface Props {
  id: number;
  open: boolean;
  handleClose: any;
  sectionTitle: string;
  questionDetail: QuestionDetail[];
}

interface QuestionDetail {
  id: number;
  question: string;
  answers: string;
  selectedAnswer: string | null;
}
const ANSWER = {
  NO: "false",
  YES: "true",
  NULL: "null",
  NA: "na",
};

const ANSWER__TYPE = {
  TEXT: "text",
  DATE: "date",
  SLASH: "/"
}

export const Questionaire = (props: Props): React.ReactElement => {
  const renderQuestionDetail = () => {
    return (
      props.questionDetail.length > 0 &&
      props.questionDetail.map((questionInfo: QuestionDetail) => {
        return (
          <div
            key={questionInfo?.id}
            className="questionaire__dialog__body__questionWrapper"
          >
            <FormControl className="questionaire__dialog__body__questionWrapper__question">
              <FormLabel id="demo-radio-buttons-group-label">
                Question: <span>{questionInfo?.question}</span>
              </FormLabel>
              <div className="questionaire__dialog__body__questionWrapper__question__container">
                <p>Answer:</p>
                {answerType(questionInfo)}
              </div>
            </FormControl>
          </div>
        );
      })
    );
  };
  const answerType = (answer: any) => {
    const currentAnswer = answer.selectedAnswer == null ? "na" : answer.selectedAnswer

    if (answer.answers.includes("/")) {
      return checkdefaultAnswerType(answer)
    } else {
      switch (answer.answers) {
        case ANSWER__TYPE.TEXT: {
          return <input type={answer.answers} value={currentAnswer} readOnly />
        }
        case ANSWER__TYPE.DATE: {
          const date = moment(currentAnswer)
          const formatedDate = date.format('YYYY-MM-DD')
          return <><input type={answer.answers} value={formatedDate} readOnly /> <CalendarMonthIcon style={{ fontSize: "25px", color: "grey" }} /></>
        }
        default: return <input type={answer.answers} value={currentAnswer} readOnly />
      }
    }

  }

  function customSplit(answers:string) {
    // Split the string using a regular expression that matches a slash not surrounded by spaces
    const splitArray = answers.split(/(?<!\s)\/(?!$|\s)/);
    return splitArray;
  }

  
  const checkdefaultAnswerType = (answer: any) => {
    const splitValues = customSplit(answer.answers)
    splitValues.push("n/a")
    return splitValues.map((item: string) => renderMultipleOptionAnswer(item, answer.selectedAnswer))
  }

  const refactorValue = (item: string) => {
    switch (item) {
      case "yes": {
        return 'true'
      }
      case "pass": {
        return 'true'
      }
      case "no": {
        return "false"
      }
      case "fail": {
        return "false"
      }
      case "n/a": {
        return "na"
      }
      default: return item
    }
  }

  const renderMultipleOptionAnswer = (item: any, selectedAnswer: string | null) => {
    return <RadioGroup
      className="questionaire__dialog__body__questionWrapper__answer"
      aria-labelledby="question-label"
      defaultValue={selectedAnswer}
      name="questions"
      row
      value={selectedAnswer}
    >
      <FormControlLabel
        disabled
        value={refactorValue(item)}
        control={<Radio />}
        label={item}
      />
    </RadioGroup>
  };
  return (
    <React.Fragment>
      <Dialog
        className="questionaire__dialog"
        fullWidth={true}
        maxWidth={"md"}
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <div className="questionaire__dialog__header">
          <h2
            className="questionaire__dialog____header__title"
            id="max-width-dialog-title"
          >
            <span>{props?.sectionTitle}</span>
          </h2>
          <CloseIcon
            fontSize="large"
            onClick={props.handleClose}
            className="questionaire__dialog____header__closeIcon"
          />
        </div>
        <hr className="questionaire__dialog__underline"></hr>
        <DialogContent className="questionaire__dialog__body">
          {renderQuestionDetail()}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

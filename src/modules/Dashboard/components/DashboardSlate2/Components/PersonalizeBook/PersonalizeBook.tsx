import React, { useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { IconButton } from "@material-ui/core";
import "./PersonalizeBook.scss";
import Page1 from "./Page1/Page1";
import Page2 from "./Page2/Page2";
import Page3 from "./Page3/Page3";
import Page4 from "./Page4/Page4";
import Page5 from "./Page5/Page5";
import Page6 from "./Page6/Page6";

interface PersonalizeBookProps {
  persona: any;
  userPersona: any;
  handlePersonaSelection: any;
}

const Page = React.forwardRef((props: any, ref: any) => {
  return (
    <div className="personalizeBook-main__demoPage" ref={ref}>
      {props.children}
    </div>
  );
});

const PersonalizeBook = ({
  persona,
  userPersona,
  handlePersonaSelection,
}: PersonalizeBookProps): React.ReactElement => {
  const book: any = useRef();

  return (
    <div className="personalizeBook-main">
      <IconButton
        onClick={() => book.current.pageFlip().flipPrev()}
        className="personalizeBook-main__prevIconContainer"
      >
        <ArrowBackIosIcon className="personalizeBook-main__icon" />
      </IconButton>
      <div className="personalizeBook-main__bookContainer">
        <HTMLFlipBook
          ref={book}
          width={300}
          height={600}
          size={"stretch"}
          disableFlipByClick={true}
        >
          <Page>
            <Page1 persona={persona} />
          </Page>
          <Page>
            <Page2 />
          </Page>
          <Page>
            <Page3 persona={persona} />
          </Page>
          <Page>
            <Page4 />
          </Page>
          <Page>
            <Page5 />
          </Page>
          <Page>
            <Page6
              persona={persona}
              userPersona={userPersona}
              handlePersonaSelection={handlePersonaSelection}
            />
          </Page>
        </HTMLFlipBook>
      </div>
      <IconButton
        onClick={() => book.current.pageFlip().flipNext()}
        className="personalizeBook-main__nextIconContainer"
      >
        <ArrowForwardIosIcon className="personalizeBook-main__icon" />
      </IconButton>
    </div>
  );
};

export default PersonalizeBook;

import { Button } from "@material-ui/core";
import React, { ReactElement } from "react";
import { useHistory } from "react-router-dom";
import "./PageNotFound.scss";

function PageNotFound(): ReactElement {
  const history = useHistory();

  const backtoHome = () => {
    history.push("/");
  };

  return (
    <div className="PageNotFound">
      <div className="PageNotFound__message">
        We can't find the page you're looking for
      </div>
      <Button className="btn-primary" onClick={backtoHome}>
        Go to home page
      </Button>
    </div>
  );
}

export default PageNotFound;

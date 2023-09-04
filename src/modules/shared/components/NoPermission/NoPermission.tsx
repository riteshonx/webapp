import React, { ReactElement } from "react";
import Header from "../Header/Header";
import NoDataMessage from "../NoDataMessage/NoDataMessage";
import "./NoPermission.scss";

interface Props {
  noPermissionMessage: string;
  header: string;
  navigateBack: () => void;
}

function NoPermission({
  noPermissionMessage,
  navigateBack,
  header,
}: Props): ReactElement {
  return (
    <div className="NoPermission">
      <div className="NoPermission____header">
        <Header header={header} navigate={navigateBack} />
      </div>
      <div className="no-permission">
        <NoDataMessage message={noPermissionMessage} />
      </div>
    </div>
  );
}

export default NoPermission;

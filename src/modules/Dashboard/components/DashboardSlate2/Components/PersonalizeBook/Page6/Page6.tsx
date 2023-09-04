import React, { useEffect, useState } from "react";
import { decodeExchangeToken } from "src/services/authservice";
import "./Page6.scss";

interface Page6Props {
  persona: any;
  userPersona: any;
  handlePersonaSelection: any;
}

const Page6 = ({
  persona,
  userPersona,
  handlePersonaSelection,
}: Page6Props): React.ReactElement => {
  const [checked, setChecked]: any = useState(false);

  useEffect(() => {
    setChecked(persona?.id === userPersona?.personaId);
  }, [persona, userPersona]);
  return (
    <div className="personalizeBook-main-page6">
      <div className="personalizeBook-main-page6__container">
        <div className="personalizeBook-main-page6__container__content1">
          <div>{decodeExchangeToken().userName}</div>
          {persona?.name}
        </div>
        <div className="personalizeBook-main-page6__container__content2">
          <input
            className="personalizeBook-main-page6__container__content2__input"
            type="checkbox"
            checked={checked}
            onChange={() => {
              setChecked(!checked);
              if (
                (persona?.id === userPersona?.personaId && checked) ||
                persona?.id !== userPersona?.personaId
              ) {
                handlePersonaSelection(!checked);
              }
            }}
          />
          <label>Experience Slate as {persona?.name}</label>
        </div>
      </div>
    </div>
  );
};

export default Page6;

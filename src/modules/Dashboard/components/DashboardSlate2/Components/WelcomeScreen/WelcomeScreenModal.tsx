import React, { useContext, useEffect, useState } from "react";
import { Dialog, IconButton, makeStyles } from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import bg from "../../../../../../assets/images/11.png";
import slateWhiteLogo from "../../../../../../assets/images/logoWhite.png";
import "./WelcomeScreenModal.scss";
import Screen1 from "./Screen1";
import Screen2 from "./Screen2";
import Screen3 from "./Screen3";
import Screen4 from "./Screen4";
import { Close } from "@material-ui/icons";
import PersonalizeBook from "../PersonalizeBook/PersonalizeBook";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { client } from "src/services/graphql";
import {
  GET_PERSONAS,
  GET_USER_PERSONA,
  UPDATE_USER_PERSONA,
} from "../../../../graphql/queries/dashboard";
import { decodeExchangeToken, decodeToken } from "src/services/authservice";
import Notify, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { GET_USER_DETAILS } from "src/modules/baseService/teammates/queries";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 180,
    height: 250,
    backgroundImage: `url(${bg})`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    transition: "transform 0.15s ease-in-out",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: 10,
    marginRight: "1rem",
  },
  cardHovered: {
    transform: "scale3d(1.05, 1.05, 1)",
  },
  actions: {
    color: "#fff",
  },
  dialogPaper: {
    maxHeight: "90%",
    minHeight: "90%",
    minWidth: "90%",
    maxWidth: "90%",
    overflow: "hidden",
  },
}));

function WelcomeScreenModal(props: any): React.ReactElement {
  const classes = useStyles();
  const updateUserDetailsRole = "updateMyUser";
  const [screens, setScreens] = useState(1);
  const [personas, setPersonas] = useState([]);
  const { state } = useContext(stateContext);
  const [selectedPersona, setSelectedPersona]: any = useState(null);
  const [userPersona, setUserPersona]: any = useState(null);
  const [userDetails, setUserDetails] = useState();
  useEffect(() => {
    state?.selectedProjectToken && getPersonas();
    state?.selectedProjectToken && getUserPersona();
    getUserData();
  }, [state?.selectedProjectToken]);

  const getUserData = async () => {
    const userId = decodeToken().userId;
    try {
      const userDetailsResponse = await client.query({
        query: GET_USER_DETAILS,
        variables: {
          userId,
        },
        fetchPolicy: "network-only",
        context: {
          role: updateUserDetailsRole,
        },
      });
      const userDataList = userDetailsResponse.data.tenantAssociation;
      if (userDataList?.length) {
        setUserDetails(userDataList[0].user);
      }
    } catch {
      console.error("Error occurred while fetching user details");
    }
  };

  const getPersonas = async () => {
    try {
      const response = await client.query({
        query: GET_PERSONAS,
        fetchPolicy: "network-only",
        context: { role: "updateMyUser", token: state?.selectedProjectToken },
      });
      setPersonas(response?.data?.persona);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserPersona = async () => {
    try {
      const response = await client.query({
        query: GET_USER_PERSONA,
        fetchPolicy: "network-only",
        variables: {
          userId: decodeExchangeToken().userId,
          projectId: state.currentProject?.projectId,
        },
        context: { role: "updateMyUser", token: state?.selectedProjectToken },
      });
      setUserPersona(response?.data?.projectAssociation[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const updatePersonaForUser = async (personaId: any) => {
    try {
      await client.mutate({
        mutation: UPDATE_USER_PERSONA,
        variables: {
          personaId: personaId,
          userId: decodeExchangeToken().userId,
          projectId: state.currentProject?.projectId,
        },
        context: { role: "updateMyUser", token: state?.selectedProjectToken },
      });
      getUserPersona();
      setScreens(4);
      Notify.sendNotification(
        "Persona changed successfully!",
        AlertTypes.success
      );
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePersonaSelection = (isSelected: any) => {
    if (isSelected) {
      updatePersonaForUser(selectedPersona?.id);
    } else {
      updatePersonaForUser(null);
    }
  };

  const handleCardClick = (persona: any) => {
    setSelectedPersona(persona);
    setScreens(5);
  };

  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      open={props.open}
      className="welcomeScreenModal-main"
    >
      <IconButton
        className="welcomeScreenModal-main__closeBtn"
        onClick={() => {
          props.handleClose();
          setScreens(1);
        }}
      >
        <Close className="welcomeScreenModal-main__closeBtn__icon" />
      </IconButton>

      {screens !== 5 && (
        <div className="welcomeScreenModal-main__logoMain">
          <img
            src={slateWhiteLogo}
            className="welcomeScreenModal-main__logoMain__img"
          />
        </div>
      )}
      {screens === 5 && (
        <PersonalizeBook
          userPersona={userPersona}
          persona={selectedPersona}
          handlePersonaSelection={handlePersonaSelection}
        />
      )}

      <div
        style={{
          backgroundColor: screens === 4 || screens === 5 ? "#FBC30A" : "",
        }}
        className="welcomeScreenModal-main__screenContainer"
      >
        {screens === 1 ? (
          <Screen1 persona={userPersona?.persona} setScreens={setScreens} />
        ) : screens === 2 ? (
          <Screen2 userDetails={userDetails} />
        ) : screens === 3 ? (
          <Screen3 />
        ) : screens === 4 ? (
          <Screen4
            handleCardClick={handleCardClick}
            personas={personas}
            userPersona={userPersona}
          />
        ) : (
          <></>
        )}
        {screens > 1 && (
          <IconButton
            className="welcomeScreenModal-main__prev"
            onClick={() => {
              screens > 1 && setScreens(screens - 1);
            }}
          >
            <ArrowBackIcon className={"welcomeScreenModal-main__prev__icon"} />
          </IconButton>
        )}
        {screens <= 3 && (
          <IconButton
            className={"welcomeScreenModal-main__next"}
            onClick={() => {
              screens <= 3 && setScreens(screens + 1);
            }}
          >
            <ArrowForwardIcon
              className={"welcomeScreenModal-main__next__icon"}
            />
          </IconButton>
        )}
      </div>
    </Dialog>
  );
}

export default WelcomeScreenModal;

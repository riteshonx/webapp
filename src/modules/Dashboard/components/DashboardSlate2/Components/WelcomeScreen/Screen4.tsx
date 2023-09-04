import { Card, Tooltip, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { UPDATE_USER_PERSONA } from "src/modules/Dashboard/graphql/queries/dashboard";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import Notify, { AlertTypes } from "src/modules/shared/components/Toaster/Toaster";
import { decodeExchangeToken } from "src/services/authservice";
import { client } from "src/services/graphql";
const initialSelectedPersona = {
  open: false,
  item: ''
} as any
function Screen4({ handleCardClick, personas, userPersona }: any) {
  const [selectedPersona, setSelectedPersona] = React.useState(initialSelectedPersona)
  const { state } = useContext(stateContext);
  const handleClickPersonalCard = (item: any) => {
    if (userPersona?.personaId !== item?.id) {
      setSelectedPersona({
        ...selectedPersona, open: true, item: item
      })
    }
    else{
      setSelectedPersona({
        ...selectedPersona, open: false, item: item
      })
    }

  }
  const selectedPersonaCard = () => {
    if (selectedPersona?.item?.id) {
      updatePersonaForUser(selectedPersona?.item?.id)
    }
  }
  const currentPersona = () => {
    const currentPersonas = personas.filter((item: any) => userPersona?.personaId === item?.id)
    return currentPersonas[0]?.name
  }

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
      Notify.sendNotification(
        "Persona changed successfully!",
        AlertTypes.success
      );
      setSelectedPersona(initialSelectedPersona)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="welcomeScreenModal-main__screen4-container">
        <span className={"welcomeScreenModal-main__screen4-container__text1"}>
          Here’s what you can experience in Slate.
        </span>
        <span className={"welcomeScreenModal-main__screen4-container__text2"}>
          We support multiple personas. What may we interest you with!
        </span>
        <div className="welcomeScreenModal-main__screen4-container__content">
          {personas?.map((item: any, i: any) => (
            <div
              className={
                "welcomeScreenModal-main__screen4-container__content__main"
              }
            >
              <Card
                style={{
                  boxShadow:
                    userPersona?.personaId === item?.id
                      ? "0 4px 8px 0 rgba(0, 0, 0, 0.5), 0 6px 20px 0 rgba(0, 0, 0, 0.5)"
                      : "",
                  border:
                    userPersona?.personaId === item?.id
                      ? "0.5px solid lightgrey"
                      : "",
                }}
                className={
                  "welcomeScreenModal-main__screen4-container__content__main__card" +
                  i
                }
                onClick={() => handleClickPersonalCard(item)}
                key={item.id}
              >
                {item?.name?.length > 25 ? (
                  <Tooltip title={item?.name}>
                    <Typography
                      className={`welcomeScreenModal-main__screen4-container__content__main__card${i}__text1 ${userPersona?.personaId === item?.id &&
                        `welcomeScreenModal-main__screen4-container__content__main__card${i}__text1__active`
                        }`}
                      gutterBottom
                      variant="h5"
                      component="h2"
                    >
                      {`${item?.name?.slice(0, 22)}...`}{" "}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography
                    className={`welcomeScreenModal-main__screen4-container__content__main__card${i}__text1 ${userPersona?.personaId === item?.id &&
                      `welcomeScreenModal-main__screen4-container__content__main__card${i}__text1__active`
                      }`}
                    gutterBottom
                    variant="h5"
                    component="h2"
                  >
                    {item?.name}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  component="p"
                  className={`welcomeScreenModal-main__screen4-container__content__main__card${i}__text2 ${userPersona?.personaId === item?.id &&
                    `welcomeScreenModal-main__screen4-container__content__main__card${i}__text2__active`
                    }`}
                >
                  {item?.description}
                </Typography>
                {userPersona?.personaId !== item?.id ? (
                  <div
                    className={
                      "welcomeScreenModal-main__screen4-container__content__main__card" +
                      i +
                      "__div"
                    }
                  ></div>
                ) : null}
              </Card>
              {userPersona?.personaId === item?.id ? (
                <div
                  className={
                    "welcomeScreenModal-main__screen4-container__content__main__selected"
                  }
                >
                  Selected Persona
                </div>
              ) : null}
            </div>
          ))}
        </div>
        {
          selectedPersona?.open &&
          <div className={"welcomeScreenModal-main__screen4-container__text1 persona_dailog_container"}>
            <span>
              Are you sure you want to change your persona from {currentPersona()} to {selectedPersona?.item?.name} ?
            </span>
            <div className={"welcomeScreenModal-main__screen4-container__text2"}>
              <button
                className="persona_dialog_button"
                onClick={() => selectedPersonaCard()}
              >
                Yes
              </button>
              <button
                className="persona_dialog_button"
                onClick={() => setSelectedPersona(initialSelectedPersona)}
              >
                No
              </button>
            </div>
          </div>
        }

      </div>
    </>
  );
}

export default Screen4;

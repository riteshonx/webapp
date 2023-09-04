import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { setPreference } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import a7 from "../../../../../../assets/images/welbg.png";

const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];

function Screen3(): React.ReactElement {
  const { dispatch, state }: any = useContext(stateContext);

  const construction = [
    "dezeen",
    "RICSnews",
    // "BuildingNews",
    // "TCIndex",
    // "CNplus",
    // "NAHBhome",
    // "AGCofA",
    // "AGCBuildingDiv",
    // "NAHBRemodelers",
    // "Arch2030",
    // "AIANational",
    // "ArchDaily",
    // "USGBC",
    // "Architizer",
    // "aec",
  ];

  const technology = [
    "ribaArchitecture",
    "ktom17",
    // "EquipmentToday",
    // "ConstructionGL",
    // "ecmweb",
  ];

  const [twitterOptions, setTwitterOptions] = useState([
    {
      label: "Construction Insights",
      value: construction,
      isChecked: state?.selectedPreference?.twitter
        ?.join()
        .includes(construction?.join()),
    },
    {
      label: "Government Regulations",
      value: ["BuildingLaw"],
      isChecked: state?.selectedPreference?.twitter
        ?.join()
        .includes(["BuildingLaw"]?.join()),
    },
    {
      label: "Technology",
      value: technology,
      isChecked: state?.selectedPreference?.twitter
        ?.join()
        .includes(technology?.join()),
    },
    {
      label: "Competition",
      value: ["autodesk"],
      isChecked: state?.selectedPreference?.twitter
        ?.join()
        .includes(["autodesk"]?.join()),
    },
  ]);

  const savePreference = async (data: any) => {
    let twitterHandles: any = [];
    data
      ?.filter(({ isChecked }: any) => isChecked)
      ?.forEach(({ value }: any) => {
        twitterHandles = [...twitterHandles, ...value];
      });

    const payload = {
      tenantId: Number(decodeExchangeToken().tenantId),
      userId: decodeExchangeToken().userId,
      preferencesJson: {
        ...state?.selectedPreference,
        twitter: twitterHandles,
      },
    };
    const token = getExchangeToken();
    try {
      const response = await axios.post(
        `${DASHBOARD_URL}dashboard/savePreferences`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        dispatch(setPreference(payload.preferencesJson));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTwitterOptionChange = (i: any) => {
    setTwitterOptions((prevState: any) => {
      const temp = [...prevState];
      temp[i].isChecked = !temp[i].isChecked;
      console.log("prevState", temp);
      savePreference(temp);
      return temp;
    });
  };

  return (
    <div className="welcomeScreenModal-main__screen3-container">
      <div className="welcomeScreenModal-main__screen3-container__imgMain">
        <img
          src={a7}
          className="welcomeScreenModal-main__screen3-container__imgMain__img"
        />
      </div>
      <div className="welcomeScreenModal-main__screen3-container__content">
        <span
          className={
            "welcomeScreenModal-main__screen3-container__content__text1"
          }
        >
          Slate Offers rich industry insights
        </span>
        <span
          className={
            "welcomeScreenModal-main__screen3-container__content__text2"
          }
        >
          What may we interest you with
        </span>
        <div>
          {twitterOptions?.map((option: any, index: number) => (
            <div
              key={index}
              className={
                "welcomeScreenModal-main__screen3-container__content__div1"
              }
            >
              <input
                type="checkbox"
                checked={option.isChecked}
                onChange={() => handleTwitterOptionChange(index)}
              />
              <label>{option?.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Screen3;

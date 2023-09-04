import { Alert } from "@mui/material";
import FullMapViewContainer, { Equipment } from "./FullMapViewContainer";
import {
  useEffect,
  useState,
  createContext,
  SetStateAction,
  Dispatch,
} from "react";
import { slateLogo } from "./settings";
import { useSubscription, ApolloError } from "@apollo/client";
import EquipmentDataSubscriptionGQL from "./EquipmentDataSubscriptionGQL";
import { getProjectExchangeToken } from "src/services/authservice";
import { MasterMaterialRoles } from "src/utils/role";

interface EquipmentsMapContextProps {
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
}

export const EquipmentsMapContext = createContext<EquipmentsMapContextProps>({
  selectedIndex: 0,
  setSelectedIndex: () => {
    // do nothing.
  },
});

// @todo need fix the project token issue

export default function EquipmentsMapIndex() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  let data: { equipmentData: [] } | undefined, error: ApolloError | undefined;
  let loading = true;

  try {
    const role = {'tenant': MasterMaterialRoles.read};
    sessionStorage.setItem("X-Hasura-Role", JSON.stringify(role));
    ({ data, loading, error } = useSubscription(EquipmentDataSubscriptionGQL));
    // console.log(data, loading, error);
  } catch (e) {
    console.error(e);
    return null;
  }

  useEffect(() => {
    if (!data) return;
    error && console.error(error);
    setEquipments(data?.equipmentData);
    // console.log("useEffect", data.equipmentData);
  }, [data]);

  if (loading) return null;

  if (error) {
    // @note project redirection programmally is not avaiable yet.
    if (!getProjectExchangeToken())
      return (
        <Alert severity="error" style={{ fontSize: "1.4rem" }}>
          Project authorization failed. Please visit the project page first.
        </Alert>
      );

    // @todo should update the fontsize to normal standard
    return (
      <Alert severity="error" style={{ fontSize: "1.4rem" }}>
        Something goes wrong, please check back again later.
      </Alert>
    );
  }

  return (
    <EquipmentsMapContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
      }}
    >
      <FullMapViewContainer equipments={equipments} />
    </EquipmentsMapContext.Provider>
  );
}

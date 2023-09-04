import axios from "axios";
import { AuthState } from "src/modules/root/context/authentication/authContext";
import { Authentication } from "src/modules/root/context/authentication/reducer";
import { getExchangeToken } from "./authservice";

export async function genProfilioDetails({isLoading, currentPortfolio}: AuthState) {
  if (isLoading || !currentPortfolio.portfolioId) return;
  const token = getExchangeToken();

    try {
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getPortfolioInfo` +
          `?portfolioId=${currentPortfolio.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
    }
}

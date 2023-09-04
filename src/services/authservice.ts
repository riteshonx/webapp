import jwt_decode from "jwt-decode";
import {
  getRememberMeValue,
  setRememberMeValue,
  getLocalStorgeValue,
  setLocalStorgeValue,
} from "src/modules/authentication/utils";
import {
  DecodedToken,
  ExchangeToken,
  ProjectExchangeToken,
  ProjectFormExchangeToken,
  Token,
} from "../models/token";
import { emptyToken } from "../utils/constants";

export function decodeToken(token = ""): Token {
  const tkn = token ? token : getToken();
  const decodedToken: unknown = jwt_decode(tkn);
  const dToken: DecodedToken = decodedToken as DecodedToken;
  return new Token(dToken);
}

export function getToken(): any {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function setExchangeToken(token: string, tenantId: number): void {
  try {
    const existingToken = localStorage.getItem("exchangetoken");
    if (existingToken) {
      const existingTokenObject = JSON.parse(existingToken);
      existingTokenObject[tenantId.toString()] = token;
      localStorage.setItem(
        "exchangetoken",
        JSON.stringify(existingTokenObject)
      );
    } else {
      localStorage.setItem(
        "exchangetoken",
        JSON.stringify({ [tenantId.toString()]: token })
      );
    }
  } catch (error) {
    console.log(error);
  }
}

// @todo, should convert all exchangeToken to object type
export function getExchangeToken(): string {
  try {
    const existingToken = localStorage.getItem("exchangetoken");
    if (existingToken) {
      const existingTokenObject = JSON.parse(existingToken);
      return existingTokenObject[getActiveTenantId()];
    } else {
      return "";
    }
  } catch (error) {
    const existingToken = localStorage.getItem("exchangetoken") || "";
    return existingToken;
  }
}

export function getAllExchangeToken(): string {
  return localStorage.getItem("exchangetoken") || "";
}

export function getProjectExchangeToken(): string {
  return sessionStorage.getItem("ProjectToken") || "";
}

export function setProjectExchangeToken(token: string): void {
  sessionStorage.setItem("ProjectToken", token);
}

export function setActiveTenantId(id: number, tenantName: string): void {
  localStorage.setItem("activeTenantId", id.toString());
  localStorage.setItem("activeTenantName", tenantName);
}

export function getActiveTenantId(): string {
  return localStorage.getItem("activeTenantId") || decodeToken().tenantId;
}

export function logout(): void {
  const rememberMeValue = getRememberMeValue();
  const bimModelUrls = getLocalStorgeValue(new RegExp("3D-Views"));
  const visualizeModelUrls = getLocalStorgeValue(new RegExp("visualize"));
  const modalDimension = getLocalStorgeValue(new RegExp("modalDimension"));
  const dashboardType = sessionStorage.getItem("dashboardType");
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("dashboardType", dashboardType || "classic");
  setRememberMeValue(rememberMeValue);
  setLocalStorgeValue(bimModelUrls);
  setLocalStorgeValue(modalDimension);
  setLocalStorgeValue(visualizeModelUrls);
  location.reload();
}

export function decodeExchangeToken(token = ""): ExchangeToken {
  try {
    const tkn = token ? token : getExchangeToken();
    const decodedToken: unknown = jwt_decode(tkn);
    const dToken: DecodedToken = decodedToken as DecodedToken;
    return new ExchangeToken(dToken);
  } catch (error: any) {
    return new ExchangeToken(emptyToken);
  }
}

export function decodeProjectExchangeToken(token = ""): ProjectExchangeToken {
  try {
    const tkn = token ? token : getProjectExchangeToken();
    const decodedToken: unknown = jwt_decode(tkn || "");
    const dToken: DecodedToken = decodedToken as DecodedToken;
    return new ProjectExchangeToken(dToken);
  } catch (error: any) {
    return new ProjectExchangeToken(emptyToken);
  }
}

export function decodeProjectFormExchangeToken(
  token = ""
): ProjectFormExchangeToken {
  try {
    const tkn = token ? token : getProjectExchangeToken();
    const decodedToken: unknown = jwt_decode(tkn || "");
    const dToken: DecodedToken = decodedToken as DecodedToken;
    return new ProjectFormExchangeToken(dToken);
  } catch (error: any) {
    return new ProjectFormExchangeToken(emptyToken);
  }
}

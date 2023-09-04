import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./UpdateCompany.scss";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import CompanyInfo from "../../components/CompanyInfo/CompanyInfo";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import Button from "@material-ui/core/Button";
import { stateContext } from "../../../../root/context/authentication/authContext";
import CompanyDetails from "../../components/CompanyDetails/CompanyDetails";
import CompanyMember from "../../components/CompanyMember/CompanyMember";
import CompanyPerformance from "../../components/CompanyPerformance/CompanyPerformance";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { myCompanyRoles, tenantCompanyRole } from "../../../../../utils/role";
import { client } from "../../../../../services/graphql";
import { decodeExchangeToken } from "../../../../../services/authservice";
import {
  FETCH_COMPANY_BY_ID,
  UPDATE_COMPANY_DETAILS,
  UPDATE_COMPANY_LOCATION,
  UPDATE_COMPANY_STATUS,
} from "../../graphql/queries/companies";
import { CompanyDetailsContext } from "../../Context/CompanyDetailsContext";
import {
  setCompanyDetails,
  setCompanyDetailsDirty,
  setCompanyDetailsView,
  setCompanyInfo,
  setCompanyMetricsDetails,
} from "../../Context/CompanyDetailsAction";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { updateTenantCompany } from "../../../roles/utils/permission";
import { LOAD_CONFIGURATION_LIST_DATA } from "../../../forms/grqphql/queries/customList";

export interface Params {
  companyId: string;
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: "Are you sure?",
  text: `If you cancel now, your updates won’t be saved.`,
  cancel: "Go back",
  proceed: "Yes, I'm sure",
};

export interface Params {
  companyId: string;
}

export interface ContactInfo {
  companyPhone: string;
  companyEmail: string;
  webSite: string;
}

export default function UpdateCompany(props: any): ReactElement {
  const { companyDetailsState, companyDetailsDispatch }: any = useContext(
    CompanyDetailsContext
  );
  const { dispatch }: any = useContext(stateContext);
  const [companyTab, setCompanyTab] = useState("DETAILS");
  const [confirmOpen, setconfirmOpen] = useState(false);
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const [customListsData, setCustomListsData] = useState<Array<any>>([]);
  const [companyTypeLists, setCompanyTypeLists] = useState<Array<any>>([]);

  useEffect(() => {
    if (companyDetailsState?.companyDetailsView) {
      setCompanyTab(companyDetailsState?.companyDetailsView);
    }
    return () => {
      companyDetailsDispatch(setCompanyDetailsView(null));
    };
  }, []);

  useEffect(() => {
    if (Number(pathMatch?.params?.companyId)) {
      if (updateTenantCompany) {
        fetchCustomLists();
      }
      companyDetailsDispatch(setCompanyDetailsView(null));
      companyDetailsDispatch(setCompanyInfo(null));
      companyDetailsDispatch(setCompanyMetricsDetails(null));
      fetchCompanyDetail(Number(pathMatch?.params?.companyId));
    }
  }, [Number(pathMatch?.params?.companyId)]);

  const toggleView = (viewType: string) => {
    if (viewType === "TEAMS" && companyDetailsState?.companyMetricsDetails) {
      companyDetailsDispatch(
        setCompanyMetricsDetails(companyDetailsState?.companyMetricsDetails)
      );
    }
    setCompanyTab(viewType);
  };

  const navigateback = () => {
    if (companyDetailsState?.companyDetailsDirty) {
      setconfirmOpen(companyDetailsState?.companyDetailsDirty);
    } else {
      props.closeUpdateSideBar();
    }
  };

  const updateCompanyDetails = (
    argAddressId: number,
    argFormValues: any,
    argLocation: any
  ) => {
    const address = {
      city: "LA",
      state: "California",
      pin: "90030",
      country: "USA",
    };
    const companyInfo: ContactInfo = {
      companyPhone:
        companyDetailsState.companyMetricsDetails.CompanyPhone?.trim()
          ? companyDetailsState.companyMetricsDetails.CompanyPhone.trim()
          : "",
      companyEmail:
        companyDetailsState.companyMetricsDetails.CompanyEmail?.trim()
          ? companyDetailsState.companyMetricsDetails.CompanyEmail.trim()
          : "",
      webSite: companyDetailsState.companyMetricsDetails.CompanyWebsite?.trim()
        ? companyDetailsState.companyMetricsDetails.CompanyWebsite.trim()
        : "",
    };
    const trade = companyDetailsState?.companyMetricsDetails?.CompanyTrades
      ? companyDetailsState?.companyMetricsDetails?.CompanyTrades?.join(",")
      : "";
    const payload: any = {
      id: Number(pathMatch?.params?.companyId),
      companyName: companyDetailsState?.companyInfo?.CompanyName?.trim(),
      companyId: companyDetailsState.companyMetricsDetails.CompanyId?.trim(),
      contactInfo: companyInfo,
      location: `${argLocation?.lat},${argLocation?.lng}`,
      services:
        companyDetailsState.companyMetricsDetails.CompanyService?.trim(),
      type: companyDetailsState?.companyInfo?.CompanyType,
      address: address,
      trades: `{${trade}}`,
    };

    // console.log(payload)
    updateCompany(payload, argAddressId, argFormValues);
  };

  const updateCompany = async (
    payload: any,
    argAddressId: number,
    argFormValues: any
  ) => {
    try {
      const updateCompanyRole = decodeExchangeToken().allowedRoles.includes(
        tenantCompanyRole.updateTenantCompany
      )
        ? tenantCompanyRole.updateTenantCompany
        : decodeExchangeToken().allowedRoles.includes(
            myCompanyRoles.updateMyCompany
          )
        ? myCompanyRoles.updateMyCompany
        : myCompanyRoles.updateMyCompany;

      dispatch(setIsLoading(true));
      const compananyResponse: any = await client.mutate({
        mutation: UPDATE_COMPANY_DETAILS,
        variables: {
          id: payload.id,
          tenantId: Number(decodeExchangeToken().tenantId),
          companyName: payload.companyName,
          companyId: payload.companyId ? payload.companyId : "",
          contactInfo: payload.contactInfo,
          services: payload.services,
          type: payload.type,
          address: payload.address,
          trade: payload.trades,
          location: payload.location,
        },
        context: { role: updateCompanyRole },
      });
      if (argAddressId > 0) {
        updateAddressValues(argAddressId, argFormValues);
      }
      Notification.sendNotification(
        "Company updated successfully",
        AlertTypes.success
      );
      props.refresh();
      props.closeUpdateSideBar();
      dispatch(setIsLoading(false));
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  const updateAddressValues = async (
    argAddressId: number,
    argFormValues: any
  ) => {
    try {
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantCompanyRole.updateTenantCompany
      )
        ? tenantCompanyRole.updateTenantCompany
        : decodeExchangeToken().allowedRoles.includes(
            myCompanyRoles.updateMyCompany
          )
        ? myCompanyRoles.updateMyCompany
        : myCompanyRoles.updateMyCompany;
      const response = await client.mutate({
        mutation: UPDATE_COMPANY_LOCATION,
        variables: {
          id: argAddressId,
          addressLine1: argFormValues.addressLine1,
          addressLine2: argFormValues.addressLine2.trim(),
          streetNo: argFormValues.streetno.trim(),
          city: argFormValues.city.trim(),
          country: argFormValues.country.trim(),
          state: argFormValues.state.trim(),
          postalCode: argFormValues.postalcode.trim(),
          fullAddress: argFormValues.addressLine1,
        },
        context: { role },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmBoxClose = () => {
    setconfirmOpen(false);
  };

  const cancelUpdate = () => {
    companyDetailsDispatch(setCompanyDetailsDirty(false));
    props.closeUpdateSideBar();
  };

  const fetchCompanyDetail = async (companyId: number) => {
    try {
      dispatch(setIsLoading(true));
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantCompanyRole.viewTenantCompanies
      )
        ? tenantCompanyRole.viewTenantCompanies
        : myCompanyRoles.viewMyCompanies;
      const companiesResponse = await client.query({
        query: FETCH_COMPANY_BY_ID,
        variables: {
          id: companyId,
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: "network-only",
        context: { role },
      });
      const companies: Array<any> = [];
      if (companiesResponse.data.tenantCompanyAssociation.length > 0) {
        companies.push(...companiesResponse.data.tenantCompanyAssociation);
        companyDetailsDispatch(setCompanyDetails(companies));
        const companyData: any = {
          CompanyId: companies[0]?.companyId,
          CompanyPhone: companies[0]?.contactInfo?.companyPhone,
          CompanyEmail: companies[0]?.contactInfo?.companyEmail,
          CompanyWebsite: companies[0]?.contactInfo?.webSite,
          CompanyAddress: companies[0]?.address
            ? `${companies[0]?.address?.city}, ${companies[0]?.address?.state}, ${companies[0]?.address?.country}, ${companies[0]?.address?.pin}`
            : "",
          CompanyTrades: companies[0]?.trade,
          CompanyService: companies[0]?.services,
          CompanyServiceLocation: companies[0]?.serviceLocation,
          CompanyOverallRating: companies[0]?.overallRating,
          CompanyParameters: companies[0]?.performanceParameters,
        };
        const companyInfo: any = {
          CompanyType: companies[0]?.type,
          CompanyName: companies[0]?.name,
          tenantId: companies[0]?.tenantId,
          active: companies[0]?.active,
          defaultCompany: (companies[0]?.id === companies[0].tenant?.primaryCompany) ? true : false
        };
        companyDetailsDispatch(setCompanyInfo(companyInfo));
        companyDetailsDispatch(setCompanyMetricsDetails(companyData));
      }

      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const fetchCustomLists = async () => {
    try {
      dispatch(setIsLoading(true));
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantCompanyRole.updateTenantCompany
      )
        ? tenantCompanyRole.updateTenantCompany
        : myCompanyRoles.updateMyCompany;
      const customListsResponse = await client.query({
        query: LOAD_CONFIGURATION_LIST_DATA,
        variables: {
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: "network-only",
        context: { role },
      });
      const customLists: Array<any> = [];
      const companyTypeData: Array<any> = [];
      if (customListsResponse.data.configurationLists.length > 0) {
        const tradeLists = customListsResponse.data.configurationLists.filter(
          (item: any) => item.name === "Trade"
        );
        const typeListsLists =
          customListsResponse.data.configurationLists.filter(
            (item: any) => item.name === "Company Type"
          );
        customLists.push(...tradeLists[0]?.configurationValues);
        companyTypeData.push(...typeListsLists[0]?.configurationValues);
        setCustomListsData(customLists);
        setCompanyTypeLists(companyTypeData);
      }

      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const renderCompanyDetailsComponent = () => {
    switch (companyTab) {
      case "DETAILS":
        return <CompanyDetails customListsData={customListsData} />;
      case "TEAMS":
        return <CompanyMember />;
      case "PERFORMANCE":
        return <CompanyPerformance />;
      default:
        return <CompanyDetails customListsData={customListsData} />;
    }
  };

  const handleCompanyStatus = () => {
    updateCompanyStatus();
  };

  const updateCompanyStatus = async () => {
    try {
      dispatch(setIsLoading(true));
      const compananyResponse: any = await client.mutate({
        mutation: UPDATE_COMPANY_STATUS,
        variables: {
          id: Number(pathMatch?.params?.companyId),
          tenantId: Number(decodeExchangeToken().tenantId),
          active: !companyDetailsState?.companyInfo?.active,
          userId: decodeExchangeToken().userId,
        },
        context: { role: tenantCompanyRole.updateTenantCompanyStatus },
      });
      if (compananyResponse.data.update_tenantCompanyAssociation) {
        Notification.sendNotification(
          "Updated successfully",
          AlertTypes.success
        );
        fetchCompanyDetail(Number(pathMatch?.params?.companyId));
        props.refresh();
        dispatch(setIsLoading(false));
      }
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  return (
    <div className="updateCompany"  style={{ width: companyTab === 'DETAILS' ? '60%' : '100%' }}>
      {companyTab === "DETAILS" && (
        <div className="updateCompany__inactive"></div>
      )}
      <div
        className={`${
          companyTab === "DETAILS" ? "smallSideBar" : "fullSideBar"
        }`}
      >
        <span className="closeIcon">
          <HighlightOffIcon
            data-testid={"close-update"}
            onClick={navigateback}
          />
        </span>
        <>
          <CompanyInfo
            companyTypeLists={companyTypeLists}
            updateCompany={updateCompanyDetails}
            companyStatus={handleCompanyStatus}
            navBack={navigateback}
          />
        </>
        <div className="updateCompany__details">
          <div className="updateCompany__details__toggle">
            <div className="updateCompany__details__toggle__header">
              <div className="updateCompany__details__toggle__toggle-btn">
                {companyTab === "DETAILS" ? (
                  <Button
                    data-testid={"deatails-view"}
                    variant="outlined"
                    className="toggle-primary"
                    onClick={() => toggleView("DETAILS")}
                  >
                    Details
                  </Button>
                ) : (
                  <div
                    className="updateCompany__details__toggle__g-view"
                    onClick={() => toggleView("DETAILS")}
                  >
                    Details
                  </div>
                )}
              </div>
              <div className="updateCompany__details__toggle__toggle-btn">
                {companyTab === "TEAMS" ? (
                  <Button
                    data-testid={"teams-view"}
                    variant="outlined"
                    className="toggle-primary"
                    onClick={() => toggleView("TEAMS")}
                  >
                    Employees
                  </Button>
                ) : (
                  <div
                    className="updateCompany__details__toggle__g-view"
                    onClick={() => toggleView("TEAMS")}
                  >
                    Employees
                  </div>
                )}
              </div>
              <div className="updateCompany__details__toggle__toggle-btn">
                {companyTab === "PERFORMANCE" ? (
                  <Button
                    data-testid={"performance-view"}
                    variant="outlined"
                    className="toggle-primary"
                    onClick={() => toggleView("PERFORMANCE")}
                  >
                    Performance
                  </Button>
                ) : (
                  <div
                    className="updateCompany__details__toggle__g-view"
                    onClick={() => toggleView("PERFORMANCE")}
                  >
                    Performance
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="updateCompany__details__detailsContainer">
            {renderCompanyDetailsComponent()}
          </div>
        </div>
        {confirmOpen && updateTenantCompany ? (
          <ConfirmDialog
            open={confirmOpen}
            message={confirmMessage}
            close={handleConfirmBoxClose}
            proceed={cancelUpdate}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

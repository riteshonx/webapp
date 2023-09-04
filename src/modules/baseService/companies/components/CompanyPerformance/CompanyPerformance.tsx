import {
  createStyles,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./CompanyPerformance.scss";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { UPDATE_COMPANY_RATINGS } from "../../graphql/queries/companies";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { client } from "../../../../../services/graphql";
import { decodeExchangeToken } from "../../../../../services/authservice";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { myCompanyRoles, tenantCompanyRole } from "../../../../../utils/role";
import useUpdateEffect from "src/modules/authentication/hooks/useUpdateEffect";
import { CompanyDetailsContext } from "../../Context/CompanyDetailsContext";
import { isTemplateExpression } from "typescript";
import { CustomPopOver } from "../../../../shared/utils/CustomPopOver";

const process = `Process: How is this company at following processes set forth by the project?.`;
const schedule = `Schedule/Time: Is this company routinely on time with their schedule estimates?`;
const quality = `Quality: What is the level of quality that this company delivers? Are there often defects?`;
const cost = `Cost: How does this company's price compare to its competitors?`;

export interface Params {
  companyId: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: 0,
    },
    select: {
      "& .MuiOutlinedInput-input": {
        padding: "10px 58px 10px 12px",
      },
      "& .Mui-disabled": {
        cursor: "not-allowed",
        background: "#f1f1f1",
      },
    },
    menuItemLabel: {
      fontSize: "1.3rem",
    },
    input: {
      "& .MuiOutlinedInput-input": {
        padding: "12px 12px 12px 12px",
        width: "6.3rem",
      },
    },
  })
);

export default function CompanyPerformance(props: any): ReactElement {
  const [paramsObj, setParamsObj] = useState<Array<any>>([
    { category: "Process", rating: "--", notes: process, type: "process" },
    {
      category: "Schedule/Time",
      rating: "--",
      notes: schedule,
      type: "schedule",
    },
    { category: "Quality", rating: "--", notes: quality, type: "quality" },
    { category: "Cost", rating: "--", notes: cost, type: "cost" },
  ]);
  const [avgRating, setAvgRating] = useState<any>("--");
  const [ratings, setRatings] = useState<Array<any>>(["--", 1, 2, 3, 4, 5]);
  const { dispatch }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const [initialLoading, setInitialLoading] = useState(true);
  const { companyDetailsState, companyDetailsDispatch }: any = useContext(
    CompanyDetailsContext
  );
  const classes = useStyles();
  const classesMenu = CustomPopOver();

  useUpdateEffect(() => {
    updateAvgRating();
  }, [paramsObj]);

  useEffect(() => {
    if (companyDetailsState?.companyMetricsDetails?.CompanyParameters) {
      const companyParamDetail =
        companyDetailsState.companyMetricsDetails.CompanyParameters;
      const detailObj = paramsObj.map((item: any, index: any) => {
        const keyName = item.type;
        return {
          ...item,
          rating:
            companyParamDetail[keyName] > 0
              ? companyParamDetail[keyName]
              : "--",
        };
      });
      setParamsObj(detailObj);
    }
  }, []);

  const enableUpdateRating = ()=>{
    if(companyDetailsState.companyInfo?.active && (decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.updateTenantCompany)
    || decodeExchangeToken().allowedRoles.includes(myCompanyRoles.updateMyCompany))){
      return false
    }else{
      return true
    }
  }

  const performanceRatingUpdate = async () => {
    let ratingObj = {};
    const updateCompanyRole = decodeExchangeToken().allowedRoles.includes(
      tenantCompanyRole.updateTenantCompany
    )
      ? tenantCompanyRole.updateTenantCompany
      : decodeExchangeToken().allowedRoles.includes(
          myCompanyRoles.updateMyCompany
        )
      ? myCompanyRoles.updateMyCompany
      : myCompanyRoles.updateMyCompany;
    paramsObj.forEach((item: any, index: any) => {
      const keyName = item.type;
      ratingObj = {
        ...ratingObj,
        [keyName]: item.rating == "--" ? 0 : item.rating,
      };
    });
    try {
      dispatch(setIsLoading(true));
      const compananyResponse: any = await client.mutate({
        mutation: UPDATE_COMPANY_RATINGS,
        variables: {
          id: Number(pathMatch?.params?.companyId),
          tenantId: Number(decodeExchangeToken().tenantId),
          performanceParameters: ratingObj,
        },
        context: { role: updateCompanyRole },
      });
      if (compananyResponse.data.update_tenantCompanyAssociation) {
        Notification.sendNotification(
          "Updated successfully",
          AlertTypes.success
        );
        dispatch(setIsLoading(false));
      }
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
    }
  };

  const handleRatingChange = (type: string, value: any) => {
    const params = paramsObj.map((item: any, index: any) =>
      item.type == type ? { ...item, rating: value } : { ...item }
    );
    setInitialLoading(false);
    setParamsObj(params);
  };
  const updateAvgRating = () => {
    let avg = 0;
    paramsObj.forEach((item: any, index: any) => {
      avg = avg + item.rating;
    });
    avg = avg / 4;
    if (isNaN(avg)) {
      setAvgRating("--");
    } else {
      setAvgRating(avg);
    }
    if (!initialLoading) setTimeout(() => performanceRatingUpdate(), 1000);
  };

  return (
    <div className="companyPerformance">
      <div className="companyPerformance_description">
        {`Below you can rate each company on various performance categories.`}
      </div>
      <div className="companyPerformance_container">
        <div className="companyPerformance_container_headings">
          Performance Categories
        </div>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <h4>Category</h4>
          </Grid>
          <Grid item xs={4}>
            <h4>Rating-1 to 5(highest)</h4>
          </Grid>
          <Grid item xs={4}>
            <h4>Notes</h4>
          </Grid>
        </Grid>
        <div>
          {paramsObj.map((element: any, index: any) => {
            return (
              <div key={element.type}>
                <Grid container spacing={4}>
                  <Grid item xs={4}>
                    {element.category}
                  </Grid>
                  <Grid item xs={4}>
                    <Select
                      id="custom-dropdown"
                      autoComplete="off"
                      variant="outlined"
                      className={classes.select}
                      disabled={enableUpdateRating()}
                      onChange={(e) =>
                        handleRatingChange(element.type, e.target.value)
                      }
                      value={element.rating}
                      MenuProps={{
                        classes: { paper: classesMenu.root },
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                        getContentAnchorEl: null,
                      }}
                    >
                      {ratings.map((outComes: any, index: any) => (
                        <MenuItem
                          key={index}
                          className={classes.menuItemLabel}
                          value={outComes}
                        >
                          {outComes}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={4}>
                    {element.notes}
                  </Grid>
                </Grid>
              </div>
            );
          })}
        </div>
        <div className="companyPerformance_container_footer">
          <div className="companyPerformance_container_footer_align">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={4}>
                <span>Overall Rating</span>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  value={avgRating}
                  id="perf-ratings"
                  data-testid="avg-perf-ratings"
                  type="text"
                  variant="outlined"
                  disabled={true}
                  className={classes.input}
                />
              </Grid>
              <Grid item xs={4}>
                <div>{`This is the average rating of the 
            four(4) Performance Categories`}</div>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
}

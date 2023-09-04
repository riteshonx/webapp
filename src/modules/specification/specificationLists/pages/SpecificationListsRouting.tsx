import React, { lazy, ReactElement, useReducer } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { SpecificationLibDetailsContext } from "../context/SpecificationLibDetailsContext";
import {
  SpecificationLibDetailsInitialState,
  SpecificationLibDetailsReducer,
} from "../context/SpecificationLibDetailsReducer";

const SpecificationList = lazy(
  () => import("./SpecificationLanding/SpecificationLanding")
);
const SoecificationLibrary = lazy(
  () => import("./SpecificationLibrary/SpecificationLibrary")
);
const SpecificationReview = lazy(
  () => import("./SpecificationReview/SpecificationReview")
);
const SpecificationSheetViewer = lazy(
  () => import("./SpecificationSheetViewer/SpecificationSheetViewer")
);
const ExtractSubmittals = lazy(
  () =>
    import(
      "../pages/SpecificationExtractSubmittalsRvmp/SpecificationExtractSubmittals"
    )
);
export default function SpecificationListsRouting(): ReactElement {
  const [SpecificationLibDetailsState, SpecificationLibDetailsDispatch] =
    useReducer(
      SpecificationLibDetailsReducer,
      SpecificationLibDetailsInitialState
    );

  return (
    <SpecificationLibDetailsContext.Provider
      value={{ SpecificationLibDetailsState, SpecificationLibDetailsDispatch }}
    >
      <Switch>
        <Route
          path={"/specifications/projects/:projectId/pdf-viewer/:documentId"}
          component={SpecificationSheetViewer}
        ></Route>
        <Route
          path={"/specifications/projects/:projectId/review/:documentId"}
          component={SpecificationReview}
        ></Route>
        <Route
          path={"/specifications/projects/:projectId/library"}
          component={SoecificationLibrary}
        ></Route>
        <Route
          exact
          path={"/specifications/projects/:projectId/lists"}
          component={SpecificationList}
        ></Route>
        <Route
          exact
          path={
            "/specifications/projects/:projectId/extractSubmittals/:submittalId"
          }
          component={ExtractSubmittals}
        ></Route>
        <Route path="*">
          <Redirect to={"/specifications/projects/:projectId/lists"} />
        </Route>
      </Switch>
    </SpecificationLibDetailsContext.Provider>
  );
}

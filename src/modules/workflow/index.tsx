import { lazy, ReactElement } from "react";
import { Redirect, Switch, Route } from "react-router-dom";
const View = lazy(() => import("./workflowview/pages/Main/Main"));
const List = lazy(() => import("./workflowlist/Main/Main"));

function Index(): ReactElement {
  return (
    <Switch>
      <Route exact path="/workflow/list" render={() => <List />} />
      <Route exact path="/workflow/view" render={() => <View />} />
      <Route exact path={"/workflow/view/:id"} component={View} />
      <Route exact path={"/workflow"}>
        <Redirect to="/workflow/list"></Redirect>
      </Route>
      <Route path="*">
        <Redirect to="/workflow/list" />
      </Route>
    </Switch>
  );
}

export default Index;

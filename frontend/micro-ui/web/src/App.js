import React from "react";
import {
  initIMComponents,
  IMReducers,
} from "@egovernments/digit-ui-module-pgr";
import {
  PaymentModule,
  PaymentLinks,
  paymentConfigs,
} from "@egovernments/digit-ui-module-common";
import { DigitUI } from "@egovernments/digit-ui-module-core";
import { initLibraries } from "@egovernments/digit-ui-libraries";

initLibraries();

const enabledModules = [
  "IM",
  "HRMS",
  "Bills"
];
window.Digit.ComponentRegistryService.setupRegistry({
  ...paymentConfigs,
  PaymentModule,
  PaymentLinks,
  //HRMSModule,
});

initIMComponents();

const moduleReducers = (initData) => ({
  pgr: IMReducers(initData),
});

function App() {
  const stateCode =
    window.globalConfigs?.getConfig("STATE_LEVEL_TENANT_ID") ||
    process.env.REACT_APP_STATE_LEVEL_TENANT_ID;
  if (!stateCode) {
    return <h1>stateCode is not defined</h1>;
  }
  return (
    <DigitUI
      stateCode={stateCode}
      enabledModules={enabledModules}
      moduleReducers={moduleReducers}
    />
  );
}

export default App;

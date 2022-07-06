import type { OutletContextType } from "src/types";

import { lazy, Suspense } from "react";
import { Navigate, useOutletContext } from "react-router-dom";

import { GantryInfoLoading } from "./gantry-info-loading";

const GantryInfo = lazy(() => import("./gantry-info"));

export const GantryInfoOutlet = () => {
  const { gantry } = useOutletContext<OutletContextType>();

  let child;
  if (gantry === undefined) {
    // gantry info still loading
    child = <GantryInfoLoading />;
  } else if (gantry === null) {
    // gantry not found
    child = <Navigate to="/" replace={true} />;
  } else {
    child = <GantryInfo gantry={gantry} />;
  }

  return <Suspense fallback={<GantryInfoLoading />}>{child}</Suspense>;
};

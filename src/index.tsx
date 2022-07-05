import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { FiltersProvider } from "src/contexts/filters";
import { IsMobileProvider } from "src/contexts/is-mobile";
import {
  GantryInfoHelpPanelOutlet,
  GantryInfoOutlet,
} from "src/features/gantry-info";
import { reportWebVitals } from "src/utils/report-web-vitals";

import { App } from "./App";

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <FiltersProvider>
      <IsMobileProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path=":gantryId" element={<GantryInfoOutlet />} />
              <Route index={true} element={<GantryInfoHelpPanelOutlet />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </IsMobileProvider>
    </FiltersProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { App } from "./App";
import { GantryInfoHelpPanelOutlet, GantryInfoOutlet } from "./GantryInfo";
import { FiltersProvider } from "./contexts/FiltersContext";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <FiltersProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path=":gantryId" element={<GantryInfoOutlet />} />
            <Route index={true} element={<GantryInfoHelpPanelOutlet />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FiltersProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

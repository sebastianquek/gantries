import type { PropsWithChildren, Reducer } from "react";
import type { DayType, VehicleType } from "src/types";

import React, { useEffect, createContext, useContext, useReducer } from "react";

import { VEHICLE_TYPES } from "src/constants";
import { getDayType, getTime } from "src/utils/datetime";

type Action =
  | { type: "changed_vehicle_type"; vehicleType: VehicleType }
  | { type: "changed_day_type"; dayType: DayType }
  | { type: "changed_time"; time: string };

type State = {
  dayType: DayType;
  time: string;
  vehicleType: VehicleType;
};

const initialState: State = {
  dayType: getDayType(),
  time: getTime(),
  vehicleType: VEHICLE_TYPES[0],
};

const VEHICLE_TYPE_KEY = "vehicleType";

const initializer = (initial = initialState): State => {
  try {
    const vehicleTypeFromLocalStorage = JSON.parse(
      localStorage.getItem(VEHICLE_TYPE_KEY) ?? initial.vehicleType
    );
    return {
      ...initial,
      vehicleType: vehicleTypeFromLocalStorage,
    };
  } catch (e) {
    return initial;
  }
};

const FiltersContext = createContext<State>(initialState);
// TODO: figure out how to remove null
const FiltersDispatchContext = createContext<React.Dispatch<Action> | null>(
  null
);

export const FiltersProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [state, dispatch] = useReducer(
    filtersReducer,
    initialState,
    initializer
  );

  useEffect(() => {
    localStorage.setItem(VEHICLE_TYPE_KEY, JSON.stringify(state.vehicleType));
  }, [state.vehicleType]);

  return (
    <FiltersContext.Provider value={state}>
      <FiltersDispatchContext.Provider value={dispatch}>
        {children}
      </FiltersDispatchContext.Provider>
    </FiltersContext.Provider>
  );
};

export const useFilters = () => useContext(FiltersContext);
export const useFiltersDispatch = () => useContext(FiltersDispatchContext);

export const filtersReducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "changed_day_type":
      return {
        ...state,
        dayType: action.dayType,
      };
    case "changed_time":
      return {
        ...state,
        time: action.time,
      };
    case "changed_vehicle_type":
      return {
        ...state,
        vehicleType: action.vehicleType,
      };
  }
};

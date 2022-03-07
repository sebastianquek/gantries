import "dotenv/config";
import type { Rate, RatesData } from "./types";

import { writeFileSync } from "fs";
import { join } from "path";

import axios from "axios";
import { chain, pick } from "lodash";

import { slugify } from "../src/utils/slugify";

import { getSplits } from "./generate-layers";
import { saveDataToCSV } from "./utils/saveDataToCSV";

const RATES_URL = "http://datamall2.mytransport.sg/ltaodataservice/ERPRates";
const HEADERS = {
  AccountKey: process.env.DATAMALL_ACCOUNT_KEY ?? "",
  Accept: "application/json",
};
const OUTPUT_DATA_DIR = join(__dirname, "../public/data");

/**
 * Fetch ERP rates from LTA DataMall.
 * This function gets all data by looping through all possible pages.
 *
 * @param baseUrl LTA DataMall URL
 * @param pageSize Optional page size
 * @returns Array of Rate objects
 */
const fetchRates = async (baseUrl = RATES_URL, pageSize = 500) => {
  const rates: Rate[] = [];
  let skip = 0;
  let hasObtainedAllData = false;

  while (!hasObtainedAllData) {
    const url = `${baseUrl}?$skip=${skip}`;

    const { data } = await axios.get<RatesData>(url, { headers: HEADERS });

    if (data.value.length === 0) {
      hasObtainedAllData = true;
    } else {
      data.value.forEach((d) => rates.push(d));
      skip += pageSize;
    }
  }

  return rates;
};

/**
 * Transforms the ERP rates into a manner that makes subsequent manipulation easier.
 *
 * @param rates Rate objects
 * @returns
 *  Rates with positive amounts, grouped by vehicle type and day type, with each
 *  group being sorted by zone id, start time and end time.
 */
export const parseRates = (rates: Rate[]) => {
  return (
    chain(rates)
      // Store only intervals with positive ERP rates since the time intervals where
      // the gantries are switched off can be derived based on 0 charge amounts.
      // Also, the data does not start from midnight, so there are time intervals that
      // are undefined
      .filter((o) => o.ChargeAmount > 0)
      .sortBy(["ZoneID", "StartTime", "EndTime"])
      .groupBy((o) => `${o.VehicleType} ${o.DayType}`)
      .value()
  );
};

/**
 * Extracts the vehicle types from the ERP rates.
 *
 * @param rates Rate objects
 * @returns Unique vehicle types from the given Rate objects
 */
export const parseVehicleTypes = (rates: Rate[]) => {
  return chain(rates)
    .map((o) => pick(o, "VehicleType"))
    .uniqBy("VehicleType")
    .sortBy("VehicleType")
    .value();
};

/**
 * Get splits by vehicle and day type.
 *
 * TODO: add tests for this. I'm deferring the creation of tests
 * as most of the logic has been tested within getSplits. Also, this
 * function is to be refactored as the current data transformation flow
 * is messy.
 *
 * @param ratesByVehicleTypeAndDayType
 */
const getSplitsByVehicleAndDayType = <
  T extends Pick<Rate, "StartTime" | "EndTime" | "ChargeAmount" | "ZoneID">
>(ratesByVehicleTypeAndDayType: {
  [vehicleTypeAndDayType: string]: T[];
}) => {
  const splitsByVehicleAndDayType: {
    [slugifiedVehicleTypeAndDayType: string]: string[];
  } = {};

  for (const [vehicleTypeAndDayType, rates] of Object.entries(
    ratesByVehicleTypeAndDayType
  )) {
    splitsByVehicleAndDayType[slugify(vehicleTypeAndDayType)] = Array.from(
      getSplits(rates)
    ).sort();
  }
  return splitsByVehicleAndDayType;
};

const run = async () => {
  const rawRates = await fetchRates();

  const parsedRates = parseRates(rawRates);

  // Save rates based on vehicle and day type
  Object.entries(parsedRates).forEach(([vehicleTypeAndDayType, rates]) => {
    saveDataToCSV(slugify(vehicleTypeAndDayType), rates, OUTPUT_DATA_DIR);
  });

  // Save a file that contains all the rates across all vehicle and day types
  writeFileSync(
    join(OUTPUT_DATA_DIR, "all-rates.json"),
    JSON.stringify(parsedRates)
  );

  const splitsByVehicleAndDayType = getSplitsByVehicleAndDayType(parsedRates);
  writeFileSync(
    join(OUTPUT_DATA_DIR, "splits.json"),
    JSON.stringify(splitsByVehicleAndDayType)
  );

  const parsedVehicleTypes = parseVehicleTypes(rawRates);
  saveDataToCSV(slugify("vehicle types"), parsedVehicleTypes, OUTPUT_DATA_DIR);
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

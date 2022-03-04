import "dotenv/config";
import type { Rate, RatesData } from "./types";

import { writeFileSync } from "fs";
import { join } from "path";

import axios from "axios";
import { chain, pick } from "lodash";

import { saveDataToCSV } from "./utils/saveDataToCSV";
import { slugify } from "./utils/slugify";

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
      // the gantries are switched off can be derived based on 0 charge amounts
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

const run = async () => {
  const rawRates = await fetchRates();

  const parsedRates = parseRates(rawRates);
  Object.entries(parsedRates).forEach(([vehicleTypeAndDayType, rates]) => {
    saveDataToCSV(slugify(vehicleTypeAndDayType), rates, OUTPUT_DATA_DIR);
  });

  // Save to a file that contains all the rates across all vehicle and day types
  writeFileSync(
    join(OUTPUT_DATA_DIR, "all-rates.json"),
    JSON.stringify(parsedRates)
  );

  const parsedVehicleTypes = parseVehicleTypes(rawRates);
  saveDataToCSV(slugify("vehicle types"), parsedVehicleTypes, OUTPUT_DATA_DIR);
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

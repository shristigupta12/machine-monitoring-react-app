import timeseries_cycledata_red_m1 from '../data/Machine1-SSP0173/timeseries_cycledata_red.json';
import timeseries_cycledata_green_m1 from '../data/Machine1-SSP0173/timeseries_cycledata_green.json';
import timeseries_cycledata_black_m1 from '../data/Machine1-SSP0173/timeseries_cycledata_black.json';

import timeseries_cycledata_red_m2 from '../data/Machine2-SSP0167/timeseries_cycledata_red.json';
import timeseries_cycledata_green_m2 from '../data/Machine2-SSP0167/timeseries_cycledata_green.json';
import timeseries_cycledata_black_m2 from '../data/Machine2-SSP0167/timeseries_cycledata_black.json';

// In a real application, you would make an actual API call here.
// For this assignment, we simulate it by returning static JSON data.

export const fetchTimeSeriesCycleData = async (machineId, cyclelogId, signal, anomalyFlag) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let data = null;

  // Determine which machine's data to use
  let machineDataGroup = {};
  if (machineId === 'SSP0173') {
    machineDataGroup = {
      red: timeseries_cycledata_red_m1,
      green: timeseries_cycledata_green_m1,
      black: timeseries_cycledata_black_m1,
    };
  } else if (machineId === 'SSP0167') { // Assuming 'SSP0167' is the ID for Machine2
    machineDataGroup = {
      red: timeseries_cycledata_red_m2,
      green: timeseries_cycledata_green_m2,
      black: timeseries_cycledata_black_m2,
    };
  } else {
    console.warn("Unknown machineId, defaulting to Machine1 data:", machineId);
    machineDataGroup = {
      red: timeseries_cycledata_red_m1,
      green: timeseries_cycledata_green_m1,
      black: timeseries_cycledata_black_m1,
    };
  }


  // Select the appropriate static JSON based on anomalyFlag and machine
  if (anomalyFlag === true) {
    data = machineDataGroup.red;
  } else if (anomalyFlag === false) {
    data = machineDataGroup.green;
  } else if (anomalyFlag === null) {
    data = machineDataGroup.black;
  } else {
    // Default to green if anomalyFlag is not clearly defined or unexpected
    console.warn("Unexpected anomalyFlag for time series data, defaulting to green for selected machine:", anomalyFlag);
    data = machineDataGroup.green;
  }

  // No need to check for cyclelogId, just return the first key's value
  if (data && data.Result && data.Result.data) {
    const firstCycleLogKey = Object.keys(data.Result.data)[0];
    if (firstCycleLogKey && data.Result.data[firstCycleLogKey] && data.Result.data[firstCycleLogKey].cycle_data && data.Result.data[firstCycleLogKey].cycle_data[signal]) {
      return {
        Status: true,
        Result: {
          data: data.Result.data[firstCycleLogKey].cycle_data[signal]
        }
      };
    }
  }

  // If data is not found or path is invalid
  console.error(`Data for signal: ${signal} not found in selected static file for machine: ${machineId}.`);
  return { Status: false, Result: null, message: "Data not found" };
};
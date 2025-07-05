import timeseriesBlackSSP0173 from "../data/Machine1-SSP0173/timeseries_cycledata_black.json"
import timeseriesGreenSSP0173 from "../data/Machine1-SSP0173/timeseries_cycledata_green.json"
import timeseriesRedSSP0173 from "../data/Machine1-SSP0173/timeseries_cycledata_red.json"
import timeseriesBlackSSP0167 from "../data/Machine1-SSP0167/timeseries_cycledata_black.json"
import timeseriesGreenSSP0167 from "../data/Machine1-SSP0167/timeseries_cycledata_green.json"
import timeseriesRedSSP0167 from "../data/Machine1-SSP0167/timeseries_cycledata_red.json"

export const fetchTimeSeriesData = async (machineId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let data = {
          black: null,
          green: null,
          red: null,
        };
        if (machineId === 'SSP0173') {
          data.black = timeseriesBlackSSP0173;
          data.green = timeseriesGreenSSP0173;
          data.red = timeseriesRedSSP0173;
        } else if (machineId === 'SSP0167') {
          data.black = timeseriesBlackSSP0167;
          data.green = timeseriesGreenSSP0167;
          data.red = timeseriesRedSSP0167;
        } else {
          return reject(new Error('Time series data for machine not found.'));
        }
        resolve(data);
      }, simulatedApiDelay);
    });
  };
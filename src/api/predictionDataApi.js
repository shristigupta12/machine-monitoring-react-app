import predictionDataSSP0173 from "../data/Machine1-SSP0173/prediction_data.json"
import predictionDataSSP0167 from "../data/Machine2-SSP0167/prediction_data.json"
import moment from "moment";

export const fetchPredictionData = async (machineId, startDate, startTime, endDate, endTime) => { 
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let rawPredictionData;
        if (machineId === 'SSP0173') {
          rawPredictionData = predictionDataSSP0173;
        } else if (machineId === 'SSP0167') {
          rawPredictionData = predictionDataSSP0167;
        } else {
          return reject(new Error('Prediction data for machine not found.'));
        }
  
        // NEW: Convert filter date/time strings to epoch milliseconds
        const startDateTimeEpoch = moment(`${startDate}T${startTime}`).valueOf();
        const endDateTimeEpoch = moment(`${endDate}T${endTime}`).valueOf();
  
        const filteredCycles = {};
        if (rawPredictionData && rawPredictionData.Result && rawPredictionData.Result.cycles) {
          const cycles = rawPredictionData.Result.cycles;
          Object.keys(cycles).forEach(cycleTimestampKey => {
            const cycleInfo = cycles[cycleTimestampKey];
  
            // Ensure cycleInfo and start_time are valid
            if (cycleInfo && cycleInfo.start_time && typeof cycleInfo.start_time === 'string') {
              const cycleStartTimeEpoch = moment(cycleInfo.start_time).valueOf();
  
              // Filter by time range
              if (cycleStartTimeEpoch >= startDateTimeEpoch && cycleStartTimeEpoch <= endDateTimeEpoch) {
                filteredCycles[cycleTimestampKey] = cycleInfo;
              }
            }
          });
        }
  
        // Create a new data object with only the filtered cycles
        const filteredData = {
          ...rawPredictionData,
          Result: {
            ...rawPredictionData.Result,
            cycles: filteredCycles,
          },
        };
  
        resolve(filteredData);
      }, simulatedApiDelay);
    });
  };
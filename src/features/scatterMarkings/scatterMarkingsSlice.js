// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { fetchPredictionData } from "../../api/predictionDataApi";
// import { fetchChangelog } from "../../api/changelogApi";

// // Async Thunk to fetch and process scatter markings data
// export const fetchAndProcessScatterMarkings = createAsyncThunk(
//     'scatterMarkings/fetchAndProcessScatterMarkings',
//     async (_, { getState, rejectWithValue }) => {
//         const { machine, startDate, startTime, endDate, endTime, sequenceTool } = getState().filters;
//         try {
//             // Fetch prediction data based on the provided filters
//             const predictionResponse = await fetchPredictionData(machine, startDate, startTime, endDate, endTime);
//             const cycles = predictionResponse.Result.cycles;
            
//             // Fetch changelog data to get configuration parameters like min_max_points
//             const changelogResponse = await fetchChangelog(machine);
//             const configParameters = changelogResponse.Result[0]?.config_parameters;
//             const minMaxPoints = configParameters?.sequence[sequenceTool] || {};

//             const scatterPoints = [];
//             // Iterate through cycles to extract scatter plot points
//             for (const timestampKey in cycles) {
//                 const cycleInfo = cycles[timestampKey];

//                 // If a specific tool sequence is selected, filter cycles that do not match
//                 if (!sequenceTool || sequenceTool == null) {
//                     continue; 
//                 }

//                 // Check if the cycle has data for the selected sequence tool
//                 if (!cycleInfo.data || !cycleInfo.data[sequenceTool] || !cycleInfo.data[sequenceTool].distance) {
//                     continue; 
//                 }

//                 // Add the scatter point
//                 scatterPoints.push({
//                     x: timestampKey,
//                     y: cycleInfo.data[sequenceTool].distance,
//                     anomaly: cycleInfo.data[sequenceTool].anomaly,
//                     time: cycleInfo.start_time, // Include original start time for context
//                     toolSequence: cycleInfo.tool_sequence_number // Include tool sequence number for context
//                 });
//             }

//             // Return both the processed scatter points and the min/max points for anomaly detection
//             return {
//                 scatterPoints,
//                 minMaxPoints
//             };

//         } catch (error) {
//             console.error("Error in fetchAndProcessScatterMarkings:", error);
//             // Use rejectWithValue to provide a helpful error message to the rejected action
//             return rejectWithValue(error.message || 'Failed to fetch and process scatter markings.');
//         }
//     }
// );

// // Scatter Markings Redux Toolkit Slice
// const scatterMarkingsSlice = createSlice({
//     name: 'scatterMarkings',
//     initialState: {
//         scatterPoints: [], // Array to hold the scatter plot data points
//         minMaxPoints: {}, // Object to hold the min/max thresholds for the plot
//         loading: 'idle', // Status of the async operation: 'idle' | 'pending' | 'succeeded' | 'failed'
//         error: null, // Stores any error messages
//     },
//     reducers: {
//         // Synchronous reducers can be added here if needed for direct state manipulations
//         // For example:
//         // resetScatterMarkings: (state) => {
//         //     state.scatterPoints = [];
//         //     state.minMaxPoints = {};
//         //     state.loading = 'idle';
//         //     state.error = null;
//         // },
//     },
//     extraReducers: (builder) => {
//         builder
//             // Handles the pending state of the async thunk
//             .addCase(fetchAndProcessScatterMarkings.pending, (state) => {
//                 state.loading = 'pending';
//                 state.error = null; // Clear any previous errors when a new request starts
//             })
//             // Handles the fulfilled (successful) state of the async thunk
//             .addCase(fetchAndProcessScatterMarkings.fulfilled, (state, action) => {
//                 state.loading = 'succeeded';
//                 state.scatterPoints = action.payload.scatterPoints; // Update scatter points with fetched data
//                 state.minMaxPoints = action.payload.minMaxPoints; // Update min/max points
//             })
//             // Handles the rejected (failed) state of the async thunk
//             .addCase(fetchAndProcessScatterMarkings.rejected, (state, action) => {
//                 state.loading = 'failed';
//                 state.error = action.payload; // Set the error message
//                 state.scatterPoints = []; // Clear points on error
//                 state.minMaxPoints = {}; // Clear min/max on error
//             });
//     },
// });

// // Export any synchronous actions if you add them to `reducers`
// export const { } = scatterMarkingsSlice.actions;

// // Export the reducer to be combined in the Redux store
// export default scatterMarkingsSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPredictionData } from '../../api/predictionDataApi';
import { fetchChangelog } from '../../api/changelogApi';
import moment from 'moment';

export const fetchAndProcessScatterMarkings = createAsyncThunk(
  'scatterMarkings/fetchAndProcess',
  async ({ machine, startDate, startTime, endDate, endTime, sequenceTool }, { rejectWithValue }) => {
    try {
      // Fetch prediction data
      const predictionResponse = await fetchPredictionData(machine, startDate, startTime, endDate, endTime);
      const cycles = predictionResponse.Result.cycles;

      // Fetch changelog data to get min/max points for the selected tool sequence
      const changelogResponse = await fetchChangelog(machine);
      const currentChangeLog = changelogResponse.Result.find(
        (log) => log.machine_id === predictionResponse.Result.machine_id // Assuming machine_id links them, or a more robust lookup
      );

      let minMaxPoints = { min: null, max: null, threshold: null };
      if (currentChangeLog && currentChangeLog.config_parameters && currentChangeLog.config_parameters.sequence) {
        const sequenceConfig = currentChangeLog.config_parameters.sequence[sequenceTool];
        if (sequenceConfig) {
          minMaxPoints.min = sequenceConfig.min_points;
          minMaxPoints.max = sequenceConfig.max_points;
        }
        // Assuming threshold is also available in learned_parameters for the specific sequenceTool
        if (currentChangeLog.learned_parameters && currentChangeLog.learned_parameters[sequenceTool]) {
          minMaxPoints.threshold = currentChangeLog.learned_parameters[sequenceTool].threshold;
        }
      }

      const processedScatterPoints = Object.values(cycles)
        .map((cycle) => {
          // Ensure cycle.data for the sequenceTool exists and distance is valid
          if (cycle.data && cycle.data[sequenceTool] && typeof cycle.data[sequenceTool].distance === 'number') {
            const distance = cycle.data[sequenceTool].distance;
            const isAnomaly = minMaxPoints.min !== null && minMaxPoints.max !== null
              ? (distance < minMaxPoints.min || distance > minMaxPoints.max)
              : cycle.data[sequenceTool].anomaly; // Fallback to cycle's anomaly flag if no min/max defined

            return {
              x: moment(cycle.start_time).valueOf(), // Convert time to epoch for numerical plotting
              y: distance,
              isAnomaly: isAnomaly,
              cycle_log_id: cycle.cycle_log_id,
              startTime: cycle.start_time,
              endTime: cycle.end_time,
              toolSequence: sequenceTool,
              machineId: cycle.machine_id,
              anomalyFlag: cycle.data[sequenceTool].anomaly, // The raw anomaly flag from data
            };
          }
          return null; // Skip invalid data points
        })
        .filter(point => point !== null)
        .sort((a, b) => a.x - b.x); // Sort by time for better plotting

      return {
        scatterPoints: processedScatterPoints,
        minMaxPoints: minMaxPoints,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const scatterMarkingsSlice = createSlice({
  name: 'scatterMarkings',
  initialState: {
    scatterPoints: [],
    minMaxPoints: { min: null, max: null, threshold: null },
    loading: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndProcessScatterMarkings.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchAndProcessScatterMarkings.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.scatterPoints = action.payload.scatterPoints;
        state.minMaxPoints = action.payload.minMaxPoints;
      })
      .addCase(fetchAndProcessScatterMarkings.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload;
      });
  },
});

export default scatterMarkingsSlice.reducer;
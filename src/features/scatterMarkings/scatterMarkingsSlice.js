import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPredictionData } from "../../api/predictionDataApi";
import { fetchChangelog } from "../../api/changelogApi";

// Async Thunk to fetch and process scatter markings data
export const fetchAndProcessScatterMarkings = createAsyncThunk(
    'scatterMarkings/fetchAndProcessScatterMarkings',
    async ({ machineId, startDate, startTime, endDate, endTime, sequenceTool }, { rejectWithValue }) => {
        try {
            // Fetch prediction data based on the provided filters
            const predictionResponse = await fetchPredictionData(machineId, startDate, startTime, endDate, endTime);
            const cycles = predictionResponse.Result.cycles;

            // Fetch changelog data to get configuration parameters like min_max_points
            const changelogResponse = await fetchChangelog(machineId);
            const configParameters = changelogResponse.Result[0]?.config_parameters;
            const minMaxPoints = configParameters?.sequence[sequenceTool.key] || {};

            const scatterPoints = [];
            // Iterate through cycles to extract scatter plot points
            for (const timestampKey in cycles) {
                const cycleInfo = cycles[timestampKey];


                // If a specific tool sequence is selected, filter cycles that do not match
                if (!sequenceTool || sequenceTool.key == null || cycleInfo.data[sequenceTool.key] == undefined || cycleInfo.data[sequenceTool.key] == null) {
                    continue; 
                }
                

                // Ensure x_value and y_value exist before adding to scatterPoints array
                if (cycleInfo) {
                    scatterPoints.push({
                        x: timestampKey,
                        y: cycleInfo.data[sequenceTool.key].distance,
                        time: cycleInfo.start_time, // Include original start time for context
                        toolSequence: cycleInfo.tool_sequence_number // Include tool sequence number for context
                    });
                }
            }

            // Return both the processed scatter points and the min/max points for anomaly detection
            return {
                scatterPoints,
                minMaxPoints
            };

        } catch (error) {
            console.error("Error in fetchAndProcessScatterMarkings:", error);
            // Use rejectWithValue to provide a helpful error message to the rejected action
            return rejectWithValue(error.message || 'Failed to fetch and process scatter markings.');
        }
    }
);

// Scatter Markings Redux Toolkit Slice
const scatterMarkingsSlice = createSlice({
    name: 'scatterMarkings',
    initialState: {
        scatterPoints: [], // Array to hold the scatter plot data points
        minMaxPoints: {}, // Object to hold the min/max thresholds for the plot
        loading: 'idle', // Status of the async operation: 'idle' | 'pending' | 'succeeded' | 'failed'
        error: null, // Stores any error messages
    },
    reducers: {
        // Synchronous reducers can be added here if needed for direct state manipulations
        // For example:
        // resetScatterMarkings: (state) => {
        //     state.scatterPoints = [];
        //     state.minMaxPoints = {};
        //     state.loading = 'idle';
        //     state.error = null;
        // },
    },
    extraReducers: (builder) => {
        builder
            // Handles the pending state of the async thunk
            .addCase(fetchAndProcessScatterMarkings.pending, (state) => {
                state.loading = 'pending';
                state.error = null; // Clear any previous errors when a new request starts
            })
            // Handles the fulfilled (successful) state of the async thunk
            .addCase(fetchAndProcessScatterMarkings.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.scatterPoints = action.payload.scatterPoints; // Update scatter points with fetched data
                state.minMaxPoints = action.payload.minMaxPoints; // Update min/max points
            })
            // Handles the rejected (failed) state of the async thunk
            .addCase(fetchAndProcessScatterMarkings.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload; // Set the error message
                state.scatterPoints = []; // Clear points on error
                state.minMaxPoints = {}; // Clear min/max on error
            });
    },
});

// Export any synchronous actions if you add them to `reducers`
export const { } = scatterMarkingsSlice.actions;

// Export the reducer to be combined in the Redux store
export default scatterMarkingsSlice.reducer;
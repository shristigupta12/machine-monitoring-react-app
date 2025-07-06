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
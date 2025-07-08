// src/features/scatterMarkings/scatterMarkingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPredictionData } from '../../api/predictionDataApi';
import { fetchChangelog } from '../../api/changelogApi';
import moment from 'moment';

export const fetchAndProcessScatterMarkings = createAsyncThunk(
  'scatterMarkings/fetchAndProcess',
  async ({ graphId, machine, startDate, startTime, endDate, endTime, sequenceTool }, { rejectWithValue }) => {
    try {
      // Fetch prediction data
      const predictionResponse = await fetchPredictionData(machine, startDate, startTime, endDate, endTime);
      const cycles = predictionResponse.Result.cycles;

      // Fetch changelog data to get min/max points for the selected tool sequence
      const changelogResponse = await fetchChangelog(machine);
      const currentChangeLog = changelogResponse.Result.find(
        (log) => log.machine_id === predictionResponse.Result.machine_id
      );

      let minMaxPoints = { min: null, max: null, threshold: null };
      if (currentChangeLog && currentChangeLog.config_parameters && currentChangeLog.config_parameters.sequence) {
        const sequenceConfig = currentChangeLog.config_parameters.sequence[sequenceTool];
        if (sequenceConfig) {
          minMaxPoints.min = sequenceConfig.min_points;
          minMaxPoints.max = sequenceConfig.max_points;
        }
        if (currentChangeLog.learned_parameters && currentChangeLog.learned_parameters[sequenceTool]) {
          minMaxPoints.threshold = currentChangeLog.learned_parameters[sequenceTool].threshold;
        }
      }

      const processedScatterPoints = Object.values(cycles)
        .map((cycle) => {
          if (cycle.data && cycle.data[sequenceTool] && typeof cycle.data[sequenceTool].distance === 'number') {
            const distance = cycle.data[sequenceTool].distance;
            const isAnomaly = minMaxPoints.min !== null && minMaxPoints.max !== null
              ? (distance < minMaxPoints.min || distance > minMaxPoints.max)
              : cycle.data[sequenceTool].anomaly;

            return {
              x: moment(cycle.start_time).valueOf(),
              y: distance,
              isAnomaly: isAnomaly,
              cycle_log_id: cycle.cycle_log_id,
              startTime: cycle.start_time,
              endTime: cycle.end_time,
              toolSequence: sequenceTool,
              machineId: cycle.machine_id,
              anomalyFlag: cycle.data[sequenceTool].anomaly,
            };
          }
          return null;
        })
        .filter(point => point !== null)
        .sort((a, b) => a.x - b.x);

      // Return graphId along with the data
      return {
        graphId, // Pass graphId through
        scatterPoints: processedScatterPoints,
        minMaxPoints: minMaxPoints,
      };
    } catch (error) {
      // Return graphId for rejected case as well
      return rejectWithValue({ graphId, error: error.message });
    }
  }
);

const initialState = {
  graph1: { // Data for graph 1
    scatterPoints: [],
    minMaxPoints: { min: null, max: null, threshold: null },
    loading: 'idle',
    error: null,
  },
  graph2: { // Data for graph 2
    scatterPoints: [],
    minMaxPoints: { min: null, max: null, threshold: null },
    loading: 'idle',
    error: null,
  },
};

const scatterMarkingsSlice = createSlice({
  name: 'scatterMarkings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndProcessScatterMarkings.pending, (state, action) => {
        const { graphId } = action.meta.arg; // Access graphId from the thunk's arguments
        state[graphId].loading = 'pending';
        state[graphId].error = null;
      })
      .addCase(fetchAndProcessScatterMarkings.fulfilled, (state, action) => {
        const { graphId, scatterPoints, minMaxPoints } = action.payload;
        state[graphId].loading = 'idle';
        state[graphId].scatterPoints = scatterPoints;
        state[graphId].minMaxPoints = minMaxPoints;
        state[graphId].error = null; // Clear error on success
      })
      .addCase(fetchAndProcessScatterMarkings.rejected, (state, action) => {
        const { graphId, error } = action.payload; // Access graphId and error from payload
        state[graphId].loading = 'idle';
        state[graphId].error = error;
      });
  },
});

export default scatterMarkingsSlice.reducer;
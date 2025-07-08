// src/features/timeSeriesGraph/timeSeriesGraphSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTimeSeriesCycleData } from '../../api/timeSeriesApi';
import { fetchChangelog } from '../../api/changelogApi';

export const fetchAndProcessTimeSeriesData = createAsyncThunk(
  'timeSeriesGraph/fetchAndProcess',
  async ({ graphId, machineId, cyclelogId, signal, anomalyFlag, toolSequence, actualDistance, minPoints, maxPoints, threshold }, { rejectWithValue }) => {
    try {
      // Fetch actual signal data (dark blue line)
      const actualSignalResponse = await fetchTimeSeriesCycleData(machineId, cyclelogId, signal, anomalyFlag);
      const actualSignalRaw = actualSignalResponse.Result.data;

      // Format actual signal data into an array of {x: time_in_seconds, y: value}
      const actualSignalData = Object.entries(actualSignalRaw).map(([time, value]) => ({
        x: parseFloat(time),
        y: value,
      })).sort((a, b) => a.x - b.x);

      // Fetch ideal signal data (light blue line) from changelog
      const changelogResponse = await fetchChangelog(machineId);
      const currentChangeLog = changelogResponse.Result[0]


      let idealSignalData = [];
      if (currentChangeLog && currentChangeLog.learned_parameters && currentChangeLog.learned_parameters[toolSequence]) {
        const averageList = currentChangeLog.learned_parameters[toolSequence].average_list;
        const maxTimeActual = actualSignalData.length > 0 ? actualSignalData[actualSignalData.length - 1].x : 0;
        idealSignalData = averageList.map((value, index) => {
          const xValue = (index / (averageList.length - 1)) * maxTimeActual;
          return { x: xValue, y: value };
        });
      }

      return {
        graphId, // Pass graphId through
        actualSignalData,
        idealSignalData,
        selectedCycleData: {
          machineId,
          cyclelogId,
          signal,
          anomalyFlag,
          toolSequence,
          actualDistance,
          minPoints,
          maxPoints,
          threshold
        }
      };
    } catch (error) {
      // Return graphId for rejected case as well
      console.error("Failed to fetch time series data:", error);
      return rejectWithValue({ graphId, error: error.message || "Failed to load time series data." });
    }
  }
);

const initialState = {
  graph1: {
    isVisible: false,
    selectedCycleData: null,
    actualSignalData: [],
    idealSignalData: [],
    loading: 'idle',
    error: null,
  },
  graph2: {
    isVisible: false,
    selectedCycleData: null,
    actualSignalData: [],
    idealSignalData: [],
    loading: 'idle',
    error: null,
  },
};

const timeSeriesGraphSlice = createSlice({
  name: 'timeSeriesGraph',
  initialState,
  reducers: {
    // Reducers now take graphId
    showTimeSeriesGraph: (state, action) => {
      const { graphId, ...payload } = action.payload; // Destructure graphId
      state[graphId].isVisible = true;
      state[graphId].selectedCycleData = payload;
      state[graphId].actualSignalData = [];
      state[graphId].idealSignalData = [];
      state[graphId].error = null; // Clear error on show
    },
    hideTimeSeriesGraph: (state, action) => {
      const { graphId } = action.payload; // Expect graphId to hide specific graph
      state[graphId].isVisible = false;
      state[graphId].selectedCycleData = null;
      state[graphId].actualSignalData = [];
      state[graphId].idealSignalData = [];
      state[graphId].error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndProcessTimeSeriesData.pending, (state, action) => {
        const { graphId } = action.meta.arg;
        state[graphId].loading = 'pending';
        state[graphId].error = null;
      })
      .addCase(fetchAndProcessTimeSeriesData.fulfilled, (state, action) => {
        const { graphId, actualSignalData, idealSignalData, selectedCycleData } = action.payload;
        state[graphId].loading = 'idle';
        state[graphId].actualSignalData = actualSignalData;
        state[graphId].idealSignalData = idealSignalData;
        state[graphId].selectedCycleData = selectedCycleData;
        state[graphId].error = null; // Clear error on success
      })
      .addCase(fetchAndProcessTimeSeriesData.rejected, (state, action) => {
        const { graphId, error } = action.payload;
        state[graphId].loading = 'idle';
        state[graphId].error = error;
        state[graphId].actualSignalData = [];
        state[graphId].idealSignalData = [];
      });
  },
});

export const { showTimeSeriesGraph, hideTimeSeriesGraph } = timeSeriesGraphSlice.actions;
export default timeSeriesGraphSlice.reducer;
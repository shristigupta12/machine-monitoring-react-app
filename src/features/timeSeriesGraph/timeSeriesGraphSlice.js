import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTimeSeriesCycleData } from '../../api/timeSeriesApi';
import { fetchChangelog } from '../../api/changelogApi';

export const fetchAndProcessTimeSeriesData = createAsyncThunk(
  'timeSeriesGraph/fetchAndProcess',
  async ({ machineId, cyclelogId, signal, anomalyFlag, toolSequence }, { rejectWithValue }) => {
    try {
      // Fetch actual signal data (dark blue line)
      const actualSignalResponse = await fetchTimeSeriesCycleData(machineId, cyclelogId, signal, anomalyFlag);
      const actualSignalRaw = actualSignalResponse.Result.data;

      // Format actual signal data into an array of {x: time_in_seconds, y: value}
      const actualSignalData = Object.entries(actualSignalRaw).map(([time, value]) => ({
        x: parseFloat(time),
        y: value,
      })).sort((a, b) => a.x - b.x); // Ensure data is sorted by time

      // Fetch ideal signal data (light blue line) from changelog
      const changelogResponse = await fetchChangelog(machineId);
      const currentChangeLog = changelogResponse.Result[0]


      let idealSignalData = [];
      if (currentChangeLog && currentChangeLog.learned_parameters && currentChangeLog.learned_parameters[toolSequence]) {
        const averageList = currentChangeLog.learned_parameters[toolSequence].average_list;
        // Align ideal signal with actual signal timestamps (assuming same length or proportionate)
        // For simplicity, we'll map ideal signal values to an increasing time axis
        // corresponding to the actual signal's length.
        // A more robust solution might involve interpolation or matching based on timestamps.
        const maxTimeActual = actualSignalData.length > 0 ? actualSignalData[actualSignalData.length - 1].x : 0;
        idealSignalData = averageList.map((value, index) => {
          // Distribute averageList values across the actual signal's time range
          const xValue = (index / (averageList.length - 1)) * maxTimeActual;
          return { x: xValue, y: value };
        });
      }

      return { actualSignalData, idealSignalData, selectedCycleData: { machineId, cyclelogId, signal, anomalyFlag, toolSequence } };
    } catch (error) {
      console.error("Failed to fetch time series data:", error);
      return rejectWithValue(error.message || "Failed to load time series data.");
    }
  }
);

const timeSeriesGraphSlice = createSlice({
  name: 'timeSeriesGraph',
  initialState: {
    isVisible: false,
    selectedCycleData: null,
    actualSignalData: [],
    idealSignalData: [],
    loading: 'idle',
    error: null,
  },
  reducers: {
    showTimeSeriesGraph: (state, action) => {
      state.isVisible = true;
      state.selectedCycleData = action.payload; // Store the clicked cycle data
      state.actualSignalData = []; // Clear previous data
      state.idealSignalData = []; // Clear previous data
    },
    hideTimeSeriesGraph: (state) => {
      state.isVisible = false;
      state.selectedCycleData = null;
      state.actualSignalData = [];
      state.idealSignalData = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndProcessTimeSeriesData.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchAndProcessTimeSeriesData.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.actualSignalData = action.payload.actualSignalData;
        state.idealSignalData = action.payload.idealSignalData;
        state.selectedCycleData = action.payload.selectedCycleData; // Update with full fetched data if needed
      })
      .addCase(fetchAndProcessTimeSeriesData.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload;
        state.actualSignalData = [];
        state.idealSignalData = [];
      });
  },
});

export const { showTimeSeriesGraph, hideTimeSeriesGraph } = timeSeriesGraphSlice.actions;
export default timeSeriesGraphSlice.reducer;
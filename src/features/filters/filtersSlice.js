


// src/features/filters/filtersSlice.js
import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const getInitialFilterState = () => ({
  machine: 'SSP0173',
  startDate: moment('2025-03-01').format('YYYY-MM-DD'),
  startTime: '09:29',
  endDate: moment('2025-05-28').format('YYYY-MM-DD'),
  endTime: '10:29',
  sequenceTool: '101',
});

const initialState = {
  graph1: getInitialFilterState(),
  graph2: { // Initialize graph2 with different defaults if needed, or same as graph1
    ...getInitialFilterState(),
    machine: 'SSP0167', // Example: default to a different machine for graph2
  },
  isComparisonMode: false,
  // When not in comparison mode, we'll use graph1's state as the primary
  // This simplifies usage in components that don't need to know about comparison mode.
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // These reducers now take a graphId to update specific filter sets
    setMachine: (state, action) => {
      const { graphId, value } = action.payload;
      state[graphId].machine = value;
    },
    setStartDate: (state, action) => {
      const { graphId, value } = action.payload;
      state[graphId].startDate = value;
    },
    setStartTime: (state, action) => {
      const { graphId, value } = action.payload;
      state[graphId].startTime = value;
    },
    setEndDate: (state, action) => {
      const { graphId, value } = action.payload;
      state[graphId].endDate = value;
    },
    setEndTime: (state, action) => {
      const { graphId, value } = action.payload;
      state[graphId].endTime = value;
    },
    setSequenceTool: (state, action) => {
      const { graphId, value } = action.payload;
      state[graphId].sequenceTool = value;
    },
    toggleComparisonMode: (state) => {
      state.isComparisonMode = !state.isComparisonMode;
      // When switching to single mode, optionally reset graph2 or copy graph1 to it
      if (!state.isComparisonMode) {
        state.graph2 = getInitialFilterState(); // Reset graph2 to initial state
      }
    },
    resetFilters: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setMachine,
  setStartDate,
  setStartTime,
  setEndDate,
  setEndTime,
  setSequenceTool,
  toggleComparisonMode,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
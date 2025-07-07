import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    machine: 'SSP0173',
    startDate: '2025-03-01',
    startTime: '00:00:00',
    endDate: '2025-05-27',
    endTime: '23:59:59',
    sequenceTool: '101',
}

const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {setMachine: (state, action) => {
        state.machine = action.payload;
      },
      setStartDate: (state, action) => {
        state.startDate = action.payload;
      },
      setStartTime: (state, action) => {
        state.startTime = action.payload;
      },
      setEndDate: (state, action) => {
        state.endDate = action.payload;
      },
      setEndTime: (state, action) => {
        state.endTime = action.payload;
      },
      setSequenceTool: (state, action) => {
        state.sequenceTool = action.payload;
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
    resetFilters,
  } = filtersSlice.actions;
  
  export default filtersSlice.reducer;
  
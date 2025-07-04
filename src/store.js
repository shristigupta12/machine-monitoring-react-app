import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from './features/filters/filtersSlice';
import machineDataReducer from './features/machineData/machineDataSlice';

export const store = configureStore({
    reducer: {
        filters: filtersReducer,
        machineData: machineDataReducer,
    }
})
import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from './features/filters/filtersSlice';
import toolSequencesReducer from './features/toolSequences/toolSequencesSlice';
import scatterMarkingsReducer from './features/scatterMarkings/scatterMarkingsSlice';
import timeSeriesGraphReducer from './features/timeSeriesGraph/timeSeriesGraphSlice';
import sidebarReducer from './features/sidebar/sidebarSlice';

export const store = configureStore({
    reducer: {
        filters: filtersReducer,
        toolSequences: toolSequencesReducer,
        scatterMarkings: scatterMarkingsReducer,
        timeSeriesGraph: timeSeriesGraphReducer,
        sidebar: sidebarReducer
    }
})
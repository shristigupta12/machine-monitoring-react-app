import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPredictionData } from "../../api/predictionDataApi";

export const fetchAndProcessScatterMarkings = createAsyncThunk(
    'scatterMarkings/fetchAndProcessScatterMarkings',
    async ({ machineId, startDate, startTime, endDate, endTime, sequenceTool }, {rejectWithValue}) => {
       
    }
)
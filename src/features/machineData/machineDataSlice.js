import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchChangelog } from "../../api/changelogApi";

export const fetchToolSequences = createAsyncThunk(
    'machineData/fetchToolSequences', 
    async (machineId, {rejectWithValue} ) => {
        try{
            const response = await fetchChangelog(machineId);
            const configParameters = response.Result[0]?.config_parameters;
            if (configParameters && configParameters.tool_sequence_map) {
                const toolSequences = Object.entries(configParameters.tool_sequence_map).map(([key, value]) => ({
                  key,
                  value
                }));
                return toolSequences;
              } else {
                return rejectWithValue('Tool sequence data not found in changelog.');
              }
        }catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch tool sequences.');
          }
    }
)

const machineDataSlice = createSlice({
    name: 'machineData',
    initialState: {
      toolSequences: [],
      loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
      error: null,
      // Other machine data (scatter points, time series) will be added here later
    },
    reducers: {
      // You can add synchronous reducers here if needed
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchToolSequences.pending, (state) => {
          state.loading = 'pending';
          state.error = null;
        })
        .addCase(fetchToolSequences.fulfilled, (state, action) => {
          state.loading = 'succeeded';
          state.toolSequences = action.payload;
        })
        .addCase(fetchToolSequences.rejected, (state, action) => {
          state.loading = 'failed';
          state.error = action.payload; // action.payload will be the value from rejectWithValue
        });
    },
  });

  export default machineDataSlice.reducer;

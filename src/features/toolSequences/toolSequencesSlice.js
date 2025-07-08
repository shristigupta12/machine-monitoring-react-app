// src/features/toolSequences/toolSequencesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchChangelog } from '../../api/changelogApi';

export const fetchToolSequences = createAsyncThunk(
  'toolSequences/fetchToolSequences',
  async (machineName, { rejectWithValue }) => { // Changed parameter name to machineName for clarity
    console.log("Fetching tool sequences for machine:", machineName); // Debug log
    try {
      const changelogResponse = await fetchChangelog(machineName);
      console.log("Changelog API Response:", changelogResponse); // Debug log

      // Corrected: Use machine_details.name to match the machineName
      const currentChangeLog = changelogResponse.Result.find(
        (log) => log.machine_details && log.machine_details.name === machineName
      );

      if (!currentChangeLog) {
        console.error(`Changelog entry not found for machine: ${machineName}`); // Debug log
        return rejectWithValue(`Changelog entry not found for machine: ${machineName}`);
      }

      if (!currentChangeLog.config_parameters || !currentChangeLog.config_parameters.tool_sequence_map) {
        console.error(`Tool sequence map not found in changelog for machine: ${machineName}`); // Debug log
        return rejectWithValue("Tool sequence map not found for this machine.");
      }

      const toolSequenceMap = currentChangeLog.config_parameters.tool_sequence_map;
      const options = Object.entries(toolSequenceMap).map(([id, value]) => ({ id, value }));
      console.log("Fetched Tool Sequence Options:", options); // Debug log
      return options;
    } catch (error) {
      console.error("Error fetching tool sequences:", error.message); // Debug log
      return rejectWithValue(error.message);
    }
  }
);

const toolSequencesSlice = createSlice({
  name: 'toolSequences',
  initialState: {
    toolSequenceOptions: [],
    loading: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchToolSequences.pending, (state) => {
        state.loading = 'pending';
        state.error = null; // Clear previous errors
      })
      .addCase(fetchToolSequences.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.toolSequenceOptions = action.payload;
        state.error = null;
      })
      .addCase(fetchToolSequences.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload;
        state.toolSequenceOptions = []; // Clear options on error
      });
  },
});

export default toolSequencesSlice.reducer;
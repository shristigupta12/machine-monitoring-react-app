// src/components/scatter-plot/filterHeading.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  setMachine,
  setStartDate,
  setStartTime,
  setEndDate,
  setEndTime,
  setSequenceTool,
  // resetFilters, // Uncomment if you use resetFilters in this component
} from '../../features/filters/filtersSlice';
import { fetchToolSequences } from '../../features/toolSequences/toolSequencesSlice';
import Select from '../design-system/select'; // Correct default import for Select
import { Input } from '../design-system/input'; // Correct named import for Input

export const FilterHeading = ({ graphId = 'graph1', comparisonMode = false }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters[graphId]);
  const { machine, startDate, startTime, endDate, endTime, sequenceTool } = filters;

  const { toolSequenceOptions, loading: toolSequencesLoading } = useSelector(
    (state) => state.toolSequences
  );

  useEffect(() => {
    dispatch(fetchToolSequences(machine));
  }, [dispatch, machine]);

  const handleSearch = () => {
    console.log('Search clicked with filters:', filters);
  };

  return (
    <div className={`p-6 ${comparisonMode ? 'flex flex-col items-center justify-center min-h-[540px] bg-white rounded-2xl shadow-medium border border-slate-100' : ''}`}>
      <div className="mb-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">
          Data Filters {graphId === 'graph1' ? '' : `(${graphId.toUpperCase()})`}
        </h2>
        <p className="text-slate-600 text-sm text-center">
          Configure parameters to filter and analyze machine performance data
        </p>
      </div>
      
      <form className={`w-full ${comparisonMode ? 'max-w-md mx-auto flex flex-col gap-3 flex-1' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end'}`}
        style={comparisonMode ? {minHeight: 0, flexGrow: 1} : {}}>
        <div>
          <label htmlFor={`machine-select-${graphId}`} className="block text-sm font-semibold text-slate-700 mb-2">
            Machine
          </label>
          <Select
            id={`machine-select-${graphId}`}
            value={machine}
            onChange={(e) => dispatch(setMachine({ graphId, value: e.target.value }))}
            options={[
              { value: 'SSP0173', label: 'SSP0173' },
              { value: 'SSP0167', label: 'SSP0167' },
            ]}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor={`start-date-${graphId}`} className="block text-sm font-semibold text-slate-700 mb-2">
            Start Date
          </label>
          <Input
            id={`start-date-${graphId}`}
            type="date"
            value={startDate}
            onChange={(e) => dispatch(setStartDate({ graphId, value: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor={`start-time-${graphId}`} className="block text-sm font-semibold text-slate-700 mb-2">
            Start Time
          </label>
          <Input
            id={`start-time-${graphId}`}
            type="time"
            value={startTime}
            onChange={(e) => dispatch(setStartTime({ graphId, value: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor={`end-date-${graphId}`} className="block text-sm font-semibold text-slate-700 mb-2">
            End Date
          </label>
          <Input
            id={`end-date-${graphId}`}
            type="date"
            value={endDate}
            onChange={(e) => dispatch(setEndDate({ graphId, value: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor={`end-time-${graphId}`} className="block text-sm font-semibold text-slate-700 mb-2">
            End Time
          </label>
          <Input
            id={`end-time-${graphId}`}
            type="time"
            value={endTime}
            onChange={(e) => dispatch(setEndTime({ graphId, value: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor={`tool-sequence-${graphId}`} className="block text-sm font-semibold text-slate-700 mb-2">
            Select Tool
          </label>
          <Select
            id={`tool-sequence-${graphId}`}
            value={sequenceTool}
            onChange={(e) => dispatch(setSequenceTool({ graphId, value: e.target.value }))}
            options={toolSequenceOptions ? toolSequenceOptions.map(tool => ({ value: tool.id, label: `${tool.id}: ${tool.value}` })) : []}
            className="w-full"
          />
        </div>
        {/* Divider above search button in comparison mode */}
        {comparisonMode && <div className="border-t border-slate-200 my-2"></div>}
      </form>
    </div>
  );
};
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

export const FilterHeading = ({ graphId = 'graph1' }) => {
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
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Filters {graphId === 'graph1' ? '' : `(${graphId.toUpperCase()})`}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
        <div>
          <label htmlFor={`machine-select-${graphId}`} className="block text-sm font-medium text-gray-700">Machine</label>
          <Select
            id={`machine-select-${graphId}`} // Pass id to Select component
            value={machine}
            onChange={(e) => dispatch(setMachine({ graphId, value: e.target.value }))}
            options={[
              { value: 'SSP0173', label: 'SSP0173' },
              { value: 'SSP0167', label: 'SSP0167' },
            ]}
          />
        </div>

        <div>
          <label htmlFor={`start-date-${graphId}`} className="block text-sm font-medium text-gray-700">Start Date</label>
          <Input
            id={`start-date-${graphId}`} // Pass id to Input component
            type="date"
            value={startDate}
            onChange={(e) => dispatch(setStartDate({ graphId, value: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor={`start-time-${graphId}`} className="block text-sm font-medium text-gray-700">Start Time</label>
          <Input
            id={`start-time-${graphId}`} // Pass id to Input component
            type="time"
            value={startTime}
            onChange={(e) => dispatch(setStartTime({ graphId, value: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor={`end-date-${graphId}`} className="block text-sm font-medium text-gray-700">End Date</label>
          <Input
            id={`end-date-${graphId}`} // Pass id to Input component
            type="date"
            value={endDate}
            onChange={(e) => dispatch(setEndDate({ graphId, value: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor={`end-time-${graphId}`} className="block text-sm font-medium text-gray-700">End Time</label>
          <Input
            id={`end-time-${graphId}`} // Pass id to Input component
            type="time"
            value={endTime}
            onChange={(e) => dispatch(setEndTime({ graphId, value: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor={`tool-sequence-${graphId}`} className="block text-sm font-medium text-gray-700">Select Tool</label>
          <Select
            id={`tool-sequence-${graphId}`} // Pass id to Select component
            value={sequenceTool}
            onChange={(e) => dispatch(setSequenceTool({ graphId, value: e.target.value }))}
            options={toolSequenceOptions ? toolSequenceOptions.map(tool => ({ value: tool.id, label: `${tool.id}: ${tool.value}` })) : []}
          />
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors col-span-1"
        >
          Search
        </button>
      </div>
    </div>
  );
};
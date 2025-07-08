import Select from '../design-system/select';
import { Input } from '../design-system/input';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolSequences } from '../../features/toolSequences/toolSequencesSlice';
import { useEffect } from 'react';
import {
    setMachine,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
    setSequenceTool,
    resetFilters
  } from '../../features/filters/filtersSlice';
  

export const FilterHeading = () => {
    const dispatch = useDispatch();
  const {
    machine,
    startDate,
    startTime,
    endDate,
    endTime,
    sequenceTool,
  } = useSelector((state) => state.filters); // Get filter values from Redux store

  const { toolSequences, loading: toolSequencesLoading, error: toolSequencesError } = useSelector((state) => state.toolSequences); // Get tool sequences and loading state

  // Define static machine options
  const machineOptions = [
    { key: 'SSP0173', value: 'SSP0173' },
    { key: 'SSP0167', value: 'SSP0167' },
  ];

  // Define date limits from instructions
  const minDate = '2025-03-01';
  const maxDate = '2025-05-27';

  // Effect to fetch tool sequences when the selected machine changes
  useEffect(() => {
    if (machine) {
      dispatch(fetchToolSequences(machine));
    }
  }, [dispatch, machine]); // Re-fetch when machine changes

  // Effect to auto-select first tool when tool sequences are loaded
  useEffect(() => {
    if (toolSequences.length > 0 && !sequenceTool) {
      dispatch(setSequenceTool(toolSequences[0].key));
    }
  }, [toolSequences, sequenceTool, dispatch]);

  // Handle change for machine dropdown
  const handleMachineChange = (e) => {
    dispatch(setMachine(e.target.value));
  };

  // Handle change for date inputs (example, apply to all date/time inputs)
  const handleStartDateChange = (e) => {
    dispatch(setStartDate(e.target.value));
  };

  const handleEndDateChange = (e) => {
    dispatch(setEndDate(e.target.value));
  };

  // Handle change for sequence tool dropdown
  const handleSequenceToolChange = (e) => {
    dispatch(setSequenceTool(e.target.value));
  };

  return (
    <div className="w-full">
      <div className='flex text-sm flex-col sm:flex-row gap-3 sm:gap-2 items-start sm:items-center flex-wrap'>
        <div className="w-full sm:w-auto">
          <Select
            options={machineOptions}
            value={machine}
            onChange={handleMachineChange}
            className="w-full sm:min-w-32"
            label="Machine"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={minDate}
            max={maxDate}
            className="w-full sm:min-w-32 cursor-pointer"
            label="Start date"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => dispatch(setStartTime(e.target.value))}
            className="w-full sm:min-w-32 cursor-pointer"
            label="Start time"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={minDate}
            max={maxDate}
            className="w-full sm:min-w-32 cursor-pointer"
            label="End date"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Input
            type="time"
            value={endTime}
            onChange={(e) => dispatch(setEndTime(e.target.value))}
            className="w-full sm:min-w-32 cursor-pointer"
            label="End time"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select
            options={toolSequences}
            placeholder={toolSequencesLoading ? "Loading tools..." : "No tools available"}
            value={sequenceTool}
            onChange={handleSequenceToolChange}
            disabled={toolSequencesLoading!=='succeeded'}
            className="w-full sm:min-w-32 cursor-pointer"
            label="Select tool"
          />
        </div>
        {toolSequencesError && (
          <div className="w-full sm:w-auto">
            <span className="text-red-500 text-sm">Error: {toolSequencesError}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto ">
          <button
            className="bg-white hover:bg-neutral-100 hover:border-neutral-400 text-black px-4 py-2 rounded-md transition-colors w-full sm:w-auto border border-neutral-400 "
            onClick={() => dispatch(resetFilters())}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
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
    setSearch
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
    search
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

  // Handle change for search input
  const handleSearchChange = (e) => {
    dispatch(setSearch(e.target.value));
  };

  return (
    <div>
      <div className='flex gap-2 items-center '>
        <Select
          options={machineOptions}
          value={machine}
          onChange={handleMachineChange}
          className="w-48" 
        />

        <Input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          min={minDate}
          max={maxDate}
          className="w-48"
        />
        <Input
          type="time"
          value={startTime}
          onChange={(e) => dispatch(setStartTime(e.target.value))}
          className="w-36"
        />
        <Input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          min={minDate}
          max={maxDate}
          className="w-48"
        />
        <Input
          type="time"
          value={endTime}
          onChange={(e) => dispatch(setEndTime(e.target.value))}
          className="w-36"
        />

        <Select
          options={toolSequences}
          placeholder={toolSequencesLoading ? "Loading tools..." : "No tools available"}
          value={sequenceTool}
          onChange={handleSequenceToolChange}
          disabled={toolSequencesLoading!=='succeeded'} 
          className="w-48"
        />
        {toolSequencesError && <span className="text-red-500 text-sm">Error: {toolSequencesError}</span>}

        <Input
          placeholder="Search"
          value={search}
          onChange={handleSearchChange}
          className="w-64"
        />
      </div>

    </div>
  );
}
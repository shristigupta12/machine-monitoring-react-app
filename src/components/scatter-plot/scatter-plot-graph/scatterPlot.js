// src/components/scatter-plot/ScatterPlot.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAndProcessScatterMarkings } from '../../../features/scatterMarkings/scatterMarkingsSlice';

export const ScatterPlot = () => {
  const dispatch = useDispatch();

  const { machine, startDate, startTime, endDate, endTime, sequenceTool } = useSelector((state) => state.filters);

  const { scatterPoints, minMaxPoints, loading, error } = useSelector((state) => state.scatterMarkings);

  useEffect(() => {
    dispatch(fetchAndProcessScatterMarkings({ machineId: machine, startDate, startTime, endDate, endTime, sequenceTool }));
  }, [dispatch, machine, startDate, startTime, endDate, endTime, sequenceTool]); // Dependencies for re-fetching

  if (loading === 'pending') {
    return <div className="text-gray-600">Loading scatter plot data...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Scatter Plot Data</h2>
      {scatterPoints.length > 0 ? (
        <>
          <p className="text-gray-700">Displaying {scatterPoints.length} data points.</p>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-60">
            Scatter Points (first 5): {JSON.stringify(scatterPoints.slice(0, 5), null, 2)}
            <br />
            Min/Max Points: {JSON.stringify(minMaxPoints, null, 2)}
          </pre>
        </>
      ) : (
        <p className="text-gray-700">No scatter plot data available for the selected filters.</p>
      )}
    </div>
  );
};
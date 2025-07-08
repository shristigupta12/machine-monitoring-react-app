// src/pages/ScatterPlotPage.js
import React from 'react';
import { FilterHeading } from '../components/scatter-plot/filterHeading';
import { ScatterPlot } from '../components/scatter-plot/scatter-plot-graph/scatterPlot';
import { useSelector } from 'react-redux';
import { TimeSeriesGraph } from '../components/scatter-plot/time-series-graph/TimeSeriesGraph';

function ScatterPlotPage() {
  const isTimeSeriesGraphVisible = useSelector((state) => state.timeSeriesGraph.isVisible);

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Scatter Data</h1>
      <div className="mb-6 sm:mb-8">
        <FilterHeading />
      </div>
      <div className="mt-6 sm:mt-8">
        <ScatterPlot />
      </div>
      {isTimeSeriesGraphVisible && ( 
        <div className="mt-6 sm:mt-8">
          <TimeSeriesGraph />
        </div>
      )}
    </div>
  );
}

export default ScatterPlotPage;
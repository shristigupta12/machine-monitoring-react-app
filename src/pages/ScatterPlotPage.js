// src/pages/ScatterPlotPage.js
import React from 'react';
import { FilterHeading } from '../components/scatter-plot/filterHeading';
import { ScatterPlot } from '../components/scatter-plot/scatter-plot-graph/scatterPlot';
import { useSelector } from 'react-redux';
import { TimeSeriesGraph } from '../components/scatter-plot/time-series-graph/TimeSeriesGraph';

function ScatterPlotPage() {
  const isTimeSeriesGraphVisible = useSelector((state) => state.timeSeriesGraph.isVisible);

  return (
    <div >
      <h1 className="text-3xl font-bold mb-6">Scatter Data Visualization</h1>
      <FilterHeading />
      <div className="mt-8">
        <ScatterPlot />
      </div>
      {isTimeSeriesGraphVisible && ( 
        <div className="mt-8">
          <TimeSeriesGraph />
        </div>
      )}
    </div>
  );
}

export default ScatterPlotPage;
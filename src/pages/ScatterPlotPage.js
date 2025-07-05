// src/pages/ScatterPlotPage.js
import React from 'react';
import { FilterHeading } from '../components/scatter-plot/filterHeading';
import { ScatterPlot } from '../components/scatter-plot/scatter-plot-graph/scatterPlot';

function ScatterPlotPage() {
  return (
    <div className='flex flex-col gap-4'>
      <FilterHeading />
      <ScatterPlot />
    </div>
  );
}

export default ScatterPlotPage;
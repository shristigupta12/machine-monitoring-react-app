// src/pages/ScatterPlotPage.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FilterHeading } from '../components/scatter-plot/filterHeading';
import { ScatterPlot } from '../components/scatter-plot/scatter-plot-graph/scatterPlot';
import { TimeSeriesGraph } from '../components/scatter-plot/time-series-graph/TimeSeriesGraph';
import { toggleComparisonMode } from '../features/filters/filtersSlice';

function ScatterPlotPage() {
  const dispatch = useDispatch();
  // Get time series graph visibility for each graphId
  const isTimeSeriesGraph1Visible = useSelector((state) => state.timeSeriesGraph.graph1.isVisible);
  const isTimeSeriesGraph2Visible = useSelector((state) => state.timeSeriesGraph.graph2.isVisible);
  const isComparisonMode = useSelector((state) => state.filters.isComparisonMode);

  return (
    <div className='flex'>
      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Scatter Data</h1>
        
        {/* Render FilterHeading(s) based on comparison mode */}
        {isComparisonMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 sm:mb-8">
            <FilterHeading graphId="graph1" />
            <FilterHeading graphId="graph2" />
          </div>
        ) : (
          <div className="mb-6 sm:mb-8">
            <FilterHeading graphId="graph1" /> {/* Always pass graphId even in single mode */}
          </div>
        )}

        {/* Show Comparison Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => dispatch(toggleComparisonMode())}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isComparisonMode ? 'Hide Comparison' : 'Show Comparison'}
          </button>
        </div>

        {isComparisonMode ? (
          // Comparison Mode Layout
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 sm:mt-8">
            {/* Graph Set 1 */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Graph 1</h2>
              <ScatterPlot graphId="graph1" />
              {isTimeSeriesGraph1Visible && (
                <div className="mt-6 sm:mt-8">
                  <TimeSeriesGraph graphId="graph1" />
                </div>
              )}
            </div>
            {/* Graph Set 2 */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Graph 2</h2>
              <ScatterPlot graphId="graph2" />
              {isTimeSeriesGraph2Visible && (
                <div className="mt-6 sm:mt-8">
                  <TimeSeriesGraph graphId="graph2" />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Single Graph Mode Layout
          <div className="mt-6 sm:mt-8">
            <ScatterPlot graphId="graph1" /> {/* Always pass graphId in single mode */}
            {isTimeSeriesGraph1Visible && (
              <div className="mt-6 sm:mt-8">
                <TimeSeriesGraph graphId="graph1" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScatterPlotPage;
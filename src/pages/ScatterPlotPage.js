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
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Machine Performance Analytics
          </h1>
          <p className="text-slate-600 text-lg">
            Monitor and analyze machine performance data with interactive visualizations
          </p>
        </div>
        
        {/* Render FilterHeading(s) based on comparison mode */}
        {isComparisonMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card shadow-soft">
              <FilterHeading graphId="graph1" />
            </div>
            <div className="card shadow-soft">
              <FilterHeading graphId="graph2" />
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="card shadow-soft">
              <FilterHeading graphId="graph1" />
            </div>
          </div>
        )}

        {/* Show Comparison Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => dispatch(toggleComparisonMode())}
            className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {isComparisonMode ? 'Hide Comparison' : 'Show Comparison'}
          </button>
        </div>

        {isComparisonMode ? (
          // Comparison Mode Layout
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Graph Set 1 */}
            <div className="card shadow-soft p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                Graph 1
              </h2>
              <ScatterPlot graphId="graph1" />
              {isTimeSeriesGraph1Visible && (
                <div className="mt-8">
                  <TimeSeriesGraph graphId="graph1" />
                </div>
              )}
            </div>
            {/* Graph Set 2 */}
            <div className="card shadow-soft p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                Graph 2
              </h2>
              <ScatterPlot graphId="graph2" />
              {isTimeSeriesGraph2Visible && (
                <div className="mt-8">
                  <TimeSeriesGraph graphId="graph2" />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Single Graph Mode Layout
          <div className="card shadow-soft p-6">
            <ScatterPlot graphId="graph1" />
            {isTimeSeriesGraph1Visible && (
              <div className="mt-8">
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
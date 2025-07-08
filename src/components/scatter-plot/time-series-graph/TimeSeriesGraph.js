// src/components/scatter-plot/time-series-graph/TimeSeriesGraph.js
import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideTimeSeriesGraph } from '../../../features/timeSeriesGraph/timeSeriesGraphSlice';
import * as d3 from 'd3';

// Accept graphId as a prop
export const TimeSeriesGraph = ({ graphId = 'graph1' }) => { // Default to 'graph1'
  const dispatch = useDispatch();
  // Select state specific to this graphId
  const { isVisible, actualSignalData, idealSignalData, loading, error, selectedCycleData } = useSelector((state) => state.timeSeriesGraph[graphId]);
  const svgRef = useRef();
  const tooltipRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 250 });

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const width = Math.min(containerWidth - 32, 800); // Account for padding
        const height = Math.max(200, width * 0.3); // Maintain aspect ratio
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Check if data is defined before proceeding
    if (loading === 'pending' || error || (!actualSignalData && !idealSignalData) || (actualSignalData.length === 0 && idealSignalData.length === 0)) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { 
      top: 20, 
      right: 30, 
      bottom: 40, 
      left: width < 600 ? 50 : 70 
    };

    svg.selectAll('*').remove();

    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    // Combine data for domain calculation
    const allXValues = [...(actualSignalData || []).map(d => d.x), ...(idealSignalData || []).map(d => d.x)];
    const allYValues = [...(actualSignalData || []).map(d => d.y), ...(idealSignalData || []).map(d => d.y)];

    // Ensure domains are valid even if data is sparse
    const xScaleDomain = d3.extent(allXValues);
    const yScaleDomain = [0, d3.max(allYValues) + 20]; // Dynamic scaling

    const xScale = d3.scaleLinear()
                     .domain(xScaleDomain)
                     .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain(yScaleDomain)
                     .range([height - margin.top - margin.bottom, 0]);

    // Add X-axis (Time in seconds)
    g.append("g")
     .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
     .call(d3.axisBottom(xScale).ticks(width < 600 ? 5 : 10))
     .append("text")
     .attr("y", 35)
     .attr("x", (width - margin.left - margin.right) / 2)
     .attr("fill", "black")
     .attr("font-weight", "bold")
     .attr("font-size", width < 600 ? "12px" : "14px")
     .text("Seconds");

    // Add Y-axis (Signal intensity values)
    g.append("g")
     .call(d3.axisLeft(yScale))
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", -40)
     .attr("x", -(height - margin.top - margin.bottom) / 2)
     .attr("fill", "black")
     .attr("font-weight", "bold")
     .attr("text-anchor", "middle")
     .attr("font-size", width < 600 ? "12px" : "14px")
     .text("Signal Intensity");

    // Define the line generator for actual signal (Dark Blue)
    const lineActual = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    // Draw Actual Signal Line
    if (actualSignalData && actualSignalData.length > 0) {
        g.append("path")
          .datum(actualSignalData)
          .attr("fill", "none")
          .attr("stroke", "#0091EA") // Dark Blue
          .attr("stroke-width", width < 600 ? 1.5 : 2)
          .attr("d", lineActual);
    }


    // Define the line generator for ideal signal (Light Blue)
    const lineIdeal = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    // Draw Ideal Signal Line
    if (idealSignalData && idealSignalData.length > 0) {
        g.append("path")
          .datum(idealSignalData)
          .attr("fill", "none")
          .attr("stroke", "#B2EBF2") // Light Blue
          .attr("stroke-width", width < 600 ? 1.5 : 2)
          .attr("d", lineIdeal);
    }

    const dotRadius = width < 600 ? 2 : 3;

    // Draw dots for Actual Signal
    if (actualSignalData && actualSignalData.length > 0) {
        g.selectAll(".dot-actual")
        .data(actualSignalData)
        .enter()
        .append("circle")
        .attr("class", "dot-actual")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", dotRadius)
        .attr("fill", "#0091EA")
        .on("mouseover", (event, d) => {
          const containerRect = svgRef.current.getBoundingClientRect();
          d3.select(tooltipRef.current)
            .style("opacity", 1)
            .html(`
              <strong>Type:</strong> Actual<br/>
              <strong>X:</strong> ${d.x}<br/>
              <strong>Y:</strong> ${d.y}
            `)
            .style("left", (event.clientX - containerRect.left + 10) + "px")
            .style("top", (event.clientY - containerRect.top - 28) + "px");
        })
        .on("mouseout", () => {
          d3.select(tooltipRef.current).style("opacity", 0);
        });
    }

    // Draw dots for Ideal Signal
    if (idealSignalData && idealSignalData.length > 0) {
        g.selectAll(".dot-ideal")
        .data(idealSignalData)
        .enter()
        .append("circle")
        .attr("class", "dot-ideal")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", dotRadius)
        .attr("fill", "#B2EBF2")
        .on("mouseover", (event, d) => {
          const containerRect = svgRef.current.getBoundingClientRect();
          d3.select(tooltipRef.current)
            .style("opacity", 1)
            .html(`
              <strong>Type:</strong> Ideal<br/>
              <strong>X:</strong> ${d.x}<br/>
              <strong>Y:</strong> ${d.y}
            `)
            .style("left", (event.clientX - containerRect.left + 10) + "px")
            .style("top", (event.clientY - containerRect.top - 28) + "px");
        })
        .on("mouseout", () => {
          d3.select(tooltipRef.current).style("opacity", 0);
        });
    }

    // Implement zoom and pan functionality
    const zoom = d3.zoom()
      .scaleExtent([0.5, 20]) // Min and max zoom levels
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

  }, [actualSignalData, idealSignalData, loading, error, isVisible, dimensions, graphId]); // Add graphId to dependencies

  // Determine the reason for unprocessed cycle and color
  const getUnprocessedReason = (actual, min, max) => {
    if (min === null || max === null) {
      return { reason: "Configuration not found for this sequence", color: "red" };
    } else if (actual < min) {
      return { reason: "Less data points from the machine", color: "red" };
    } else if (actual > max) {
      return { reason: "More data points from the machine", color: "red" };
    }
    return { reason: "Within configured limits", color: "green" }; // Default for processed
  };

  const { actualDistance, minPoints, maxPoints, toolSequence, anomalyFlag } = selectedCycleData || {};
  const { reason: unprocessedReason, color: reasonColor } = actualDistance !== undefined
    ? getUnprocessedReason(actualDistance, minPoints, maxPoints)
    : { reason: "N/A", color: "gray" };

  // Calculate actual vs min/max expected points
  const actualDataPointsCount = actualSignalData ? actualSignalData.length : 'N/A';
  const minExpectedPoints = selectedCycleData?.minPoints !== null ? selectedCycleData.minPoints : 'N/A';
  const maxExpectedPoints = selectedCycleData?.maxPoints !== null ? selectedCycleData.maxPoints : 'N/A';


  // Only render if isVisible for this specific graphId
  if (!isVisible || (actualSignalData && actualSignalData.length === 0 && idealSignalData && idealSignalData.length === 0 && loading === 'idle')) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full p-4 bg-white rounded-lg shadow-sm mt-4 border" style={{ position: 'relative' }}>
      <h3 className="text-base sm:text-lg font-bold mb-2">Time Series Analysis: {selectedCycleData?.signal}</h3>
      {loading === 'pending' && <div className="text-gray-600">Loading time series data...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && (actualSignalData && actualSignalData.length === 0) && (idealSignalData && idealSignalData.length === 0) && (
        <p className="text-gray-700">No time series data available for the selected cycle.</p>
      )}
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full max-w-full"></svg>
      </div>
      <div
        ref={tooltipRef}
        className="absolute bg-gray-800 text-white p-2 rounded-md pointer-events-none text-xs"
        style={{ opacity: 0, position: 'absolute', zIndex: 9999 }}
      ></div>
      <button
        onClick={() => dispatch(hideTimeSeriesGraph({ graphId }))} // Pass graphId to hide action
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full sm:w-auto"
      >
        Hide Graph
      </button>

      {/* Reason for Unprocessed Cycle Section */}
      {selectedCycleData && anomalyFlag === null && ( // Only show for black points (anomalyFlag === null)
        <div className="mt-4 p-4 rounded-md border border-gray-300">
            <h4 className="text-md font-bold mb-2">Reason for Unprocessed Cycle</h4>
            <div className={`p-3 rounded-md ${reasonColor === 'red' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border-l-4`}>
                <p>
                    <strong>Tool Sequence {toolSequence}:</strong> {unprocessedReason}
                </p>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Actual Points (Distance)</p>
                    <p className="text-lg font-bold text-gray-800">{actualDistance !== undefined ? actualDistance.toFixed(2) : 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Min Expected Points</p>
                    <p className="text-lg font-bold text-green-600">{minExpectedPoints}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Max Expected Points</p>
                    <p className="text-lg font-bold text-green-600">{maxExpectedPoints}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
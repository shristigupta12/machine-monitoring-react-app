// src/components/scatter-plot/scatter-plot-graph/scatterPlot.js
import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAndProcessScatterMarkings } from '../../../features/scatterMarkings/scatterMarkingsSlice';
import { showTimeSeriesGraph, fetchAndProcessTimeSeriesData } from '../../../features/timeSeriesGraph/timeSeriesGraphSlice';
import * as d3 from 'd3';
import moment from 'moment';
import { GraphLabelDescription } from './graphLabelDescription';
import { UnprocessedToolList } from './unprocessedToolList';

export const ScatterPlot = ({ graphId = 'graph1' }) => {
  const dispatch = useDispatch();
  const { machine, startDate, startTime, endDate, endTime, sequenceTool } = useSelector((state) => state.filters[graphId]);
  const { scatterPoints, minMaxPoints, loading, error } = useSelector((state) => state.scatterMarkings[graphId]);

  const svgRef = useRef();
  const tooltipRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  const getColorForAnomaly = (anomaly) => {
    if (anomaly === false) {
      return '#4caf4fcb';
    } else if (anomaly === true) {
      return '#c62828e1';
    } else if (anomaly === null) {
      return '#3333339f';
    }
    return 'grey';
  };

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const width = Math.min(containerWidth - 32, 800); // Account for padding
        const height = Math.max(300, width * 0.5); // Maintain aspect ratio
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    dispatch(fetchAndProcessScatterMarkings({ graphId, machine, startDate, startTime, endDate, endTime, sequenceTool }));
  }, [dispatch, graphId, machine, startDate, startTime, endDate, endTime, sequenceTool]);

  useEffect(() => {
    // --- THIS IS THE CRITICAL PART FOR THE TypeError ---
    // Ensure scatterPoints is a valid array before proceeding with D3 operations
    if (loading === 'pending' || error || !scatterPoints || scatterPoints.length === 0) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { 
      top: 20, 
      right: 30, 
      bottom: 60, 
      left: width < 600 ? 50 : 70 
    };

    svg.selectAll('*').remove();

    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });
    
    svg.call(zoom);

    // Use a conditional domain for xScale and yScale to handle empty scatterPoints safely
    const xScale = d3.scaleTime()
                     .domain(scatterPoints.length > 0 ? d3.extent(scatterPoints, d => new Date(d.x)) : [new Date(), new Date()]) // Default domain for empty array
                     .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain(scatterPoints.length > 0 ? [0, d3.max(scatterPoints, d => d.y) + 50] : [0, 100]) // Default domain for empty array
                     .range([height - margin.top - margin.bottom, 0]);

    // Responsive axis formatting
    const xAxis = d3.axisBottom(xScale);
    if (width < 600) {
      xAxis.tickFormat(d3.timeFormat("%m/%d"));
    } else {
      xAxis.tickFormat(d3.timeFormat("%b %d"));
    }

    g.append("g")
     .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
     .call(xAxis)
     .append("text")
     .attr("y", 50)
     .attr("x", (width - margin.left - margin.right) / 2)
     .attr("fill", "black")
     .attr("font-weight", "bold")
     .attr("font-size", width < 600 ? "12px" : "14px")
     .text("Time");

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
     .text("Distance");

    const dotRadius = width < 600 ? 3 : 4;

    g.selectAll(".dot")
     .data(scatterPoints)
     .enter().append("circle")
     .attr("class", "dot")
     .attr("cx", d => xScale(new Date(d.x)))
     .attr("cy", d => yScale(d.y))
     .attr("r", dotRadius)
     .attr("fill", d => getColorForAnomaly(d.anomalyFlag))
     .on("mouseover", (event, d) => {
        if (!tooltipRef.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        d3.select(tooltipRef.current)
          .style("opacity", 1)
          .html(`
            <strong>Time:</strong> ${moment(d.x).format('YYYY-MM-DD HH:mm:ss')}<br/>
            <strong>Distance:</strong> ${d.y.toFixed(2)}<br/>
            <strong>Anomaly (Calculated):</strong> ${d.isAnomaly ? 'Yes' : 'No'}<br/>
            <strong>Anomaly (Raw Data):</strong> ${d.anomalyFlag === true ? 'True' : d.anomalyFlag === false ? 'False' : 'Null'}<br/>
            <strong>Tool Sequence:</strong> ${d.toolSequence}
          `)
          .style("left", (event.clientX - containerRect.left + 10) + "px")
          .style("top", (event.clientY - containerRect.top - 28) + "px")
          .style("pointer-events", "none");
      })
     .on("mouseout", () => {
        if (!tooltipRef.current) return;
        d3.select(tooltipRef.current).style("opacity", 0);
      })
     .on("click", (event, d) => {
        dispatch(showTimeSeriesGraph({
          graphId,
          machineId: machine,
          cyclelogId: d.cycle_log_id,
          signal: 'spindle_1_load',
          anomalyFlag: d.anomalyFlag,
          toolSequence: d.toolSequence,
          actualDistance: d.y,
          minPoints: minMaxPoints.min,
          maxPoints: minMaxPoints.max,
          threshold: minMaxPoints.threshold
        }));
        dispatch(fetchAndProcessTimeSeriesData({
          graphId,
          machineId: machine,
          cyclelogId: d.cycle_log_id,
          signal: 'spindle_1_load',
          anomalyFlag: d.anomalyFlag,
          toolSequence: d.toolSequence,
          actualDistance: d.y,
          minPoints: minMaxPoints.min,
          maxPoints: minMaxPoints.max,
          threshold: minMaxPoints.threshold
        }));
     });

    if (minMaxPoints.min !== null) {
      g.append("line")
       .attr("x1", 0)
       .attr("y1", yScale(minMaxPoints.min))
       .attr("x2", width - margin.left - margin.right)
       .attr("y2", yScale(minMaxPoints.min))
       .attr("stroke", "orange")
       .attr("stroke-dasharray", "5,5")
       .attr("class", "min-line");

      g.append("text")
       .attr("x", width - margin.left - margin.right + 5)
       .attr("y", yScale(minMaxPoints.min))
       .attr("dy", "0.35em")
       .attr("text-anchor", "start")
       .attr("fill", "orange")
       .attr("font-size", width < 600 ? "10px" : "12px")
       .text(`Min: ${minMaxPoints.min}`);
    }

    if (minMaxPoints.max !== null) {
      g.append("line")
       .attr("x1", 0)
       .attr("y1", yScale(minMaxPoints.max))
       .attr("x2", width - margin.left - margin.right)
       .attr("y2", yScale(minMaxPoints.max))
       .attr("stroke", "orange")
       .attr("stroke-dasharray", "5,5")
       .attr("class", "max-line");

      g.append("text")
       .attr("x", width - margin.left - margin.right + 5)
       .attr("y", yScale(minMaxPoints.max))
       .attr("dy", "0.35em")
       .attr("text-anchor", "start")
       .attr("fill", "orange")
       .attr("font-size", width < 600 ? "10px" : "12px")
       .text(`Max: ${minMaxPoints.max}`);
    }

    if (minMaxPoints.threshold !== null) {
        g.append("line")
         .attr("x1", 0)
         .attr("y1", yScale(minMaxPoints.threshold))
         .attr("x2", width - margin.left - margin.right)
         .attr("y2", yScale(minMaxPoints.threshold))
         .attr("stroke", "#EF9A9A")
         .attr("stroke-dasharray", "5,5")
         .attr("class", "threshold-line");

        g.append("text")
         .attr("x", width - margin.left - margin.right + 5)
         .attr("y", yScale(minMaxPoints.threshold))
         .attr("dy", "0.35em")
         .attr("text-anchor", "start")
         .attr("fill", "#EF9A9A")
         .attr("font-size", width < 600 ? "10px" : "12px")
         .text(`Threshold: ${minMaxPoints.threshold}`);
      }

  }, [scatterPoints, minMaxPoints, loading, error, dispatch, dimensions, graphId]);

  return (
    <div ref={containerRef} className="w-full p-4 bg-white rounded-lg shadow-sm border" style={{ position: 'relative' }}>
      <h2 className="text-lg sm:text-xl font-bold mb-4">Distance vs Time Scatter Plot</h2>
      {loading === 'pending' && <div className="text-gray-600">Loading scatter plot data...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {/* Updated condition to prevent accessing .length on undefined */}
      {!loading && !error && (!scatterPoints || scatterPoints.length === 0) && (
        <p className="text-gray-700">No scatter plot data available for the selected filters.</p>
      )}
      <div className='flex justify-between items-center sm:flex-row flex-col gap-2'>
        <UnprocessedToolList graphId={graphId} /> 
        <GraphLabelDescription />
      </div>
      <div className="w-full overflow-x-auto" style={{ position: 'relative' }}>
        <svg ref={svgRef} className="w-full max-w-full"></svg>
        {/* Tooltip is now inside the SVG container and only for this chart */}
        <div
          ref={tooltipRef}
          className="absolute bg-gray-800 text-white p-2 rounded-md pointer-events-none text-sm"
          style={{ opacity: 0, position: 'absolute', zIndex: 1000 }}
        ></div>
      </div>
    </div>
  );
};
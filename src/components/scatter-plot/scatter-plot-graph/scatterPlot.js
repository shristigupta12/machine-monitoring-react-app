import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAndProcessScatterMarkings } from '../../../features/scatterMarkings/scatterMarkingsSlice';
import { showTimeSeriesGraph, fetchAndProcessTimeSeriesData } from '../../../features/timeSeriesGraph/timeSeriesGraphSlice';
import * as d3 from 'd3';
import moment from 'moment';
import { GraphLabelDescription } from './graphLabelDescription';
import { UnprocessedToolList } from './unprocessedToolList';

export const ScatterPlot = () => {
  const dispatch = useDispatch();
  const { machine, startDate, startTime, endDate, endTime, sequenceTool } = useSelector((state) => state.filters);
  const { scatterPoints, minMaxPoints, loading, error } = useSelector((state) => state.scatterMarkings);

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
    dispatch(fetchAndProcessScatterMarkings({ machine, startDate, startTime, endDate, endTime, sequenceTool }));
  }, [dispatch, machine, startDate, startTime, endDate, endTime, sequenceTool]);

  useEffect(() => {
    if (loading === 'pending' || error || scatterPoints.length === 0) {
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

    const xScale = d3.scaleTime()
                     .domain(d3.extent(scatterPoints, d => new Date(d.x)))
                     .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(scatterPoints, d => d.y) + 50])
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
        d3.select(tooltipRef.current)
          .style("opacity", 0.9)
          .html(`
            <strong>Time:</strong> ${moment(d.x).format('YYYY-MM-DD HH:mm:ss')}<br/>
            <strong>Distance:</strong> ${d.y.toFixed(2)}<br/>
            <strong>Anomaly (Calculated):</strong> ${d.isAnomaly ? 'Yes' : 'No'}<br/>
            <strong>Anomaly (Raw Data):</strong> ${d.anomalyFlag === true ? 'True' : d.anomalyFlag === false ? 'False' : 'Null'}<br/>
            <strong>Tool Sequence:</strong> ${d.toolSequence}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
     .on("mouseout", () => {
        d3.select(tooltipRef.current).style("opacity", 0);
      })
     .on("click", (event, d) => {
        // Dispatch action to show Graph 2 and fetch its data
        dispatch(showTimeSeriesGraph({
          machineId: machine,
          cyclelogId: d.cycle_log_id,
          signal: 'spindle_1_load', // Assuming this is the signal for Graph 2
          anomalyFlag: d.anomalyFlag,
          toolSequence: d.toolSequence,
        }));
        dispatch(fetchAndProcessTimeSeriesData({
          machineId: machine,
          cyclelogId: d.cycle_log_id,
          signal: 'spindle_1_load',
          anomalyFlag: d.anomalyFlag,
          toolSequence: d.toolSequence,
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

  }, [scatterPoints, minMaxPoints, loading, error, dispatch, dimensions]);

  return (
    <div ref={containerRef} className="w-full p-4 bg-white rounded-lg shadow-sm border">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Distance vs Time Scatter Plot</h2>
      {loading === 'pending' && <div className="text-gray-600">Loading scatter plot data...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && scatterPoints.length === 0 && (
        <p className="text-gray-700">No scatter plot data available for the selected filters.</p>
      )}
      <div className='flex justify-between items-center sm:flex-row flex-col gap-2'>
        <UnprocessedToolList />
        <GraphLabelDescription />
      </div>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full max-w-full"></svg>
      </div>
      <div
        ref={tooltipRef}
        className="absolute bg-gray-800 text-white p-2 rounded-md pointer-events-none text-sm"
        style={{ opacity: 0, position: 'absolute', zIndex: 1000 }}
      ></div>
    </div>
  );
};
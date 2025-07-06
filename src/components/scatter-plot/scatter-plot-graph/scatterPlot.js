import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAndProcessScatterMarkings } from '../../../features/scatterMarkings/scatterMarkingsSlice';
import { showTimeSeriesGraph, fetchAndProcessTimeSeriesData } from '../../../features/timeSeriesGraph/timeSeriesGraphSlice';
import * as d3 from 'd3';
import moment from 'moment';

export const ScatterPlot = () => {
  const dispatch = useDispatch();
  const { machine, startDate, startTime, endDate, endTime, sequenceTool } = useSelector((state) => state.filters);
  const { scatterPoints, minMaxPoints, loading, error } = useSelector((state) => state.scatterMarkings);

  const svgRef = useRef();
  const tooltipRef = useRef();

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

  useEffect(() => {
    dispatch(fetchAndProcessScatterMarkings({ machine, startDate, startTime, endDate, endTime, sequenceTool }));
  }, [dispatch, machine, startDate, startTime, endDate, endTime, sequenceTool]);

  useEffect(() => {
    if (loading === 'pending' || error || scatterPoints.length === 0) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };

    svg.selectAll('*').remove();

    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
                     .domain(d3.extent(scatterPoints, d => new Date(d.x)))
                     .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(scatterPoints, d => d.y) + 50])
                     .range([height - margin.top - margin.bottom, 0]);

    g.append("g")
     .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
     .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")))
     .append("text")
     .attr("y", 50)
     .attr("x", (width - margin.left - margin.right) / 2)
     .attr("fill", "black")
     .attr("font-weight", "bold")
     .text("Time");

    g.append("g")
     .call(d3.axisLeft(yScale))
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", -50)
     .attr("x", -(height - margin.top - margin.bottom) / 2)
     .attr("fill", "black")
     .attr("font-weight", "bold")
     .attr("text-anchor", "middle")
     .text("Distance");

    g.selectAll(".dot")
     .data(scatterPoints)
     .enter().append("circle")
     .attr("class", "dot")
     .attr("cx", d => xScale(new Date(d.x)))
     .attr("cy", d => yScale(d.y))
     .attr("r", 4)
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
         .text(`Threshold: ${minMaxPoints.threshold}`);
      }

  }, [scatterPoints, minMaxPoints, loading, error, dispatch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Distance vs Time Scatter Plot</h2>
      {loading === 'pending' && <div className="text-gray-600">Loading scatter plot data...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && scatterPoints.length === 0 && (
        <p className="text-gray-700">No scatter plot data available for the selected filters.</p>
      )}
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="absolute bg-gray-800 text-white p-2 rounded-md pointer-events-none"
        style={{ opacity: 0, position: 'absolute' }}
      ></div>
    </div>
  );
};
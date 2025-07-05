import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAndProcessScatterMarkings } from '../../../features/scatterMarkings/scatterMarkingsSlice';
import * as d3 from 'd3';
import moment from 'moment'; // Ensure moment is imported if not already

export const ScatterPlot = () => {
  const dispatch = useDispatch();
  const { machine, startDate, startTime, endDate, endTime, sequenceTool } = useSelector((state) => state.filters);
  const { scatterPoints, minMaxPoints, loading, error } = useSelector((state) => state.scatterMarkings);

  const svgRef = useRef();
  const tooltipRef = useRef();

  // Define color mapping based on anomaly status from Instructions.pdf 
  const getColorForAnomaly = (anomaly) => {
    if (anomaly === false) {
      return '#4caf4fcb'; // Green for normal cycles 
    } else if (anomaly === true) {
      return '#c62828e1'; // Red for anomaly detected 
    } else if (anomaly === null) {
      return '#3333339f'; // Black for unknown status 
    }
    return 'grey'; // Fallback color if status is undefined/unexpected
  };

  // Fetch data whenever filters change
  useEffect(() => {
    dispatch(fetchAndProcessScatterMarkings({ machine, startDate, startTime, endDate, endTime, sequenceTool }));
  }, [dispatch, machine, startDate, startTime, endDate, endTime, sequenceTool]);

  // D3.js rendering logic
  useEffect(() => {
    if (loading === 'pending' || error || scatterPoints.length === 0) {
      // Clear previous plot if loading, error, or no data
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };

    // Clear any existing elements before redrawing
    svg.selectAll('*').remove();

    // Set SVG dimensions and viewbox for responsiveness
    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleTime()
                     .domain(d3.extent(scatterPoints, d => new Date(d.x)))
                     .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(scatterPoints, d => d.y) + 50])
                     .range([height - margin.top - margin.bottom, 0]);

    // Add X-axis
    g.append("g")
     .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
     .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")))
     .append("text")
     .attr("y", 50)
     .attr("x", (width - margin.left - margin.right) / 2)
     .attr("fill", "black")
     .attr("font-weight", "bold")
     .text("Time");

    // Add Y-axis
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

    // Add scatter points
    g.selectAll(".dot")
     .data(scatterPoints)
     .enter().append("circle")
     .attr("class", "dot")
     .attr("cx", d => xScale(new Date(d.x)))
     .attr("cy", d => yScale(d.y))
     .attr("r", 4)
     .attr("fill", d => getColorForAnomaly(d.anomalyFlag)) // Use getColorForAnomaly based on anomalyFlag
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
        console.log("Clicked point:", d);
     });

    // Add min/max and threshold lines (no changes here from previous implementation)
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
         .attr("stroke", "#EF9A9A") // Red line (#EF9A9A) for threshold 
         .attr("stroke-dasharray", "5,5")
         .attr("class", "threshold-line");
  
        g.append("text")
         .attr("x", width - margin.left - margin.right + 5)
         .attr("y", yScale(minMaxPoints.threshold))
         .attr("dy", "0.35em")
         .attr("text-anchor", "start")
         .attr("fill", "#EF9A9A") // Apply threshold color to text as well
         .text(`Threshold: ${minMaxPoints.threshold}`);
      }

  }, [scatterPoints, minMaxPoints, loading, error]);

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
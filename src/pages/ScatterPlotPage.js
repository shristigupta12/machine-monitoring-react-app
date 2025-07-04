import React, { useState, useEffect, useMemo } from 'react';
import { processMachineData } from '../utils/dataProcessor';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  LineChart,
  Line
} from 'recharts';
import moment from 'moment';

// Custom shape for scatter points to handle clicks
const CustomScatterPoint = (props) => {
  const { cx, cy, fill, payload, onClick } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5} // Radius of the circle
      fill={fill}
      cursor="pointer"
      onClick={() => onClick(payload)} // Pass the data payload on click
    />
  );
};

 // Custom Tooltip for detailed information on hover
 const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 shadow-lg rounded-md text-sm">
        <p className="font-bold text-gray-800">Cycle ID: {data.id}</p>
        <p className="text-gray-700">Sequence: {data.sequence}</p>
        <p className="text-gray-700">Time: {moment(data.time).format('MMM D, YYYY HH:mm')}</p>
        <p className="text-gray-700">Distance: {data.distance.toFixed(2)}</p>
        <p className={`font-semibold ${data.isAnomaly ? 'text-red-500' : 'text-green-500'}`}>
          Status: {data.isAnomaly ? 'Anomaly Detected' : 'Normal'}
        </p>
      </div>
    );
  }
  return null;
};

function ScatterPlotPage() {
  const [machineData, setMachineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCycleData, setSelectedCycleData] = useState(null); 

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting data processing...');
        const data = processMachineData('SSP0173');
        console.log('Data processing completed:', data);
        
        if (data && data.scatterPoints && data.scatterPoints.length > 0) {
          // Limit the number of points to prevent performance issues
          const limitedData = {
            ...data,
            scatterPoints: data.scatterPoints.slice(0, 500) // Limit to 500 points
          };
          setMachineData(limitedData);
        } else {
          setError('No valid data available for SSP0173.');
        }
      } catch (err) {
        console.error("Error processing machine data:", err);
        setError("An error occurred while processing data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter data for normal and anomalous points for separate plotting
  const normalPoints = useMemo(() => {
    return machineData ? machineData.scatterPoints.filter(point => !point.isAnomaly) : [];
  }, [machineData]);

  const anomalyPoints = useMemo(() => {
    return machineData ? machineData.scatterPoints.filter(point => point.isAnomaly) : [];
  }, [machineData]);

  if (loading) {
    return <div className="p-4 text-center text-gray-700">Loading machine data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  console.log("machine data detailed series: ", machineData.detailedTimeSeries)

  if (!machineData || machineData.scatterPoints.length === 0) {
    return <div className="p-4 text-center text-gray-700">No scatter plot data available.</div>;
  }  

  const totalPoints = machineData.scatterPoints.length;
  const totalAnomalies = Object.keys(machineData.anomalies).length;

  const sequenceIdToShowThresholds = '101';
  const thresholdsForSeq = machineData.thresholds[sequenceIdToShowThresholds];

  const allDistances = machineData.scatterPoints.map(point => point.distance);
  const allTimes = machineData.scatterPoints.map(point => point.time);
  const minDistance = Math.min(...allDistances);
  const maxDistance = Math.max(...allDistances);
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);

  // Handler for scatter point click
  const handlePointClick = (data) => {
    console.log('Clicked Point Data:', data);
    const cycleId = data.id;
    const sequenceId = data.sequence;
    if (machineData.detailedTimeSeries[cycleId] && machineData.detailedTimeSeries[cycleId][sequenceId]) {
      setSelectedCycleData({
        cycleId,
        sequenceId,
        timeSeries: machineData.detailedTimeSeries[cycleId][sequenceId]
      });
    } else {
      setSelectedCycleData(null);
      console.log("Fetching detailed data for:", cycleId, sequenceId);
      console.warn(`No detailed time series data found for Cycle ID: ${cycleId}, Sequence ID: ${sequenceId}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Machine Performance Dashboard - SSP0173</h1>
      <p className="text-gray-600 mb-2">Total Data Points Processed: <span className="font-semibold text-blue-600">{totalPoints}</span></p>
      <p className="text-gray-600 mb-6">Total Unique Cycles with Anomalies: <span className="font-semibold text-red-600">{totalAnomalies}</span></p>

      <div className="mt-8 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Distance vs Time Scatter Plot</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="time"
              name="Time"
              domain={[minTime, maxTime]}
              tickFormatter={(unixTime) => moment(unixTime).format('MMM D')}
              scale="time"
            />
            <YAxis
              type="number"
              dataKey="distance"
              name="Distance"
              domain={[minDistance, maxDistance]}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Legend />

            <Scatter
              name="Normal Cycles"
              data={normalPoints}
              fill="#82ca9d"
              key="normal"
              shape={<CustomScatterPoint onClick={handlePointClick} />} // Use custom shape for click
            />

            <Scatter
              name="Anomalous Cycles"
              data={anomalyPoints}
              fill="#ff7300"
              key="anomaly"
              shape={<CustomScatterPoint onClick={handlePointClick} />} // Use custom shape for click
            />

            {thresholdsForSeq && (
              <ReferenceArea
                y1={thresholdsForSeq.min}
                y2={thresholdsForSeq.max}
                stroke="#ff0000"
                strokeOpacity={0.1}
                fill="#ff0000"
                fillOpacity={0.1}
                label={{ value: `Seq ${sequenceIdToShowThresholds} Threshold`, position: 'insideTopLeft', fill: '#ff0000' }}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Time Series Plot for Selected Cycle */}
      {selectedCycleData && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Time Series for Cycle: {selectedCycleData.cycleId} (Sequence: {selectedCycleData.sequenceId})
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={selectedCycleData.timeSeries.black} // Assuming 'black' is primary for now
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#000000" dot={false} name="Black" />
              {selectedCycleData.timeSeries.green && (
                <Line type="monotone" dataKey="value" data={selectedCycleData.timeSeries.green} stroke="#0088FE" dot={false} name="Green" />
              )}
              {selectedCycleData.timeSeries.red && (
                <Line type="monotone" dataKey="value" data={selectedCycleData.timeSeries.red} stroke="#FF0000" dot={false} name="Red" />
              )}
            </LineChart>
          </ResponsiveContainer>
          <button
            onClick={() => setSelectedCycleData(null)}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}

export default ScatterPlotPage;
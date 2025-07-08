// src/components/scatter-plot/unprocessedToolList.js
import React from 'react';
import { useSelector } from 'react-redux';

// Accept graphId as a prop
export const UnprocessedToolList = ({ graphId = 'graph1' }) => { // Default to 'graph1'
    // Access scatterPoints specific to this graphId from the Redux store
    const { scatterPoints } = useSelector((state) => state.scatterMarkings[graphId]);

    // Filter and count points where anomalyFlag is null (representing black points)
    // Add check for scatterPoints being defined
    const unprocessedCount = scatterPoints ? scatterPoints.filter(point => point.anomalyFlag === null).length : 0;

    return (
        <div className="bg-gray-100 p-2 rounded-md text-sm font-semibold text-gray-800">
            Unprocessed Data Points (Black Points): <span className="text-blue-600">{unprocessedCount}</span>
        </div>
    );
};
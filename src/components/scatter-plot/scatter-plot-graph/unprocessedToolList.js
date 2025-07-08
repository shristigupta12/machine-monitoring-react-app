// src/components/scatter-plot/unprocessedToolList.js
import React from 'react';
import { useSelector } from 'react-redux';

export const UnprocessedToolList = () => {
    // Access scatterPoints from the Redux store
    const { scatterPoints } = useSelector((state) => state.scatterMarkings);

    // Filter and count points where anomalyFlag is null (representing black points)
    const unprocessedCount = scatterPoints.filter(point => point.anomalyFlag === null).length;

    return (
        <div className="bg-gray-100 p-2 rounded-md text-sm font-semibold text-gray-800">
            Unprocessed Data Points (Black Points): <span className="text-blue-600">{unprocessedCount}</span>
        </div>
    );
};
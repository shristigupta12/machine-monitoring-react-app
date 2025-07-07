// src/api/processFlowDataApi.js
import graphData from '../data/graphViz.json';

/**
 * Simulates fetching graph data from an API.
 * In a real application, this would involve a network request.
 * @returns {Promise<Object>} A promise that resolves with the graph data.
 */
export const fetchGraphData = async () => {
  return new Promise(resolve => {
    // Simulate network latency
    setTimeout(() => {
      resolve(graphData);
    }, 100);
  });
};
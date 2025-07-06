import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import graphData from '../data/graphViz.json'; // Import your JSON data [cite: 689]

const initialNodes = [];
const initialEdges = [];

// Helper function to generate a unique position for each node
// This is a simple grid-based layout; for more complex layouts, consider a layout library like dagre-d3
const getNodePosition = (index) => {
  const xOffset = 250;
  const yOffset = 100;
  const nodesPerRow = 5;
  const row = Math.floor(index / nodesPerRow);
  const col = index % nodesPerRow;
  return { x: col * xOffset, y: row * yOffset };
};

function ProcessFlowPage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  useEffect(() => {
    if (graphData && graphData.prod_machine_map) { // [cite: 691]
      const newNodes = graphData.prod_machine_map.map((nodeData, index) => { // [cite: 691]
        let nodeColor = '#FFFFFF'; // Default white 
        if (graphData.not_allowed_list.includes(nodeData.machine_id)) { // , [cite: 806]
          nodeColor = '#dc3545'; // Red for not_allowed_list [cite: 839]
        } else if (graphData.bypass_list.includes(nodeData.machine_id)) { // , [cite: 805]
          nodeColor = '#007bff'; // Blue for bypass_list [cite: 836]
        }

        return {
          id: String(nodeData.id), // Unique identifier [cite: 672], [cite: 692]
          type: 'default', // You can define custom node types if needed
          position: getNodePosition(index),
          data: {
            label: (
              <>
                <strong>ID:</strong> {nodeData.id}
                <br />
                <strong>Machine No:</strong> {nodeData.station_number} {/* [cite: 673], [cite: 695] */}
                <br />
                <strong>Name:</strong> {nodeData.name} {/* [cite: 673], [cite: 694] */}
              </>
            ),
          },
          style: {
            backgroundColor: nodeColor,
            border: '1px solid #333',
            padding: 10,
            borderRadius: 5,
            width: 180,
            textAlign: 'center',
          },
        };
      });

      const newEdges = [];
      graphData.prod_machine_map.forEach(nodeData => { // [cite: 691]
        nodeData.input_stations.forEach(inputStationId => { // [cite: 675], [cite: 696]
          newEdges.push({
            id: `e-${inputStationId}-${nodeData.id}`,
            source: String(inputStationId),
            target: String(nodeData.id),
            animated: true, // Optional: for a dynamic look
          });
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  return (
    <div style={{ width: '100vw', height: '90vh' }}>
      <h1>Process Flow Management</h1>
      <p>Interactive process flow graph for industrial machine monitoring.</p>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView // Zooms to fit all elements in the view
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default ProcessFlowPage;
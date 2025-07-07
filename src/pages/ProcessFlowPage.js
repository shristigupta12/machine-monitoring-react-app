import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchGraphData } from '../api/processFlowApi';

const initialNodes = [];
const initialEdges = [];

// Helper function to generate a unique position for each node
const getNodePosition = (index) => {
  const xOffset = 250;
  const yOffset = 100;
  const nodesPerRow = 5;
  const row = Math.floor(index / nodesPerRow);
  const col = index % nodesPerRow;
  return { x: col * xOffset, y: row * yOffset };
};

function ProcessFlowPage() {
  const [graphData, setGraphData] = useState(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeStationNumber, setNewNodeStationNumber] = useState('');
  const [isBypassed, setIsBypassed] = useState(false);
  const [isNotAllowed, setIsNotAllowed] = useState(false);
  const [hoveredNodeDetails, setHoveredNodeDetails] = useState(null);

  // Effect to fetch initial graph data when the component mounts
  useEffect(() => {
    const getGraphData = async () => {
      const data = await fetchGraphData();
      setGraphData(data);
    };
    getGraphData();
  }, []);

  // Effect to update nodes and edges whenever graphData changes
  useEffect(() => {
    if (graphData && graphData.prod_machine_map) {
      const newNodes = graphData.prod_machine_map.map((nodeData, index) => {
        let nodeColor = '#FFFFFF'; // Default white
        if (graphData.not_allowed_list.includes(nodeData.machine_id)) {
          nodeColor = '#dc3545'; // Red for not_allowed_list
        } else if (graphData.bypass_list.includes(nodeData.machine_id)) {
          nodeColor = '#007bff'; // Blue for bypass_list
        }

        return {
          id: String(nodeData.id), // Unique identifier
          type: 'default',
          position: getNodePosition(index),
          data: {
            label: (
              <>
                <strong>ID:</strong> {nodeData.id}
                <br />
                <strong>Machine No:</strong> {nodeData.station_number}
                <br />
                <strong>Name:</strong> {nodeData.name}
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
      graphData.prod_machine_map.forEach(nodeData => {
        nodeData.input_stations.forEach(inputStationId => {
          newEdges.push({
            id: `e-${inputStationId}-${nodeData.id}`,
            source: String(inputStationId),
            target: String(nodeData.id),
            animated: true,
          });
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [graphData]);

  // Effect to populate the form when selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId && graphData) {
      const nodeToEdit = graphData.prod_machine_map.find(
        (node) => String(node.id) === selectedNodeId
      );
      if (nodeToEdit) {
        setNewNodeName(nodeToEdit.name);
        setNewNodeStationNumber(nodeToEdit.station_number);
        setIsBypassed(graphData.bypass_list.includes(nodeToEdit.machine_id));
        setIsNotAllowed(graphData.not_allowed_list.includes(nodeToEdit.machine_id));
      }
    } else {
      // Clear form when no node is selected
      setNewNodeName('');
      setNewNodeStationNumber('');
      setIsBypassed(false);
      setIsNotAllowed(false);
    }
  }, [selectedNodeId, graphData]);

  // Simulate API call to update graph data (e.g., after modifying a node)
  const updateGraphData = useCallback((updatedData) => {
    setGraphData(updatedData);
  }, []);

  // Function to update properties of a specific node
  const updateNodeProperties = useCallback(() => {
    if (!selectedNodeId || !graphData) return;

    const updatedProdMachineMap = graphData.prod_machine_map.map(node => {
      if (String(node.id) === selectedNodeId) {
        return {
          ...node,
          name: newNodeName || node.name,
          station_number: newNodeStationNumber || node.station_number,
        };
      }
      return node;
    });

    // Update bypass_list and not_allowed_list
    let updatedBypassList = [...graphData.bypass_list];
    let updatedNotAllowedList = [...graphData.not_allowed_list];
    const selectedMachineId = graphData.prod_machine_map.find(node => String(node.id) === selectedNodeId)?.machine_id;

    if (selectedMachineId !== undefined) {
      // Remove from both lists first to ensure correct state
      updatedBypassList = updatedBypassList.filter(id => id !== selectedMachineId);
      updatedNotAllowedList = updatedNotAllowedList.filter(id => id !== selectedMachineId);

      if (isBypassed) {
        updatedBypassList.push(selectedMachineId);
      }
      if (isNotAllowed) {
        updatedNotAllowedList.push(selectedMachineId);
      }
    }

    const updatedGraphData = {
      ...graphData,
      prod_machine_map: updatedProdMachineMap,
      bypass_list: updatedBypassList,
      not_allowed_list: updatedNotAllowedList,
    };
    updateGraphData(updatedGraphData);
  }, [selectedNodeId, newNodeName, newNodeStationNumber, isBypassed, isNotAllowed, graphData, updateGraphData]);

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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Callback for mouse entering a node
  const onNodeMouseEnter = useCallback((event, node) => {
    if (graphData && graphData.prod_machine_map) {
      const fullNodeData = graphData.prod_machine_map.find(data => String(data.id) === node.id);
      if (fullNodeData) {
        const isNodeBypassed = graphData.bypass_list.includes(fullNodeData.machine_id);
        const isNodeNotAllowed = graphData.not_allowed_list.includes(fullNodeData.machine_id);
        setHoveredNodeDetails({
          name: fullNodeData.name,
          id: fullNodeData.id,
          station_number: fullNodeData.station_number,
          isBypassed: isNodeBypassed ? 'Yes' : 'No', // Display as 'Yes'/'No'
          isNotAllowed: isNodeNotAllowed ? 'Yes' : 'No', // Display as 'Yes'/'No'
        });
      }
    }
  }, [graphData]);

  // Callback for mouse leaving a node
  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeDetails(null);
  }, []);

  if (!graphData) {
    return <div>Loading process flow data...</div>;
  }

  return (
    <div style={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <h1>Process Flow Management</h1>
      <p>Interactive process flow graph for industrial machine monitoring.</p>

      <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
        <h2>Modify Node</h2>
        <label>
          Select Node ID:
          <select value={selectedNodeId} onChange={(e) => setSelectedNodeId(e.target.value)}>
            <option value="">--Select--</option>
            {graphData.prod_machine_map.map(node => (
              <option key={node.id} value={node.id}>{node.id} - {node.name}</option>
            ))}
          </select>
        </label>
        <br />
        <label>
          New Node Name:
          <input
            type="text"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Enter new name"
          />
        </label>
        <br />
        <label>
          New Station Number:
          <input
            type="text"
            value={newNodeStationNumber}
            onChange={(e) => setNewNodeStationNumber(e.target.value)}
            placeholder="Enter new station number"
          />
        </label>
        <br />
        <label>
          Is Bypassed:
          <input
            type="checkbox"
            checked={isBypassed}
            onChange={(e) => setIsBypassed(e.target.checked)}
          />
        </label>
        <br />
        <label>
          Is Not Allowed:
          <input
            type="checkbox"
            checked={isNotAllowed}
            onChange={(e) => setIsNotAllowed(e.target.checked)}
          />
        </label>
        <br />
        <button onClick={updateNodeProperties}>Update Node</button>
      </div>

      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          fitView
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Node Details Panel for Hover */}
        {hoveredNodeDetails && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
            maxHeight: '80%',
            overflowY: 'auto',
            maxWidth: '300px',
            fontSize: '0.9em',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h3>Node Details (Hover)</h3>
            <p style={{ margin: '5px 0' }}><strong>Name:</strong> {hoveredNodeDetails.name}</p>
            <p style={{ margin: '5px 0' }}><strong>ID:</strong> {hoveredNodeDetails.id}</p>
            <p style={{ margin: '5px 0' }}><strong>Station No:</strong> {hoveredNodeDetails.station_number}</p>
            <p style={{ margin: '5px 0' }}><strong>Is Bypassed:</strong> {hoveredNodeDetails.isBypassed}</p>
            <p style={{ margin: '5px 0' }}><strong>Is Not Allowed:</strong> {hoveredNodeDetails.isNotAllowed}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProcessFlowPage;
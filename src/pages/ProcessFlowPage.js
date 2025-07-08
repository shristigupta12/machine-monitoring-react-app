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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

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
          nodeColor = '#ef4444'; // Red for not_allowed_list
        } else if (graphData.bypass_list.includes(nodeData.machine_id)) {
          nodeColor = '#3b82f6'; // Blue for bypass_list
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
            border: '2px solid #e2e8f0',
            padding: 12,
            borderRadius: 8,
            width: 200,
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            fontSize: '12px',
            fontWeight: '500',
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
            style: { stroke: '#3b82f6', strokeWidth: 2 },
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
    (changes) => {
      // Check if any change is a drag operation
      const hasDragChange = changes.some(change => change.type === 'position' && change.dragging !== undefined);
      if (hasDragChange) {
        const dragChange = changes.find(change => change.type === 'position' && change.dragging !== undefined);
        setIsDragging(dragChange.dragging);
        
        // Hide hover details when dragging starts
        if (dragChange.dragging) {
          setHoveredNodeDetails(null);
        }
      }
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
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
    // Don't show hover details if currently dragging
    if (isDragging) return;
    
    if (graphData && graphData.prod_machine_map) {
      const fullNodeData = graphData.prod_machine_map.find(data => String(data.id) === node.id);
      if (fullNodeData) {
        const isNodeBypassed = graphData.bypass_list.includes(fullNodeData.machine_id);
        const isNodeNotAllowed = graphData.not_allowed_list.includes(fullNodeData.machine_id);
        setHoveredNodeDetails({
          name: fullNodeData.name,
          id: fullNodeData.id,
          station_number: fullNodeData.station_number,
          isBypassed: isNodeBypassed ? 'Yes' : 'No',
          isNotAllowed: isNodeNotAllowed ? 'Yes' : 'No',
        });
        // Set mouse position for tooltip
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    }
  }, [graphData, isDragging]);

  // Callback for mouse leaving a node
  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeDetails(null);
  }, []);

  // Handle mouse move for dynamic tooltip positioning
  const onMouseMove = useCallback((event) => {
    if (hoveredNodeDetails && !isDragging) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  }, [hoveredNodeDetails, isDragging]);

  if (!graphData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading process flow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Process Flow Management
        </h1>
        <p className="text-slate-600">
          Interactive process flow graph for industrial machine monitoring and optimization.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Form Panel */}
        <div className="lg:w-80 p-6 bg-white shadow-soft border-r border-slate-200">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Modify Node</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Node ID:
              </label>
              <select 
                value={selectedNodeId} 
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="form-select w-full"
              >
                <option value="">--Select a node--</option>
                {graphData.prod_machine_map.map(node => (
                  <option key={node.id} value={node.id}>{node.id} - {node.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Node Name:
              </label>
              <input
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="Enter new name"
                className="form-control w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Station Number:
              </label>
              <input
                type="text"
                value={newNodeStationNumber}
                onChange={(e) => setNewNodeStationNumber(e.target.value)}
                placeholder="Enter new station number"
                className="form-control w-full"
              />
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBypassed}
                  onChange={(e) => setIsBypassed(e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm font-medium text-slate-700">Is Bypassed</span>
              </label>
              
              <label className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNotAllowed}
                  onChange={(e) => setIsNotAllowed(e.target.checked)}
                  className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                />
                <span className="text-sm font-medium text-slate-700">Is Not Allowed</span>
              </label>
            </div>
            
            <button 
              onClick={updateNodeProperties}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Node
            </button>
          </div>
        </div>

        {/* ReactFlow Container */}
        <div 
          className="flex-1 relative min-h-0 bg-gradient-to-br from-slate-50 to-blue-50"
          onMouseMove={onMouseMove}
        >
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
            className="w-full h-full"
          >
            <Controls className="shadow-soft" />
            <Background variant="dots" gap={20} size={1} color="#cbd5e1" />
          </ReactFlow>

          {/* Dynamic Node Details Panel - Only show when not dragging */}
          {hoveredNodeDetails && !isDragging && (
            <div 
              className="fixed bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-strong z-50 max-w-xs pointer-events-none"
              style={{
                left: mousePosition.x + 10,
                top: mousePosition.y - 10,
                transform: 'translateY(-50%)'
              }}
            >
              <h3 className="font-semibold text-sm mb-3 text-slate-800">Node Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Name:</span>
                  <span className="font-medium text-slate-800">{hoveredNodeDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ID:</span>
                  <span className="font-medium text-slate-800">{hoveredNodeDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Station No:</span>
                  <span className="font-medium text-slate-800">{hoveredNodeDetails.station_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bypassed:</span>
                  <span className={`font-medium ${hoveredNodeDetails.isBypassed === 'Yes' ? 'text-blue-600' : 'text-slate-600'}`}>
                    {hoveredNodeDetails.isBypassed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Not Allowed:</span>
                  <span className={`font-medium ${hoveredNodeDetails.isNotAllowed === 'Yes' ? 'text-red-600' : 'text-slate-600'}`}>
                    {hoveredNodeDetails.isNotAllowed}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcessFlowPage;
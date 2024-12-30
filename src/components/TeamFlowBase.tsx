import React, { memo, useCallback, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  useStore,
} from "@xyflow/react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import AgentSidebar from "./AgentSidebar";
import Styles from "./TeamFlowBase.module.css";
import "@xyflow/react/dist/style.css";

interface Agent {
  id: string;
  title: string;
  description: string;
  model: string;
  relationships: string[];
}

interface NodeData {
  label: string;
  model: string;
  description: string;
}

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const initialNodes = [
  {
    id: "1",
    type: "editable",
    position: { x: 0, y: 0 },
    data: { label: "1", model: "GPT-4o", description: "test" },
  },
  {
    id: "2",
    type: "editable",
    position: { x: 0, y: 100 },
    data: { label: "2" },
  },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const TeamFlowBase: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    data: Agent;
  } | null>(null);

  const handleEditAgent = (id: string, updatedAgent: Agent): void => {
    // Update the nodes
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                label: updatedAgent.title,
                description: updatedAgent.description,
                model: updatedAgent.model,
              },
            }
          : node
      )
    );

    // Update the agents list
    setAgents((prevAgents) =>
      prevAgents.map((agent) => (agent.id === id ? updatedAgent : agent))
    );

    // Update the edges
    setEdges((prevEdges) => {
      // Remove existing edges for this node
      const filteredEdges = prevEdges.filter((edge) => edge.source !== id);

      // Add new relationship edges
      const newEdges = updatedAgent.relationships.map((targetId) => ({
        id: `e${id}-${targetId}`,
        source: id,
        target: targetId,
      }));

      return [...filteredEdges, ...newEdges];
    });
  };

  const handleAddAgent = (newAgent: Agent): void => {
    const newNode: Node = {
      id: newAgent.id,
      type: "editable",
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        label: newAgent.title,
        description: newAgent.description,
        model: newAgent.model,
      },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
    setAgents((prevAgents) => [...prevAgents, newAgent]);

    if (newAgent.relationships && newAgent.relationships.length > 0) {
      const newEdges: Edge[] = newAgent.relationships.map((targetId) => ({
        id: `e${newAgent.id}-${targetId}`,
        source: newAgent.id,
        target: targetId,
      }));
      setEdges((eds) => [...eds, ...newEdges]);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const EditableNode = memo(({ id, data }) => {
    return (
      <div className={Styles.editableNode}>
        <div className={Styles.editableNodeHeader}>
          <div>{data.label}</div>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedNode({ id, data });
              setIsDrawerOpen(true);
            }}
            className={Styles.editableNodeIcon}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </div>
        {data.model && (
          <div className={Styles.editableNodeModel}>Model: {data.model}</div>
        )}
        {data.description && (
          <div className={Styles.editableNodeDescription}>
            {data.description}
          </div>
        )}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  });

  const nodeTypes = {
    editable: EditableNode,
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setIsDrawerOpen(true)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        Add Agent
      </Button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />

      <AgentSidebar
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddAgent={handleAddAgent}
        onEditAgent={handleEditAgent}
        existingAgents={agents}
        editingNode={selectedNode}
      />
    </div>
  );
};

export default TeamFlowBase;

import React, { memo, useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
// import BugReportIcon from "@mui/icons-material/BugReport";
import { Button, TextField, Box, Typography, Link, CircularProgress, Backdrop } from "@mui/material";
import AgentSidebar from "./AgentSidebar";
import TaskPanel from "./TaskPanel";
import Styles from "./TeamFlowBase.module.css";
import "@xyflow/react/dist/style.css";
import Api from "../data/Api";
import { Agent, AgentType, CreateAgentRequest } from "../data/Interfaces";
import { TaskOutput } from "../data/TaskInterfaces";

interface CustomNodeData {
  label: string;
  model?: string;
  agentType: AgentType;
  description?: string;
  [key: string]: unknown;
}

type CustomNode = Node<CustomNodeData>;

const initialNodes: CustomNode[] = [];
const initialEdges: Edge[] = [];

const TeamFlowBase: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    data: Agent;
  } | null>(null);
  const [taskOutputs, setTaskOutputs] = useState<TaskOutput[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [tempApiKey, setTempApiKey] = useState<string>("");
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false);
  const [isServerStarting, setIsServerStarting] = useState<boolean>(false);

  const CANVAS_CENTER_X = 500;
  const CANVAS_CENTER_Y = 300;
  const WORKER_Y_OFFSET = 200;
  const WORKER_X_SPACING = 300;

  const calculateNodePosition = (agents: Agent[]) => {
    // If this is the first agent (supervisor), place it in the center
    if (agents.length === 0) {
      return {
        x: CANVAS_CENTER_X + 100,
        y: CANVAS_CENTER_Y - WORKER_Y_OFFSET / 2,
      };
    }

    const workerIndex = agents.length - 1;
    const startX = workerIndex * WORKER_X_SPACING + 100;

    return {
      x: startX,
      y: CANVAS_CENTER_Y + WORKER_Y_OFFSET / 2,
    };
  };

  useEffect(() => {
    const loadAgents = async () => {
      if (apiKey) {
        try {
          const loadedAgents = await Api.getAgents();
          setAgents(loadedAgents);

          // Create nodes from loaded agents
          const newNodes = loadedAgents.map((agent) => ({
            id: agent.id,
            type: "editable",
            position: calculateNodePosition(loadedAgents),
            data: {
              label: agent.id,
              agentType: agent.agent_type,
              description: agent.system_prompt,
            },
          }));
          setNodes(newNodes);

          // Create edges from relationships
          const newEdges = loadedAgents.flatMap((agent) =>
            agent.relationships.map((rel) => ({
              id: `e${agent.id}-${rel.to_agent}`,
              source: agent.id,
              target: rel.to_agent,
            }))
          );
          setEdges(newEdges);
        } catch (error) {
          console.error("Failed to load agents:", error);
        }
      }
    };
    loadAgents();
  }, [apiKey]);

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempApiKey.trim()) {
      try {
        setIsServerStarting(true);
        await Api.setApiKey(tempApiKey.trim());
        setApiKey(tempApiKey.trim());
      } catch (error) {
        console.error("Failed to set API key:", error);
      } finally {
        setIsServerStarting(false);
      }
    }
  };

  const handleEditAgent = async (
    id: string,
    updatedAgent: Agent
  ): Promise<void> => {
    try {
      const agentRequest: CreateAgentRequest = {
        id: updatedAgent.id,
        agent_type: updatedAgent.agent_type,
        system_prompt: updatedAgent.system_prompt,
        relationships: updatedAgent.relationships,
      };

      await Api.createAgent(agentRequest);

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  label: updatedAgent.id,
                  agentType: updatedAgent.agent_type,
                  description: updatedAgent.system_prompt,
                },
              }
            : node
        )
      );

      setAgents((prevAgents) =>
        prevAgents.map((agent) => (agent.id === id ? updatedAgent : agent))
      );

      setEdges((prevEdges) => {
        const filteredEdges = prevEdges.filter((edge) => edge.source !== id);
        const newEdges = updatedAgent.relationships.map((rel) => ({
          id: `e${id}-${rel.to_agent}`,
          source: id,
          target: rel.to_agent,
        }));
        return [...filteredEdges, ...newEdges];
      });

      setSelectedNode(null);
    } catch (error) {
      console.error("Failed to update agent:", error);
    }
  };

  const handleAddAgent = async (newAgent: Agent): Promise<void> => {
    try {
      const agentRequest: CreateAgentRequest = {
        id: newAgent.id,
        agent_type: newAgent.agent_type,
        system_prompt: newAgent.system_prompt,
        relationships: newAgent.relationships,
      };
      const createdAgent = await Api.createAgent(agentRequest);
      const position = calculateNodePosition(agents);

      const newNode: CustomNode = {
        id: createdAgent.id,
        type: "editable",
        position: position,
        data: {
          label: createdAgent.id,
          agentType: createdAgent.agent_type,
          description: createdAgent.system_prompt,
        },
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);
      setAgents((prevAgents) => [...prevAgents, createdAgent]);

      if (createdAgent.relationships && createdAgent.relationships.length > 0) {
        const newEdges: Edge[] = createdAgent.relationships.map((rel) => ({
          id: `e${createdAgent.id}-${rel.to_agent}`,
          source: createdAgent.id,
          target: rel.to_agent,
        }));
        setEdges((eds) => [...eds, ...newEdges]);
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const EditableNode = memo(
    ({ id, data }: { id: string; data: CustomNodeData }) => {
      return (
        <div className={Styles.editableNode}>
          <div className={Styles.editableNodeHeader}>
            <div>{data.label}</div>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                const agent = agents.find((a) => a.id === id);
                if (agent) {
                  setSelectedNode({ id, data: agent });
                  setIsDrawerOpen(true);
                }
              }}
              className={Styles.editableNodeIcon}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </div>
          {data.agentType && (
            <div className={Styles.editableNodeAgentType}>{data.agentType}</div>
          )}
          {data.model && (
            <div className={Styles.editableNodeModel}>Model: {data.model}</div>
          )}
          {data.description && (
            <div className={Styles.editableNodeDescription}>
              {data.description}
            </div>
          )}
          {/* Include both handles but only make them visible based on node type */}
          <Handle type="target" position={Position.Bottom} />
          <Handle type="source" position={Position.Top} />
        </div>
      );
    }
  );

  const nodeTypes = {
    editable: EditableNode,
  };

  const handleTaskSubmit = async (task: string) => {
    setIsTaskRunning(true);
    // Clear previous outputs only when starting a new task
    setTaskOutputs([
      {
        agent: "User",
        parsed_data: [
          { type: "human_message", content: [{ type: "text", text: task }] },
        ],
      },
    ]);

    try {
      const stream = Api.executeTaskStream({ task });
      for await (const step of stream) {
        setTaskOutputs((prev) => [
          ...prev,
          {
            agent: step.agent,
            parsed_data: step.parsed_data || [],
          },
        ]);
      }
    } catch (error: unknown) {
      console.error("Failed to execute task:", error);
      setTaskOutputs((prev) => [
        ...prev,
        {
          agent: "error",
          parsed_data: [
            {
              type: "error_message",
              content: [
                {
                  type: "text",
                  text: `Error processing task: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                },
              ],
            },
          ],
        },
      ]);
      setIsTaskRunning(false);
    }
  };

  const handleTaskComplete = useCallback(() => {
    setIsTaskRunning(false);
  }, []);

  // const handleDebugAgents = async () => {
  //   try {
  //     const response = await Api.getAgents();
  //     console.log("Current Agents:", response);
  //   } catch (error) {
  //     console.error("Failed to fetch agents for debug:", error);
  //   }
  // };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Loading Mask */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column', 
          gap: 2 
        }}
        open={isServerStarting}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">Starting server...</Typography>
      </Backdrop>
      
      {!apiKey ? (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
            p: 3,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Welcome to Team Synth
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            To get started, please enter your Anthropic API key. Don't have one?{" "}
            <Link
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get it here
            </Link>
          </Typography>
          <form onSubmit={handleApiKeySubmit}>
            <TextField
              fullWidth
              label="Anthropic API Key"
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={!tempApiKey.trim()}
            >
              Submit
            </Button>
          </form>
        </Box>
      ) : (
        <>
          {/* <Button
            variant="contained"
            startIcon={<BugReportIcon />}
            onClick={handleDebugAgents}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              zIndex: 1000,
            }}
            color="secondary"
          >
            Debug Agents
          </Button> */}

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
          >
            {nodes.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  color: "#666",
                  fontSize: "1.2rem",
                  userSelect: "none",
                }}
              >
                <p>Click the "Add Agent" button in the top right</p>
                <p>to start building your team!</p>
              </div>
            )}
          </ReactFlow>

          <AgentSidebar
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onAddAgent={handleAddAgent}
            onEditAgent={handleEditAgent}
            existingAgents={agents}
            editingNode={selectedNode}
          />

          <TaskPanel
            onSubmitTask={handleTaskSubmit}
            outputs={taskOutputs}
            existingAgents={agents}
            isTaskRunning={isTaskRunning}
            onTaskComplete={handleTaskComplete}
          />
        </>
      )}
    </div>
  );
};

export default TeamFlowBase;

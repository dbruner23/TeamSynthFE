import React, { useState, useEffect } from "react";
import {
  Drawer,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Agent, AgentType, AgentRelation } from "../data/Interfaces";

interface AgentFormData {
  id?: string;
  agent_type: AgentType;
  system_prompt: string;
  relationships: AgentRelation[];
}

interface AgentSidebarProps {
  open: boolean;
  onClose: () => void;
  onAddAgent: (agent: Agent) => void;
  onEditAgent?: (id: string, agent: Agent) => void;
  existingAgents: Agent[];
  editingNode?: { id: string; data: Agent } | null;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({
  open,
  onClose,
  onAddAgent,
  onEditAgent,
  existingAgents,
  editingNode,
}) => {
  const [agentData, setAgentData] = useState<AgentFormData>({
    agent_type: AgentType.SUPERVISOR,
    system_prompt: "",
    relationships: [],
  });

  console.log(agentData);

  // const models: string[] = ["GPT-4o", "Claude", "LLAMA", "Gemini"];

  useEffect(() => {
    if (editingNode) {
      setAgentData({
        agent_type: editingNode.data.agent_type,
        system_prompt: editingNode.data.system_prompt,
        relationships: editingNode.data.relationships || [],
      });
    } else {
      // Reset form when not editing
      setAgentData({
        agent_type:
          existingAgents.length === 0 ? AgentType.SUPERVISOR : AgentType.CODER,
        system_prompt: "",
        relationships: [],
      });
    }
  }, [editingNode, existingAgents.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (editingNode) {
      // Handle edit case
      const updatedAgent: Agent = {
        id: editingNode.id,
        ...agentData,
      };
      onEditAgent?.(editingNode.id, updatedAgent);
    } else {
      // Handle create case
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        ...agentData,
      };
      onAddAgent(newAgent);
    }

    setAgentData({
      agent_type:
        existingAgents.length === 0 ? AgentType.SUPERVISOR : AgentType.CODER,
      system_prompt: "",
      relationships: [],
    });
    onClose();
  };

  // const handleRelationshipChange = (
  //   event: SelectChangeEvent<unknown>
  // ): void => {
  //   const value = event.target.value as AgentRelation[];
  //   setAgentData({
  //     ...agentData,
  //     relationships: value,
  //   });
  // };

  // const hasSupervisor = (): boolean => {
  //   return existingAgents.some(
  //     (agent) => agent.agent_type === AgentType.SUPERVISOR
  //   );
  // };

  const isSupervisorNode = (): boolean => {
    return editingNode?.data.agent_type === AgentType.SUPERVISOR;
  };

  const agentTypeOptions = (() => {
    // If there are no agents or we're editing a supervisor node, only show SUPERVISOR
    if (existingAgents.length === 0 || isSupervisorNode()) {
      return [
        {
          value: AgentType.SUPERVISOR,
          label: "Supervisor",
        },
      ];
    }

    // If there's already a supervisor, show all types except SUPERVISOR
    return Object.values(AgentType)
      .filter((type) => type !== AgentType.SUPERVISOR)
      .map((type) => ({
        value: type,
        label: type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      }));
  })();

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ width: 400 }}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">
            {editingNode ? "Edit Agent" : "Create New Agent"}
          </Typography>
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Agent Type</InputLabel>
            <Select
              value={agentData.agent_type}
              onChange={(e) =>
                setAgentData({
                  ...agentData,
                  agent_type: e.target.value as AgentType,
                })
              }
              label="Agent Type"
            >
              {agentTypeOptions.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="System Prompt"
            value={agentData.system_prompt}
            onChange={(e) =>
              setAgentData({ ...agentData, system_prompt: e.target.value })
            }
            margin="normal"
            multiline
            rows={4}
            required
          />

          <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
            {editingNode ? "Save Changes" : "Create Agent"}
          </Button>
        </form>
      </Box>
    </Drawer>
  );
};

export default AgentSidebar;

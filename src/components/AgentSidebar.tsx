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
  SelectChangeEvent,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

interface Agent {
  id: string;
  title: string;
  description: string;
  model: string;
  relationships: string[];
}

interface AgentFormData {
  title: string;
  description: string;
  model: string;
  relationships: string[];
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
    title: "",
    description: "",
    model: "",
    relationships: [],
  });

  console.log(agentData);

  const models: string[] = ["GPT-4o", "Claude", "LLAMA", "Gemini"];

  useEffect(() => {
    if (editingNode) {
      setAgentData({
        title: editingNode.data.title,
        description: editingNode.data.description,
        model: editingNode.data.model,
        relationships: editingNode.data.relationships || [],
      });
    } else {
      // Reset form when not editing
      setAgentData({
        title: "",
        description: "",
        model: "",
        relationships: [],
      });
    }
  }, [editingNode]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (editingNode) {
      // Handle edit case
      const updatedAgent: Agent = {
        ...agentData,
        id: editingNode.id,
      };
      onEditAgent?.(editingNode.id, updatedAgent);
    } else {
      // Handle create case
      const newAgent: Agent = {
        ...agentData,
        id: `agent-${Date.now()}`,
      };
      onAddAgent(newAgent);
    }

    setAgentData({
      title: "",
      description: "",
      model: "",
      relationships: [],
    });
    onClose();
  };

  const handleRelationshipChange = (
    event: SelectChangeEvent<string[]>
  ): void => {
    setAgentData({
      ...agentData,
      relationships:
        typeof event.target.value === "string"
          ? [event.target.value]
          : event.target.value,
    });
  };

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
          <TextField
            fullWidth
            label="Agent Title"
            value={agentData.title}
            onChange={(e) =>
              setAgentData({ ...agentData, title: e.target.value })
            }
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Job Description"
            value={agentData.description}
            onChange={(e) =>
              setAgentData({ ...agentData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={4}
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Model</InputLabel>
            <Select
              value={agentData.model}
              onChange={(e) =>
                setAgentData({ ...agentData, model: e.target.value })
              }
              label="Model"
            >
              {models.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Relationships</InputLabel>
            <Select
              multiple
              value={agentData.relationships}
              onChange={handleRelationshipChange}
              label="Relationships"
            >
              {existingAgents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
            {editingNode ? "Save Changes" : "Create Agent"}
          </Button>
        </form>
      </Box>
    </Drawer>
  );
};

export default AgentSidebar;

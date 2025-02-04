import React, { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Collapse,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Agent } from "../data/Interfaces";

interface TaskOutput {
  agent: string;
  content: string;
}

interface TaskPanelProps {
  onSubmitTask: (task: string) => void;
  outputs: TaskOutput[];
  existingAgents: Agent[];
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  onSubmitTask,
  outputs,
  existingAgents,
}) => {
  const [task, setTask] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onSubmitTask(task.trim());
      setTask("");
    }
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: "12px 12px 0 0",
        boxShadow: 3,
      }}
    >
      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter your task here..."
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={existingAgents.length === 0}
            />
            <Button
              variant="contained"
              type="submit"
              disabled={!task.trim() || existingAgents.length === 0}
              sx={{ mb: 2 }}
            >
              Submit Task
            </Button>
          </form>

          <Box
            sx={{
              maxHeight: "200px",
              overflowY: "auto",
              bgcolor: "#f5f5f5",
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography variant="h6">Task Steps</Typography>
            {outputs.map((output, index) => (
              <Box key={index} sx={{ mt: 2, p: 1, border: "1px solid #ccc" }}>
                <Typography variant="subtitle2">
                  Agent: {output.agent}
                </Typography>
                <Typography variant="body2">{output.content}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TaskPanel;

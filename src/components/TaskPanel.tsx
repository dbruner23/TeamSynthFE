import React, { useState, useEffect } from "react";
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
import StopIcon from "@mui/icons-material/Stop";
import { Agent } from "../data/Interfaces";
import Api from "../data/Api";
import PythonVisualizer from "./PythonVisualizer";
// Import the shared TaskOutput interface
import { TaskOutput } from "../data/TaskInterfaces";

interface TaskPanelProps {
  onSubmitTask: (task: string) => void;
  outputs: TaskOutput[]; // Now using the shared interface
  existingAgents: Agent[];
  isTaskRunning: boolean;
  onTaskComplete: () => void;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  onSubmitTask,
  outputs,
  existingAgents,
  isTaskRunning,
  onTaskComplete,
}) => {
  const [task, setTask] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check the latest output for task completion
    if (outputs.length > 0) {
      const lastOutput = outputs[outputs.length - 1];
      if (
        lastOutput.agent === "supervisor" &&
        lastOutput.parsed_data &&
        lastOutput.parsed_data[0].content[0].text === "Task complete"
      ) {
        onTaskComplete();
      }
    }
  }, [outputs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onSubmitTask(task.trim());
      setTask("");
    }
  };

  const handleCancel = async () => {
    try {
      const response = await Api.cancelTask();
      if (response.content === "Task cancelled") {
        onTaskComplete();
      }
    } catch (error) {
      console.error("Failed to cancel task:", error);
    }
  };

  const renderContent = (parsed_data: TaskOutput[]) => {
    const elements: JSX.Element[] = [];

    parsed_data.forEach((item: TaskOutput, index: number) => {
      // Render text content
      if (item.content) {
        item.content.forEach((item, index) => {
          if (item.type === "text") {
            elements.push(
              <React.Fragment key={`text-${index}`}>
                {item.text.split("\n").map((line, lineIndex) => (
                  <Typography
                    key={`${index}-${lineIndex}`}
                    variant="body2"
                    sx={{ mb: 1 }}
                  >
                    {line}
                  </Typography>
                ))}
              </React.Fragment>
            );
          }
        });
      }

      // Render code blocks
      if (item.tool_calls?.length > 0) {
        const toolCall = item.tool_calls[0];
        if (toolCall.tool_name === "plot_data_tool") {
          elements.push(
            <Box key={`code-${index}`} sx={{ mt: 2, mb: 2 }}>
              <PythonVisualizer pythonCode={toolCall.input.code} />
            </Box>
          );
        } else if (toolCall.tool_name === "publish_code_tool") {
          elements.push(
            <pre key={`code-${index}`}>
              <code>{toolCall.input.code}</code>
            </pre>
          );
        }
      }
    });

    return elements;
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
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter your task here..."
                variant="outlined"
                disabled={existingAgents.length === 0 || isTaskRunning}
              />
              {isTaskRunning ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancel}
                  startIcon={<StopIcon />}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!task.trim() || existingAgents.length === 0}
                >
                  Submit Task
                </Button>
              )}
            </Box>
          </form>

          {/* Add default visualization for testing */}
          {/* <Box sx={{ my: 2 }}>
            <Typography variant="h6">Test Visualization</Typography>
            <PythonVisualizer />
          </Box> */}

          <Box
            sx={{
              maxHeight: "50vh",
              height: "50vh",
              overflowY: "auto",
              bgcolor: "#f5f5f5",
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography variant="h6">Task Steps</Typography>
            {outputs.map(
              (output, index) =>
                output.agent && (
                  <Box
                    key={index}
                    sx={{ mt: 2, p: 1, border: "1px solid #ccc" }}
                  >
                    <Typography variant="subtitle2">
                      Agent: {output.agent}
                    </Typography>
                    {renderContent(output.parsed_data)}
                  </Box>
                )
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TaskPanel;

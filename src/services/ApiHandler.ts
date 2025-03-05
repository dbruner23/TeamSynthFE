import axios from "axios";
import {
  Agent,
  CreateAgentRequest,
  ExecuteTaskRequest,
  AgentResponse,
  AgentsResponse,
  ExecuteTaskResponse,
} from "../data/Interfaces";
import { TaskCancellationResponse } from "../data/TaskInterfaces";

const api = axios.create({
  baseURL: "http://localhost:5000/api", //"https://teamsynthbe.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

let currentSessionId: string | null = null;

// Add session ID to request headers if available
api.interceptors.request.use((config) => {
  if (currentSessionId) {
    config.headers["X-Session-ID"] = currentSessionId;
  }
  return config;
});

export const setApiKey = async (apiKey: string) => {
  try {
    const response = await api.post("/set_api_key", { api_key: apiKey });
    const data = response.data;
    if (response.headers['x-session-id']) {
      currentSessionId = response.headers['x-session-id'];
    } else if (response.data.session_id) {
      currentSessionId = response.data.session_id;
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to set API key");
    }
    throw error;
  }
};

export const createAgent = async (
  agentData: CreateAgentRequest
): Promise<AgentResponse> => {
  try {
    const response = await api.post("/agents", agentData);
    const data = response.data as AgentResponse;
    if (data.session_id) {
      currentSessionId = data.session_id;
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to create agent");
    }
    throw error;
  }
};

export const executeTask = async (
  taskData: ExecuteTaskRequest
): Promise<ExecuteTaskResponse> => {
  try {
    const response = await api.post("/execute", taskData);
    const data = response.data as ExecuteTaskResponse;
    if (data.session_id) {
      currentSessionId = data.session_id;
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to execute task");
    }
    throw error;
  }
};

export const executeTaskStream = async function* (
  taskData: ExecuteTaskRequest
) {
  try {
    const response = await fetch(`${api.defaults.baseURL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(currentSessionId && { "X-Session-ID": currentSessionId }),
      },
      credentials: 'include',
      body: JSON.stringify(taskData),
    });

    // Check for session ID in response headers
    const responseSessionId = response.headers.get('x-session-id');
    if (responseSessionId) {
      currentSessionId = responseSessionId;
    }

    if (!response.body) {
      throw new Error("No response body received");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf("\n\n");

      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);

        if (chunk.startsWith("data:")) {
          const jsonStr = chunk.slice(5).trim();
          yield JSON.parse(jsonStr);
        }
        boundary = buffer.indexOf("\n\n");
      }
    }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Stream error occurred"
    );
  }
};

export const getAgents = async (): Promise<Agent[]> => {
  try {
    const response = await api.get("/agents");
    const data = response.data as AgentsResponse;
    if (data.session_id) {
      currentSessionId = data.session_id;
    }
    return data.agents;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to get agents");
    }
    throw error;
  }
};

export async function cancelTask(): Promise<TaskCancellationResponse> {
  const response = await fetch(`${api.defaults.baseURL}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(currentSessionId && { "X-Session-ID": currentSessionId }),
    },
    credentials: 'include',
  });

  // Check for session ID in response headers
  const responseSessionId = response.headers.get('x-session-id');
  if (responseSessionId) {
    currentSessionId = responseSessionId;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to cancel task: ${response.status} ${errorText}`);
  }

  return (await response.json()) as TaskCancellationResponse;
}

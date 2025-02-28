import {
  setApiKey,
  createAgent,
  executeTask,
  getAgents,
  executeTaskStream,
  cancelTask,
} from "../services/ApiHandler";
import { Agent, CreateAgentRequest, ExecuteTaskRequest } from "./Interfaces";
import { TaskCancellationResponse } from "./TaskInterfaces";

const Api = {
  setApiKey: async (apiKey: string): Promise<void> => {
    try {
      await setApiKey(apiKey);
    } catch (error) {
      console.error("Failed to set API key:", error);
      throw error;
    }
  },

  createAgent: async (agentData: CreateAgentRequest): Promise<Agent> => {
    try {
      const response = await createAgent(agentData);
      return response;
    } catch (error) {
      console.error("Failed to create agent:", error);
      throw error;
    }
  },

  executeTask: async (taskData: ExecuteTaskRequest): Promise<any> => {
    try {
      return await executeTask(taskData);
    } catch (error) {
      console.error("Failed to execute task:", error);
      throw error;
    }
  },

  executeTaskStream: async function* (taskData: ExecuteTaskRequest) {
    try {
      yield* executeTaskStream(taskData);
    } catch (error) {
      console.error("Failed to execute streaming task:", error);
      throw error;
    }
  },

  getAgents: async (): Promise<Agent[]> => {
    try {
      return await getAgents();
    } catch (error) {
      console.error("Failed to get agents:", error);
      throw error;
    }
  },

  cancelTask: async (): Promise<TaskCancellationResponse> => {
    try {
      return await cancelTask();
    } catch (error) {
      console.error("Failed to cancel task:", error);
      throw error;
    }
  },
};

export default Api;

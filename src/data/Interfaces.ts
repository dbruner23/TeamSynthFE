// Enums to match Python backend
export enum AgentType {
  SUPERVISOR = "supervisor",
  WEB_RESEARCHER = "web_researcher",
  CODER = "coder",
  WRITER = "writer",
  DATA_SCIENTIST = "data_scientist",
  STEM_EXPERT = "stem_expert",
}

export enum RelationType {
  SUPERVISES = "supervises",
  REPORTS_TO = "reports_to",
  COLLBORATES = "collaborates_with",
}

// Interfaces
export interface AgentRelation {
  // Add relationship properties based on your AgentRelation class
  relation_type: RelationType;
  to_agent: string;
  from_agent: string;
}

export interface Agent {
  id: string;
  agent_type: AgentType;
  system_prompt: string;
  relationships: AgentRelation[];
}

export interface CreateAgentRequest {
  id: string;
  agent_type: AgentType;
  system_prompt: string;
  relationships?: AgentRelation[];
}

export interface SessionResponse {
  session_id: string;
}

export interface AgentResponse extends Agent, SessionResponse {}

export interface AgentsResponse extends SessionResponse {
  agents: Agent[];
}

export interface ExecuteTaskRequest {
  task: string;
}

export interface ExecuteTaskResponse extends SessionResponse {
  results: Array<{
    agentId: string;
    output: string;
  }>;
}

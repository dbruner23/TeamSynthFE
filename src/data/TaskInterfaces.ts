export interface ContentItem {
  type: string;
  text?: string;
  // Add other potential properties that might exist in content items
}

export interface ParsedData {
  type: string;
  content: ContentItem[] | null;
  text?: string;
  code?: string;
  language?: string;
  tool_calls?: ToolCall[] | null;
}

export interface ToolCall {
  tool_name: string;
  input: {
    code?: string;
    [key: string]: any;
  };
  // Add other properties that might exist in tool calls
}

export interface TaskOutput {
  id?: string;
  agent: string;
  type?: string;
  content?: string;
  code_blocks?: string[];
  parsed_data: ParsedData[];
  timestamp?: string;
}

export interface TaskCancellationResponse {
  agent: string;
  content: string;
  timestamp: string;
}
